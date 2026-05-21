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
  /** Jump directly to a tapped bead. */
  onJump: (index: number) => void;
}

const TAU = Math.PI * 2;
/** Bead-centre radius as a fraction of the ring's box. */
const RADIUS_PCT = 42;

/**
 * The prayer rope: beads arranged on a circle. You advance by spinning a
 * finger around the ring (each bead-step of rotation ticks one bead), by
 * tapping a bead to jump to it, by tapping the centre to go forward, or with
 * the arrow keys. Beads start at twelve o'clock and run clockwise.
 */
export function BeadRing({ count, activeIndex, lang, onStep, onJump }: Props) {
  const ringRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ last: number; acc: number } | null>(null);
  const [size, setSize] = useState(360);

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
    drag.current = { last: angleAt(e.clientX, e.clientY), acc: 0 };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const a = angleAt(e.clientX, e.clientY);
    let delta = a - d.last;
    if (delta > Math.PI) delta -= TAU;
    if (delta < -Math.PI) delta += TAU;
    d.acc += delta;
    d.last = a;
    const stepAngle = TAU / count;
    while (d.acc >= stepAngle) {
      onStep(1);
      d.acc -= stepAngle;
    }
    while (d.acc <= -stepAngle) {
      onStep(-1);
      d.acc += stepAngle;
    }
  }

  function endDrag(e: React.PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current = null;
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
      <button
        key={i}
        type="button"
        className="bead"
        data-active={active || undefined}
        aria-label={`${t('beadAria', lang)} ${i + 1}`}
        aria-current={active ? 'true' : undefined}
        onClick={() => onJump(i)}
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
        <button
          type="button"
          className="ring__center"
          onClick={() => onStep(1)}
          tabIndex={-1}
          aria-label={t('nextBeadAria', lang)}
        >
          <span className="ring__count">{activeIndex + 1}</span>
          <span className="ring__total">/ {count}</span>
        </button>
        {beads}
        <span className="ring__cross" aria-hidden="true">
          <Cross />
        </span>
      </div>
    </div>
  );
}
