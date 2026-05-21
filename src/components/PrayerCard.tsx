import type { Lang, Prayer } from '../types';
import { loc } from '../i18n/loc';

interface Props {
  prayer: Prayer;
  lang: Lang;
}

export function PrayerCard({ prayer, lang }: Props) {
  const lines = prayer.lines[lang] ?? prayer.lines.en;
  return (
    <div className="prayer-card">
      <h2 className="prayer-card__title">{loc(prayer.name, lang)}</h2>
      <div className="prayer-card__text">
        {lines.map((line, i) => (
          <span key={i} className="prayer-card__line">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
