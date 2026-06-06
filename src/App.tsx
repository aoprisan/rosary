import { useEffect, useState } from 'react';
import type { Lang, LayerSetting, Mode, PracticeSettings, Screen, SessionBound } from './types';
import { SetupScreen } from './components/SetupScreen';
import { SessionScreen } from './components/SessionScreen';
import { BreathingScreen } from './components/BreathingScreen';
import { DEFAULT_PRAYER_ID } from './data/prayers';
import { DEFAULT_FORM_ID } from './data/practiceForms';
import { t } from './i18n/strings';
import { Ornament, Cross } from './components/Ornament';
import { LangSelector } from './components/LangSelector';

const LANG_KEY = 'rosary:lang';
const BEADS_KEY = 'rosary:beads';
const PRAYER_KEY = 'rosary:prayer';
const PRACTICE_KEY = 'rosary:practice';
const MODE_KEY = 'rosary:mode';

const DEFAULT_PRACTICE: PracticeSettings = {
  formId: DEFAULT_FORM_ID,
  customInhale: '',
  customExhale: '',
  inhaleMs: 4000,
  holdMs: 0,
  exhaleMs: 6000,
  layers: {
    'ison-drone': { on: false, volume: 0.5 },
    chant: { on: false, volume: 0.4 },
  },
  tapOn: false,
  hapticsOn: false,
  syncToCounter: false,
  bound: { kind: 'open' },
};

function detectInitialLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === 'ro' || stored === 'en') return stored;
  const nav = navigator.language?.toLowerCase() ?? '';
  return nav.startsWith('ro') ? 'ro' : 'en';
}

function initialBeads(): number {
  const n = Number(localStorage.getItem(BEADS_KEY));
  return Number.isFinite(n) && n >= 1 && n <= 300 ? Math.round(n) : 33;
}

function clampMs(v: unknown, fallback: number, min = 1000): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(20_000, Math.round(v))) : fallback;
}

function validateLayers(raw: unknown): Record<string, LayerSetting> {
  const out: Record<string, LayerSetting> = {};
  for (const id of Object.keys(DEFAULT_PRACTICE.layers)) {
    const def = DEFAULT_PRACTICE.layers[id];
    const src = (raw as Record<string, unknown> | null)?.[id] as Partial<LayerSetting> | undefined;
    const volume =
      typeof src?.volume === 'number' && src.volume >= 0 && src.volume <= 1 ? src.volume : def.volume;
    out[id] = { on: src?.on === true, volume };
  }
  return out;
}

function validateBound(raw: unknown): SessionBound {
  const b = raw as Partial<SessionBound> | null;
  if (b?.kind === 'knots' && typeof b.count === 'number' && b.count >= 1) {
    return { kind: 'knots', count: Math.round(b.count) };
  }
  if (b?.kind === 'duration' && typeof b.minutes === 'number' && b.minutes >= 1) {
    return { kind: 'duration', minutes: Math.round(b.minutes) };
  }
  return { kind: 'open' };
}

/** Restore Practice settings defensively, falling back per field to the defaults. */
function initialPractice(): PracticeSettings {
  try {
    const raw = localStorage.getItem(PRACTICE_KEY);
    if (!raw) return DEFAULT_PRACTICE;
    const p = JSON.parse(raw) as Partial<PracticeSettings>;
    return {
      formId: typeof p.formId === 'string' ? p.formId : DEFAULT_PRACTICE.formId,
      customInhale: typeof p.customInhale === 'string' ? p.customInhale : '',
      customExhale: typeof p.customExhale === 'string' ? p.customExhale : '',
      inhaleMs: clampMs(p.inhaleMs, DEFAULT_PRACTICE.inhaleMs),
      holdMs: clampMs(p.holdMs, DEFAULT_PRACTICE.holdMs, 0),
      exhaleMs: clampMs(p.exhaleMs, DEFAULT_PRACTICE.exhaleMs),
      layers: validateLayers(p.layers),
      tapOn: p.tapOn === true,
      hapticsOn: p.hapticsOn === true,
      syncToCounter: p.syncToCounter === true,
      bound: validateBound(p.bound),
    };
  } catch {
    return DEFAULT_PRACTICE;
  }
}

function initialMode(): Mode {
  return localStorage.getItem(MODE_KEY) === 'breathing' ? 'breathing' : 'rosary';
}

export function App() {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [screen, setScreen] = useState<Screen>('setup');
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [beadCount, setBeadCount] = useState<number>(initialBeads);
  const [prayerId, setPrayerId] = useState<string>(
    () => localStorage.getItem(PRAYER_KEY) ?? DEFAULT_PRAYER_ID,
  );
  const [practice, setPractice] = useState<PracticeSettings>(initialPractice);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);
  useEffect(() => {
    localStorage.setItem(BEADS_KEY, String(beadCount));
  }, [beadCount]);
  useEffect(() => {
    localStorage.setItem(PRAYER_KEY, prayerId);
  }, [prayerId]);
  useEffect(() => {
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(practice));
  }, [practice]);
  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  return (
    <div className="app">
      <Ornament variant="corner" className="corner corner--tl" />
      <Ornament variant="corner" className="corner corner--tr" />
      <Ornament variant="corner" className="corner corner--bl" />
      <Ornament variant="corner" className="corner corner--br" />

      <div className="runninghead">
        <Cross className="runninghead__mark" />
        <span className="runninghead__label">{t('bookLabel', lang)}</span>
        <LangSelector lang={lang} onChange={setLang} />
      </div>

      <div className="tabs tabs--mode" role="tablist" aria-label={t('tablistAria', lang)}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'rosary'}
          className="tab"
          data-selected={mode === 'rosary' || undefined}
          onClick={() => setMode('rosary')}
        >
          {t('tabRosary', lang)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'breathing'}
          className="tab"
          data-selected={mode === 'breathing' || undefined}
          onClick={() => setMode('breathing')}
        >
          {t('tabBreathing', lang)}
        </button>
      </div>

      {mode === 'rosary' ? (
        screen === 'setup' ? (
          <SetupScreen
            lang={lang}
            beadCount={beadCount}
            prayerId={prayerId}
            onBeadCount={setBeadCount}
            onPrayer={setPrayerId}
            onBegin={() => setScreen('session')}
          />
        ) : (
          <SessionScreen
            lang={lang}
            config={{ beadCount, prayerId }}
            onExit={() => setScreen('setup')}
          />
        )
      ) : (
        <BreathingScreen lang={lang} practice={practice} onPractice={setPractice} />
      )}

      <Ornament variant="tailpiece" className="footer__tailpiece" />
      <footer className="footer">{t('footer', lang)}</footer>
    </div>
  );
}
