import type { Lang } from '../types';
import { t } from '../i18n/strings';
import { loc } from '../i18n/loc';
import { PRAYERS } from '../data/prayers';
import { LangSelector } from './LangSelector';

const PRESETS = [33, 50, 100];

interface Props {
  lang: Lang;
  beadCount: number;
  prayerId: string;
  onLangChange: (lang: Lang) => void;
  onBeadCount: (n: number) => void;
  onPrayer: (id: string) => void;
  onBegin: () => void;
}

export function SetupScreen({
  lang,
  beadCount,
  prayerId,
  onLangChange,
  onBeadCount,
  onPrayer,
  onBegin,
}: Props) {
  const isPreset = PRESETS.includes(beadCount);

  return (
    <div className="setup">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="masthead__cross" aria-hidden="true">
            ✝
          </span>
          <div>
            <h1 className="masthead__title">{t('appTitle', lang)}</h1>
            <p className="masthead__subtitle">{t('appSubtitle', lang)}</p>
          </div>
        </div>
        <LangSelector lang={lang} onChange={onLangChange} />
      </header>

      <section className="panel">
        <h2 className="panel__heading">{t('beadsHeading', lang)}</h2>
        <p className="panel__hint">{t('beadsHint', lang)}</p>
        <div className="chips">
          {PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              className="chip"
              data-selected={beadCount === n || undefined}
              onClick={() => onBeadCount(n)}
            >
              <span className="chip__num">{n}</span>
              <span className="chip__unit">{t('beadsUnit', lang)}</span>
            </button>
          ))}
          <label className="chip chip--custom" data-selected={!isPreset || undefined}>
            <span className="chip__unit">{t('customBeads', lang)}</span>
            <input
              type="number"
              min={1}
              max={300}
              value={beadCount}
              onChange={(e) => {
                const raw = Math.round(Number(e.target.value) || 1);
                onBeadCount(Math.max(1, Math.min(300, raw)));
              }}
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__heading">{t('prayerHeading', lang)}</h2>
        <p className="panel__hint">{t('prayerHint', lang)}</p>
        <ul className="prayer-list">
          {PRAYERS.map((p) => {
            const selected = p.id === prayerId;
            const firstLine = (p.lines[lang] ?? p.lines.en)[0];
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="prayer-option"
                  data-selected={selected || undefined}
                  aria-pressed={selected}
                  onClick={() => onPrayer(p.id)}
                >
                  <span className="prayer-option__name">{loc(p.name, lang)}</span>
                  <span className="prayer-option__kind">{loc(p.kind, lang)}</span>
                  <span className="prayer-option__preview">{firstLine}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <button type="button" className="begin-btn" onClick={onBegin}>
        {t('begin', lang)}
      </button>
    </div>
  );
}
