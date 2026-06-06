import type { Lang, PracticeSettings, SessionBound } from '../types';
import { t } from '../i18n/strings';
import { loc } from '../i18n/loc';
import { PRACTICE_FORMS, CUSTOM_FORM_ID } from '../data/practiceForms';
import { LAYER_FILES } from '../audio/useAmbientMixer';

interface Props {
  lang: Lang;
  practice: PracticeSettings;
  onPractice: (next: PracticeSettings) => void;
}

const LAYER_LABEL_KEY: Record<string, string> = {
  'ison-drone': 'layerIson',
  chant: 'layerChant',
};

const clampSec = (raw: number) => Math.max(1, Math.min(20, Math.round(raw)));

export function PracticePanel({ lang, practice, onPractice }: Props) {
  const set = (patch: Partial<PracticeSettings>) => onPractice({ ...practice, ...patch });
  const setLayer = (id: string, patch: Partial<PracticeSettings['layers'][string]>) =>
    set({ layers: { ...practice.layers, [id]: { ...practice.layers[id], ...patch } } });

  const isCustom = practice.formId === CUSTOM_FORM_ID;
  const bound = practice.bound;

  return (
    <section className="panel">
      <h2 className="panel__heading">{t('practiceHeading', lang)}</h2>
      <p className="panel__hint">{t('practiceHint', lang)}</p>

      {/* Prayer form */}
      <div className="practice-group">
        <span className="practice-label">{t('breathFormLabel', lang)}</span>
        <div className="chips">
          {PRACTICE_FORMS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip chip--wide"
              data-selected={practice.formId === f.id || undefined}
              onClick={() => set({ formId: f.id })}
            >
              <span className="chip__unit">{loc(f.name, lang)}</span>
            </button>
          ))}
          <button
            type="button"
            className="chip chip--wide"
            data-selected={isCustom || undefined}
            onClick={() => set({ formId: CUSTOM_FORM_ID })}
          >
            <span className="chip__unit">{t('formCustom', lang)}</span>
          </button>
        </div>
        {isCustom && (
          <div className="practice-custom">
            <label className="practice-field">
              <span>{t('customInhaleLabel', lang)}</span>
              <input
                type="text"
                value={practice.customInhale}
                onChange={(e) => set({ customInhale: e.target.value })}
              />
            </label>
            <label className="practice-field">
              <span>{t('customExhaleLabel', lang)}</span>
              <input
                type="text"
                value={practice.customExhale}
                onChange={(e) => set({ customExhale: e.target.value })}
              />
            </label>
          </div>
        )}
      </div>

      {/* Breath timing */}
      <div className="practice-group">
        <span className="practice-label">{t('timingsHeading', lang)}</span>
        <p className="practice-sub">{t('timingsHint', lang)}</p>
        <div className="practice-timings">
          <label className="practice-field practice-field--num">
            <span>{t('inhaleLabel', lang)}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={Math.round(practice.inhaleMs / 1000)}
              onChange={(e) => set({ inhaleMs: clampSec(Number(e.target.value) || 1) * 1000 })}
            />
            <span className="practice-unit">{t('secondsUnit', lang)}</span>
          </label>
          <label className="practice-field practice-field--num">
            <span>{t('holdLabel', lang)}</span>
            <input
              type="number"
              min={0}
              max={20}
              value={Math.round(practice.holdMs / 1000)}
              onChange={(e) =>
                set({ holdMs: Math.max(0, Math.min(20, Math.round(Number(e.target.value) || 0))) * 1000 })
              }
            />
            <span className="practice-unit">{t('secondsUnit', lang)}</span>
          </label>
          <label className="practice-field practice-field--num">
            <span>{t('exhaleLabel', lang)}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={Math.round(practice.exhaleMs / 1000)}
              onChange={(e) => set({ exhaleMs: clampSec(Number(e.target.value) || 1) * 1000 })}
            />
            <span className="practice-unit">{t('secondsUnit', lang)}</span>
          </label>
        </div>
      </div>

      {/* Ambience */}
      <div className="practice-group">
        <span className="practice-label">{t('audioHeading', lang)}</span>
        <p className="practice-sub">{t('audioHint', lang)}</p>
        {Object.keys(LAYER_FILES).map((id) => {
          const layer = practice.layers[id] ?? { on: false, volume: 0.5 };
          return (
            <div className="mix-layer" key={id}>
              <label className="practice-toggle">
                <input
                  type="checkbox"
                  checked={layer.on}
                  onChange={(e) => setLayer(id, { on: e.target.checked })}
                />
                <span>{t(LAYER_LABEL_KEY[id] ?? id, lang)}</span>
              </label>
              <input
                className="mix-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(layer.volume * 100)}
                aria-label={t('volumeLabel', lang)}
                onChange={(e) => setLayer(id, { volume: Number(e.target.value) / 100 })}
              />
            </div>
          );
        })}
        <label className="practice-toggle">
          <input
            type="checkbox"
            checked={practice.tapOn}
            onChange={(e) => set({ tapOn: e.target.checked })}
          />
          <span>{t('tapLabel', lang)}</span>
        </label>
      </div>

      {/* Quiet toggles */}
      <div className="practice-group">
        <label className="practice-toggle">
          <input
            type="checkbox"
            checked={practice.hapticsOn}
            onChange={(e) => set({ hapticsOn: e.target.checked })}
          />
          <span>{t('hapticsLabel', lang)}</span>
        </label>
        <label className="practice-toggle">
          <input
            type="checkbox"
            checked={practice.syncToCounter}
            onChange={(e) => set({ syncToCounter: e.target.checked })}
          />
          <span>{t('syncLabel', lang)}</span>
        </label>
      </div>

      {/* Session length */}
      <div className="practice-group">
        <span className="practice-label">{t('boundHeading', lang)}</span>
        <div className="chips">
          <button
            type="button"
            className="chip chip--wide"
            data-selected={bound.kind === 'open' || undefined}
            onClick={() => set({ bound: { kind: 'open' } })}
          >
            <span className="chip__unit">{t('boundOpen', lang)}</span>
          </button>
          <button
            type="button"
            className="chip chip--wide"
            data-selected={bound.kind === 'knots' || undefined}
            onClick={() => set({ bound: { kind: 'knots', count: boundCount(bound, 'knots') } })}
          >
            <span className="chip__unit">{t('boundKnots', lang)}</span>
          </button>
          <button
            type="button"
            className="chip chip--wide"
            data-selected={bound.kind === 'duration' || undefined}
            onClick={() => set({ bound: { kind: 'duration', minutes: boundCount(bound, 'duration') } })}
          >
            <span className="chip__unit">{t('boundDuration', lang)}</span>
          </button>
        </div>
        {bound.kind === 'knots' && (
          <label className="practice-field practice-field--num">
            <input
              type="number"
              min={1}
              max={999}
              value={bound.count}
              onChange={(e) =>
                set({ bound: { kind: 'knots', count: Math.max(1, Math.round(Number(e.target.value) || 1)) } })
              }
            />
            <span className="practice-unit">{t('knotsUnit', lang)}</span>
          </label>
        )}
        {bound.kind === 'duration' && (
          <label className="practice-field practice-field--num">
            <input
              type="number"
              min={1}
              max={180}
              value={bound.minutes}
              onChange={(e) =>
                set({
                  bound: { kind: 'duration', minutes: Math.max(1, Math.round(Number(e.target.value) || 1)) },
                })
              }
            />
            <span className="practice-unit">{t('minutesUnit', lang)}</span>
          </label>
        )}
      </div>
    </section>
  );
}

/** Remembered count when switching bound kinds, with gentle defaults. */
function boundCount(bound: SessionBound, kind: 'knots' | 'duration'): number {
  if (kind === 'knots') return bound.kind === 'knots' ? bound.count : 33;
  return bound.kind === 'duration' ? bound.minutes : 10;
}
