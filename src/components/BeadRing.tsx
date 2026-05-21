import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Lang } from '../types';
import { t } from '../i18n/strings';
import { Cross } from './Ornament';

interface Props {
  count: number;
  activeIndex: number;
  lang: Lang;
  /** Advance (+1) or retreat (-1) by one bead. */
  onStep: (dir: 1 | -1) => void;
}

const TAU = Math.PI * 2;
/** Bead-centre radius as a fraction of the ring's box. */
const RADIUS_PCT = 42;
/**
 * Pointer offsets nearer than this fraction of the box have no reliable
 * bearing, so the stick's angle is held rather than tracked — this is the
 * joystick's dead-centre.
 */
const DEAD_ZONE_PCT = 6;
/** How far the joystick knob may throw from centre, as a fraction of the box. */
const MAX_THROW_PCT = 9;

/**
 * The prayer rope: beads arranged on a circle, told with a joystick at its
 * heart. Press the centre and circle it round like a thumb-stick — the knob
 * leans toward your finger and a complete revolution tells a single bead,
 * reversing the loop retreats one. Only one bead is told per grip: once it
 * ticks over, further turning is ignored until you lift and grip again, so a
 * frantic spin can't run away. A partial circle banks as a progress arc and
 * carries to the next grip, so a circle may be closed over several strokes.
 * The arrow keys and the Previous/Next buttons remain for keyboard and
 * accessibility. Beads start at twelve o'clock and run clockwise.
 */
export function BeadRing({ count, activeIndex, lang, onStep }: Props) {
  const ringRef = useRef<HTMLDivElement>(null);
  // The active stroke's last stick angle and whether its one bead is spent;
  // null between strokes.
  const drag = useRef<{ last: number; stepped: boolean } | null>(null);
  // Banked rotation toward the next bead — persists across separate strokes.
  const acc = useRef(0);
  const [size, setSize] = useState(360);
  // Signed fraction (-1..1) of the current revolution traced so far, for the
  // progress arc. Resets only when a bead ticks over; held between strokes.
  const [turn, setTurn] = useState(0);
  // Knob throw from centre in pixels — the joystick's visible lean.
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [held, setHeld] = useState(false);

  // Track the ring's pixel size so beads can be scaled to fit the count.
  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setSize(w);
    });
    ro.observe(el);
    setSize(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const radiusPx = (size * RADIUS_PCT) / 100;
  const gap = (TAU * radiusPx) / count; // arc length between bead centres
  const beadSize = Math.max(7, Math.min(30, gap * 0.72));

  /** Pointer position relative to the ring's centre, in polar + cartesian form. */
  function vectorAt(clientX: number, clientY: number) {
    const rect = ringRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    return { dx, dy, dist: Math.hypot(dx, dy), angle: Math.atan2(dy, dx), box: rect.width };
  }

  /** Lean the knob toward the pointer, clamped to the stick's throw. */
  function leanKnob(dx: number, dy: number, dist: number, box: number) {
    const maxPx = (box * MAX_THROW_PCT) / 100;
    const k = dist > maxPx ? maxPx / dist : 1;
    setKnob({ x: dx * k, y: dy * k });
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const v = vectorAt(e.clientX, e.clientY);
    drag.current = { last: v.angle, stepped: false };
    setHeld(true);
    leanKnob(v.dx, v.dy, v.dist, v.box);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const v = vectorAt(e.clientX, e.clientY);
    leanKnob(v.dx, v.dy, v.dist, v.box);
    // Too near dead-centre to read a bearing: hold the angle this frame.
    if (v.dist < (v.box * DEAD_ZONE_PCT) / 100) return;
    // Stay synced to the stick even after this grip's bead is spent, so a fresh
    // grip doesn't jump from a stale angle.
    const from = d.last;
    d.last = v.angle;
    // One bead per grip: ignore any further turning until the finger lifts.
    if (d.stepped) return;
    let delta = v.angle - from;
    if (delta > Math.PI) delta -= TAU;
    if (delta < -Math.PI) delta += TAU;
    const next = acc.current + delta;
    // A whole revolution tells one bead, then the grip is spent and the
    // overshoot is dropped rather than banked, so the spin can't run on.
    if (next >= TAU) {
      onStep(1);
      acc.current = 0;
      d.stepped = true;
    } else if (next <= -TAU) {
      onStep(-1);
      acc.current = 0;
      d.stepped = true;
    } else {
      acc.current = next;
    }
    setTurn(d.stepped ? 0 : acc.current / TAU);
  }

  function endDrag(e: React.PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current = null;
    setHeld(false);
    // The stick springs back to centre; partial progress is kept, so the next
    // stroke continues the same circle.
    setKnob({ x: 0, y: 0 });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (['ArrowRight', 'ArrowUp', ' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      onStep(1);
    } else if (['ArrowLeft', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      onStep(-1);
    }
  }

  const beads = Array.from({ length: count }, (_, i) => {
    const theta = -Math.PI / 2 + (i / count) * TAU;
    const x = 50 + RADIUS_PCT * Math.cos(theta);
    const y = 50 + RADIUS_PCT * Math.sin(theta);
    const active = i === activeIndex;
    return (
      <span
        key={i}
        className="bead"
        data-active={active || undefined}
        aria-hidden="true"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${beadSize}px`,
          height: `${beadSize}px`,
        }}
      />
    );
  });

  return (
    <div className="ring-wrap">
      <div
        ref={ringRef}
        className="ring"
        role="slider"
        tabIndex={0}
        aria-label={t('ropeAria', lang)}
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={activeIndex + 1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <svg className="ring__cord" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={RADIUS_PCT} />
        </svg>
        <svg className="ring__turn" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r={RADIUS_PCT}
            pathLength={1}
            style={{ strokeDasharray: `${Math.min(Math.abs(turn), 1)} 1` }}
          />
        </svg>
        <div
          className={`ring__center${held ? ' is-held' : ''}`}
          aria-hidden="true"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        >
          <span className="ring__count">{activeIndex + 1}</span>
          <span className="ring__total">/ {count}</span>
        </div>
        {beads}
        <span className="ring__cross" aria-hidden="true">
          <Cross />
        </span>
      </div>
    </div>
  );
}
