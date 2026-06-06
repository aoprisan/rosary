import { useState } from 'react';
import type { Lang } from '../types';
import { t } from '../i18n/strings';

const SEEN_KEY = 'rosary:practiceNoteSeen';

function wasSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * A single, quiet pastoral note shown the first time the breath guide is used.
 * Dismissible and non-blocking — it never returns once acknowledged.
 */
export function PracticeNote({ lang }: { lang: Lang }) {
  const [hidden, setHidden] = useState(wasSeen);
  if (hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* storage unavailable — still dismiss for this view */
    }
    setHidden(true);
  };

  return (
    <div className="practice-note" role="note">
      <h3 className="practice-note__title">{t('noteTitle', lang)}</h3>
      <p className="practice-note__body">{t('noteBody', lang)}</p>
      <button type="button" className="control-btn" onClick={dismiss}>
        {t('noteDismiss', lang)}
      </button>
    </div>
  );
}
