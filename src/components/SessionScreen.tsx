import { useEffect, useRef, useState } from 'react';
import type { Lang, SessionConfig } from '../types';
import { t } from '../i18n/strings';
import { loc } from '../i18n/loc';
import { getPrayer } from '../data/prayers';
import { BeadRing } from './BeadRing';
import { PrayerCard } from './PrayerCard';
import { LangSelector } from './LangSelector';

const PROGRESS_KEY = 'rosary:progress';

interface Props {
  lang: Lang;
  config: SessionConfig;
  onLangChange: (lang: Lang) => void;
  onExit: () => void;
}

interface Progress {
  index: number;
  laps: number;
}

/** Restore progress only if it belongs to the same prayer and bead count. */
function loadProgress(config: SessionConfig): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (
        p.prayerId === config.prayerId &&
        p.beadCount === config.beadCount &&
        typeof p.index === 'number' &&
        typeof p.laps === 'number' &&
        p.index >= 0 &&
        p.index < config.beadCount
      ) {
        return { index: p.index, laps: p.laps };
      }
    }
  } catch {
    /* corrupt or unavailable storage — start fresh */
  }
  return { index: 0, laps: 0 };
}

export function SessionScreen({ lang, config, onLangChange, onExit }: Props) {
  const prayer = getPrayer(config.prayerId);
  const [{ index, laps }, setProgress] = useState<Progress>(() => loadProgress(config));
  const [flash, setFlash] = useState(false);
  const prevLaps = useRef(laps);

  useEffect(() => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        prayerId: config.prayerId,
        beadCount: config.beadCount,
        index,
        laps,
      }),
    );
  }, [config.prayerId, config.beadCount, index, laps]);

  // Flash a "circuit complete" notice whenever a new lap begins.
  useEffect(() => {
    if (laps > prevLaps.current) {
      setFlash(true);
      const id = window.setTimeout(() => setFlash(false), 2400);
      prevLaps.current = laps;
      return () => window.clearTimeout(id);
    }
    prevLaps.current = laps;
  }, [laps]);

  const step = (dir: 1 | -1) =>
    setProgress((prev) => {
      let next = prev.index + dir;
      let nextLaps = prev.laps;
      if (next >= config.beadCount) {
        next = 0;
        nextLaps += 1;
      } else if (next < 0) {
        next = config.beadCount - 1;
        nextLaps = Math.max(0, nextLaps - 1);
      }
      return { index: next, laps: nextLaps };
    });

  const reset = () => {
    prevLaps.current = 0;
    setFlash(false);
    setProgress({ index: 0, laps: 0 });
  };

  return (
    <div className="session">
      <header className="session__bar">
        <button type="button" className="ghost-btn" onClick={onExit}>
          ‹ {t('backToSetup', lang)}
        </button>
        <div className="session__meta">
          <span className="session__prayer">{loc(prayer.name, lang)}</span>
          <span className="session__progress">
            {t('beadLabel', lang)} {index + 1} / {config.beadCount}
            {laps > 0 ? ` · ${t('circuitsLabel', lang)} ${laps}` : ''}
          </span>
        </div>
        <LangSelector lang={lang} onChange={onLangChange} />
      </header>

      <div
        className={`session__flash${flash ? ' is-on' : ''}`}
        role="status"
        aria-live="polite"
      >
        {flash ? t('circuitComplete', lang) : ''}
      </div>

      <BeadRing
        count={config.beadCount}
        activeIndex={index}
        lang={lang}
        onStep={step}
      />

      <p className="spin-hint">{t('spinHint', lang)}</p>

      <PrayerCard prayer={prayer} lang={lang} />

      <div className="controls">
        <button
          type="button"
          className="control-btn"
          onClick={() => step(-1)}
          aria-label={t('prevBeadAria', lang)}
        >
          ‹ {t('previous', lang)}
        </button>
        <button type="button" className="control-btn control-btn--reset" onClick={reset}>
          {t('reset', lang)}
        </button>
        <button
          type="button"
          className="control-btn control-btn--next"
          onClick={() => step(1)}
          aria-label={t('nextBeadAria', lang)}
        >
          {t('next', lang)} ›
        </button>
      </div>
    </div>
  );
}
