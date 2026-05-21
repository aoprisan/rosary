import type { Lang } from '../types';
import { t } from '../i18n/strings';

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export function LangSelector({ lang, onChange }: Props) {
  return (
    <div className="lang-selector" role="group" aria-label="Language / Limbă">
      <button
        type="button"
        aria-pressed={lang === 'en'}
        onClick={() => onChange('en')}
        title={t('english', lang)}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={lang === 'ro'}
        onClick={() => onChange('ro')}
        title={t('romanian', lang)}
      >
        RO
      </button>
    </div>
  );
}
