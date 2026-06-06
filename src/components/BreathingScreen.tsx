import { useState } from 'react';
import type { Lang, PracticeSettings } from '../types';
import { t } from '../i18n/strings';
import { loc } from '../i18n/loc';
import { getPracticeForm, CUSTOM_FORM_ID } from '../data/practiceForms';
import { useAmbientMixer, LAYER_FILES } from '../audio/useAmbientMixer';
import { BreathGuide } from './BreathGuide';
import { PracticeNote } from './PracticeNote';
import { PracticePanel } from './PracticePanel';
import { Ornament, Cross } from './Ornament';

interface Props {
  lang: Lang;
  practice: PracticeSettings;
  onPractice: (next: PracticeSettings) => void;
}

/**
 * The Breathing panel: a self-contained mode beside the rosary. It carries its
 * own settings (form, timing, ambience, length) and runs the breath guide with
 * its own ambient mixer — it does not touch the rope or its counter. The Begin
 * button is the user gesture that resumes the audio context (autoplay policy).
 */
export function BreathingScreen({ lang, practice, onPractice }: Props) {
  const [running, setRunning] = useState(false);
  const mixer = useAmbientMixer();

  const form = getPracticeForm(practice.formId);
  const inhaleText =
    practice.formId === CUSTOM_FORM_ID ? practice.customInhale.trim() : form ? loc(form.inhale, lang) : '';
  const exhaleText =
    practice.formId === CUSTOM_FORM_ID ? practice.customExhale.trim() : form ? loc(form.exhale, lang) : '';

  const begin = async () => {
    await mixer.resume();
    for (const id of Object.keys(LAYER_FILES)) {
      const layer = practice.layers[id];
      if (!layer) continue;
      mixer.setVolume(id, layer.volume);
      mixer.setLayer(id, layer.on);
    }
    setRunning(true);
  };

  const rest = () => {
    void mixer.fadeOutAll(1800);
    setRunning(false);
  };

  // A bounded session reached its end: a soft closing tone, then a gentle fade.
  const onBoundEnd = () => {
    mixer.playTap(0.5);
    void mixer.fadeOutAll(2200);
  };

  if (running) {
    return (
      <div className="breathing">
        <BreathGuide
          lang={lang}
          inhaleText={inhaleText}
          exhaleText={exhaleText}
          inhaleMs={practice.inhaleMs}
          holdMs={practice.holdMs}
          exhaleMs={practice.exhaleMs}
          hapticsOn={practice.hapticsOn}
          bound={practice.bound}
          onEnd={onBoundEnd}
          onClose={rest}
        />
        <PracticeNote lang={lang} />
      </div>
    );
  }

  return (
    <div className="breathing">
      <header className="masthead">
        <Ornament variant="headpiece" />
        <h1 className="masthead__title">{t('breathingTitle', lang)}</h1>
        <p className="masthead__subtitle">{t('breathingLead', lang)}</p>
      </header>

      <PracticePanel lang={lang} practice={practice} onPractice={onPractice} />

      <button type="button" className="begin-btn" onClick={begin}>
        <Cross />
        {t('breathBegin', lang)}
      </button>
    </div>
  );
}
