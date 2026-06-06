import { useEffect, useRef, useState } from 'react';
import type { Lang, PracticeSettings, SessionConfig } from '../types';
import { t } from '../i18n/strings';
import { loc } from '../i18n/loc';
import { getPrayer } from '../data/prayers';
import { getPracticeForm, CUSTOM_FORM_ID } from '../data/practiceForms';
import { useAmbientMixer, LAYER_FILES } from '../audio/useAmbientMixer';
import { BeadRing } from './BeadRing';
import { BreathGuide } from './BreathGuide';
import { PracticeNote } from './PracticeNote';
import { PrayerCard } from './PrayerCard';
import { LangSelector } from './LangSelector';

const PROGRESS_KEY = 'rosary:progress';

interface Props {
  lang: Lang;
  config: SessionConfig;
  practice: PracticeSettings;
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

export function SessionScreen({ lang, config, practice, onLangChange, onExit }: Props) {
  const prayer = getPrayer(config.prayerId);
  const [{ index, laps }, setProgress] = useState<Progress>(() => loadProgress(config));
  const [flash, setFlash] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const prevLaps = useRef(laps);
  const mixer = useAmbientMixer();

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

  // Flash a "circuit complete" notice whenever a new lap begins; sound a soft
  // tap there too, if asked. The tap is driven by the counter — it never moves it.
  useEffect(() => {
    if (laps > prevLaps.current) {
      setFlash(true);
      if (practice.tapOn) mixer.playTap();
      const id = window.setTimeout(() => setFlash(false), 2400);
      prevLaps.current = laps;
      return () => window.clearTimeout(id);
    }
    prevLaps.current = laps;
  }, [laps, practice.tapOn, mixer]);

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

  const form = getPracticeForm(practice.formId);
  const inhaleText =
    practice.formId === CUSTOM_FORM_ID ? practice.customInhale.trim() : form ? loc(form.inhale, lang) : '';
  const exhaleText =
    practice.formId === CUSTOM_FORM_ID ? practice.customExhale.trim() : form ? loc(form.exhale, lang) : '';

  // Begin breathing — the user gesture that lets us resume the audio context
  // (autoplay policy) and start the chosen ambient layers.
  const beginBreathing = async () => {
    await mixer.resume();
    for (const id of Object.keys(LAYER_FILES)) {
      const layer = practice.layers[id];
      if (!layer) continue;
      mixer.setVolume(id, layer.volume);
      mixer.setLayer(id, layer.on);
    }
    setBreathing(true);
  };

  const closeBreathing = () => {
    void mixer.fadeOutAll(1800);
    setBreathing(false);
  };

  // A bounded session reached its end: a soft tone, then fade gently away.
  const onBoundEnd = () => {
    if (practice.tapOn) mixer.playTap(0.5);
    void mixer.fadeOutAll(2200);
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

      <button type="button" className="breath-begin" onClick={beginBreathing}>
        {t('breathBegin', lang)}
      </button>

      <PrayerCard prayer={prayer} lang={lang} />

      {breathing && (
        <>
          <BreathGuide
            lang={lang}
            inhaleText={inhaleText}
            exhaleText={exhaleText}
            inhaleMs={practice.inhaleMs}
            holdMs={practice.holdMs}
            exhaleMs={practice.exhaleMs}
            hapticsOn={practice.hapticsOn}
            syncToCounter={practice.syncToCounter}
            bound={practice.bound}
            onCycleComplete={() => step(1)}
            onEnd={onBoundEnd}
            onClose={closeBreathing}
          />
          <PracticeNote lang={lang} />
        </>
      )}

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
