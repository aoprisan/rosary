import { useEffect, useRef, useState } from 'react';
import type { Lang, SessionBound } from '../types';
import { t } from '../i18n/strings';
import { buzz } from '../util/haptics';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useWakeLock } from '../hooks/useWakeLock';

interface Props {
  lang: Lang;
  /** Phrase rested on while breathing in (empty falls back to the phase word). */
  inhaleText: string;
  exhaleText: string;
  inhaleMs: number;
  holdMs: number;
  exhaleMs: number;
  hapticsOn: boolean;
  syncToCounter: boolean;
  bound: SessionBound;
  /** Called on each completed breath when sync is on — wire to step(+1). */
  onCycleComplete: () => void;
  /** Called once when a bounded session reaches its end (for the audio fade). */
  onEnd: () => void;
  /** Dismiss the breath guide and return to the rope. */
  onClose: () => void;
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

/** The form's smallest scale, at full exhale. */
const REST = 0.6;
/** Sine ease-in-out, matching the spirit of --ease-in-out-sine. */
const ease = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p);

interface Frame {
  phase: Phase;
  scale: number;
}

function computeFrame(tInCycle: number, inhaleMs: number, holdMs: number, exhaleMs: number): Frame {
  let t = tInCycle;
  if (t < inhaleMs) {
    return { phase: 'inhale', scale: REST + (1 - REST) * ease(t / inhaleMs) };
  }
  t -= inhaleMs;
  if (holdMs > 0) {
    if (t < holdMs) return { phase: 'hold-in', scale: 1 };
    t -= holdMs;
  }
  if (t < exhaleMs) {
    return { phase: 'exhale', scale: 1 - (1 - REST) * ease(t / exhaleMs) };
  }
  return { phase: 'hold-out', scale: REST };
}

/**
 * A calm breath guide: a single form that expands on the inhale and contracts
 * on the exhale, the prayer's two halves resting on each. One requestAnimationFrame
 * loop is the clock — it eases the form's scale, switches the phrase, fires a
 * gentle pulse at each turn, and (when asked) advances the rope one knot per
 * completed breath. Under "reduce motion" the form holds still and only the
 * phrase changes. The session ends softly when its bound is reached.
 */
export function BreathGuide({
  lang,
  inhaleText,
  exhaleText,
  inhaleMs,
  holdMs,
  exhaleMs,
  hapticsOn,
  syncToCounter,
  bound,
  onCycleComplete,
  onEnd,
  onClose,
}: Props) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [breaths, setBreaths] = useState(0);
  const [ended, setEnded] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);
  useWakeLock(!ended);

  // Live config, read inside the loop so identity churn never resets the breath.
  const cfg = useRef({ inhaleMs, holdMs, exhaleMs, hapticsOn, syncToCounter, bound });
  cfg.current = { inhaleMs, holdMs, exhaleMs, hapticsOn, syncToCounter, bound };
  const cb = useRef({ onCycleComplete, onEnd });
  cb.current = { onCycleComplete, onEnd };

  useEffect(() => {
    if (ended) return;
    const start = performance.now();
    let lastPhase: Phase | null = null;
    let lastCycle = 0;
    let raf = 0;

    const tick = (now: number) => {
      const { inhaleMs, holdMs, exhaleMs, hapticsOn, syncToCounter, bound } = cfg.current;
      const cycleMs = inhaleMs + exhaleMs + (holdMs > 0 ? holdMs * 2 : 0);
      const elapsed = now - start;

      const cycle = Math.floor(elapsed / cycleMs);
      if (cycle > lastCycle) {
        lastCycle = cycle;
        setBreaths(cycle);
        if (syncToCounter) cb.current.onCycleComplete();
        if (bound.kind === 'knots' && cycle >= bound.count) {
          setEnded(true);
          cb.current.onEnd();
          return;
        }
      }
      if (bound.kind === 'duration' && elapsed >= bound.minutes * 60_000) {
        setEnded(true);
        cb.current.onEnd();
        return;
      }

      const { phase, scale } = computeFrame(elapsed % cycleMs, inhaleMs, holdMs, exhaleMs);
      if (!reduced && orbRef.current) {
        orbRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }
      if (phase !== lastPhase) {
        lastPhase = phase;
        setPhase(phase);
        if (hapticsOn && (phase === 'inhale' || phase === 'exhale')) buzz(12);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ended, reduced]);

  const breathingIn = phase === 'inhale' || phase === 'hold-in';
  const holding = phase === 'hold-in' || phase === 'hold-out';
  const phrase = breathingIn ? inhaleText : exhaleText;
  const phaseWord = holding ? t('hold', lang) : breathingIn ? t('inhale', lang) : t('exhale', lang);

  return (
    <section className="breath" role="group" aria-label={t('breathAria', lang)}>
      {ended ? (
        <div className="breath__end">
          <p className="breath__amen">{t('breathEnd', lang)}</p>
          <button type="button" className="control-btn" onClick={onClose}>
            {t('backToSetup', lang)}
          </button>
        </div>
      ) : (
        <>
          {!reduced && (
            <div className="breath__halo" aria-hidden="true">
              <div ref={orbRef} className={`breath__form breath__form--${breathingIn ? 'in' : 'out'}`} />
            </div>
          )}
          <p className="breath__phase">{phaseWord}</p>
          <p className="breath__phrase" aria-live="polite">
            {phrase || phaseWord}
          </p>
          {breaths > 0 && (
            <p className="breath__count" aria-live="off">
              {breaths} {t('knotsUnit', lang)}
            </p>
          )}
          <button type="button" className="ghost-btn breath__stop" onClick={onClose}>
            {t('breathStop', lang)}
          </button>
        </>
      )}
    </section>
  );
}
