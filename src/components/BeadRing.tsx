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
 * The prayer rope: beads arranged on a circle. You tell one bead by tracing a
 * full circle around the rope with one finger — a complete revolution advances
 * a single bead, reversing the loop retreats one. Partial circles are banked
 * and carry across separate strokes, so you can close a circle over several
 * finger movements. The arrow keys and the Previous/Next buttons remain for
 * keyboard and accessibility. Beads start at twelve o'clock and run clockwise.
 */
export function BeadRing({ count, activeIndex, lang, onStep }: Props) {
  const ringRef = useRef<HTMLDivElement>(null);
  // The active stroke's last pointer angle; null between strokes.
  const drag = useRef<{ last: number } | null>(null);
  // Banked rotation toward the next bead — persists across separate strokes.
  const acc = useRef(0);
  const [size, setSize] = useState(360);
  // Signed fraction (-1..1) of the current revolution traced so far, for the
  // progress arc. Resets only when a bead ticks over; held between strokes.
  const [turn, setTurn] = useState(0);

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

  function angleAt(clientX: number, clientY: number): number {
    const rect = ringRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { last: angleAt(e.clientX, e.clientY) };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const a = angleAt(e.clientX, e.clientY);
    let delta = a - d.last;
    if (delta > Math.PI) delta -= TAU;
    if (delta < -Math.PI) delta += TAU;
    d.last = a;
    let next = acc.current + delta;
    // One whole revolution of the rope tells exactly one bead.
    while (next >= TAU) {
      onStep(1);
      next -= TAU;
    }
    while (next <= -TAU) {
      onStep(-1);
      next += TAU;
    }
    acc.current = next;
    setTurn(next / TAU);
  }

  function endDrag(e: React.PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current = null;
    // Partial progress is kept — the next stroke continues the same circle.
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
        <div className="ring__center" aria-hidden="true">
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
