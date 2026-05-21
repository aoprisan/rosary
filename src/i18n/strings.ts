import type { Lang } from '../types';

type Dict = Record<string, string>;

const en: Dict = {
  appTitle: 'Rosary',
  appSubtitle: 'A virtual prayer rope',
  bookLabel: 'A Book of Hours',
  incipit: 'In the name of the Father, and of the Son, and of the Holy Spirit.',
  english: 'English',
  romanian: 'Română',

  // Setup screen
  beadsHeading: 'How many beads?',
  beadsHint: 'Pick a length, or set your own.',
  customBeads: 'Custom',
  beadsUnit: 'beads',
  prayerHeading: 'Which prayer?',
  prayerHint: 'One prayer is said on every bead.',
  begin: 'Begin the rope',

  // Session screen
  backToSetup: 'Setup',
  beadLabel: 'Bead',
  circuitsLabel: 'Circuits',
  spinHint: 'Spin the beads, tap a bead, or use the buttons.',
  circuitComplete: 'Circuit complete — beginning again.',
  previous: 'Previous',
  next: 'Next',
  reset: 'Reset',
  prevBeadAria: 'Previous bead',
  nextBeadAria: 'Next bead',
  ropeAria: 'Prayer rope — drag to spin, or use arrow keys',
  beadAria: 'Bead',
  footer: 'Pray without ceasing — 1 Thessalonians 5:17',
};

const ro: Dict = {
  appTitle: 'Metanier',
  appSubtitle: 'Un șirag de rugăciune',
  bookLabel: 'Ceaslov',
  incipit: 'În numele Tatălui și al Fiului și al Sfântului Duh.',
  english: 'English',
  romanian: 'Română',

  beadsHeading: 'Câte mărgele?',
  beadsHint: 'Alege o lungime sau pune numărul tău.',
  customBeads: 'Personalizat',
  beadsUnit: 'mărgele',
  prayerHeading: 'Care rugăciune?',
  prayerHint: 'O rugăciune se rostește la fiecare mărgea.',
  begin: 'Începe șiragul',

  backToSetup: 'Înapoi',
  beadLabel: 'Mărgea',
  circuitsLabel: 'Cercuri',
  spinHint: 'Învârte mărgelele, atinge o mărgea sau folosește butoanele.',
  circuitComplete: 'Cerc încheiat — se începe din nou.',
  previous: 'Înapoi',
  next: 'Înainte',
  reset: 'Resetează',
  prevBeadAria: 'Mărgeaua anterioară',
  nextBeadAria: 'Mărgeaua următoare',
  ropeAria: 'Șirag de rugăciune — trage pentru a învârti sau folosește tastele săgeți',
  beadAria: 'Mărgea',
  footer: 'Rugați-vă neîncetat — 1 Tesaloniceni 5:17',
};

const dicts: Record<Lang, Dict> = { en, ro };

export function t(key: string, lang: Lang): string {
  return dicts[lang][key] ?? dicts.en[key] ?? key;
}
