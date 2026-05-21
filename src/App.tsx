import { useEffect, useState } from 'react';
import type { Lang, Screen } from './types';
import { SetupScreen } from './components/SetupScreen';
import { SessionScreen } from './components/SessionScreen';
import { DEFAULT_PRAYER_ID } from './data/prayers';
import { t } from './i18n/strings';
import { Ornament } from './components/Ornament';

const LANG_KEY = 'rosary:lang';
const BEADS_KEY = 'rosary:beads';
const PRAYER_KEY = 'rosary:prayer';

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

export function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [beadCount, setBeadCount] = useState<number>(initialBeads);
  const [prayerId, setPrayerId] = useState<string>(
    () => localStorage.getItem(PRAYER_KEY) ?? DEFAULT_PRAYER_ID,
  );

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

  return (
    <div className="app">
      {screen === 'setup' ? (
        <SetupScreen
          lang={lang}
          beadCount={beadCount}
          prayerId={prayerId}
          onLangChange={setLang}
          onBeadCount={setBeadCount}
          onPrayer={setPrayerId}
          onBegin={() => setScreen('session')}
        />
      ) : (
        <SessionScreen
          lang={lang}
          config={{ beadCount, prayerId }}
          onLangChange={setLang}
          onExit={() => setScreen('setup')}
        />
      )}
      <Ornament variant="rule" />
      <footer className="footer">{t('footer', lang)}</footer>
    </div>
  );
}
