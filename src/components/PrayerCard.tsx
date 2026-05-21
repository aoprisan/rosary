import type { Lang, Prayer } from '../types';
import { loc } from '../i18n/loc';
import { Cross } from './Ornament';
import { IlluminatedInitial } from './IlluminatedInitial';

interface Props {
  prayer: Prayer;
  lang: Lang;
}

export function PrayerCard({ prayer, lang }: Props) {
  const lines = prayer.lines[lang] ?? prayer.lines.en;
  const [first, ...rest] = lines;
  const initial = first.slice(0, 1);
  const firstRest = first.slice(1);

  return (
    <div className="prayer-card">
      <h2 className="prayer-card__title">
        <Cross />
        {loc(prayer.name, lang)}
      </h2>
      <div className="prayer-card__text">
        <IlluminatedInitial letter={initial} />
        <span className="prayer-card__line prayer-card__line--first">{firstRest}</span>
        {rest.map((line, i) => (
          <span key={i} className="prayer-card__line">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
