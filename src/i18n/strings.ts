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
  tabRosary: 'Rosary',
  tabBreathing: 'Breathing',
  tablistAria: 'Choose rosary or breathing',
  beadLabel: 'Bead',
  circuitsLabel: 'Circuits',
  spinHint: 'Spin the centre like a joystick — a full circle tells one bead, then lift to tell the next.',
  circuitComplete: 'Circuit complete — beginning again.',
  previous: 'Previous',
  next: 'Next',
  reset: 'Reset',
  prevBeadAria: 'Previous bead',
  nextBeadAria: 'Next bead',
  ropeAria: 'Prayer rope — spin the centre like a joystick to tell beads, or use arrow keys',
  beadAria: 'Bead',
  footer: 'Pray without ceasing — 1 Thessalonians 5:17',

  // Breathing screen header
  breathingTitle: 'Breathing',
  breathingLead: 'A paced breath to carry the prayer.',

  // Practice — settings
  practiceHeading: 'Breath & sound',
  practiceHint: 'A breathing guide and quiet ambience for the prayer. All gentle, all optional.',
  breathFormLabel: 'Prayer form',
  formCustom: 'In your words',
  customInhaleLabel: 'Breathing in',
  customExhaleLabel: 'Breathing out',
  timingsHeading: 'Breath timing',
  timingsHint: 'Settle into a pace that is easy for you — there is no speed to keep.',
  inhaleLabel: 'In',
  holdLabel: 'Hold',
  exhaleLabel: 'Out',
  secondsUnit: 'sec',
  audioHeading: 'Ambience',
  audioHint: 'Soft sound to rest behind the prayer.',
  layerIson: 'Ison · drone',
  layerChant: 'Chant',
  tapLabel: 'Soft tap each circuit',
  volumeLabel: 'Volume',
  hapticsLabel: 'Gentle pulse at each breath',
  syncLabel: 'One knot per breath',
  boundHeading: 'Length',
  boundOpen: 'Open',
  boundKnots: 'Breaths',
  boundDuration: 'Minutes',
  minutesUnit: 'min',
  knotsUnit: 'breaths',

  // Practice — session
  breathBegin: 'Breathe with the prayer',
  breathStop: 'Rest',
  breathEnd: 'Amen.',
  inhale: 'Breathe in',
  exhale: 'Breathe out',
  hold: 'Hold',
  breathAria: 'Breathing guide',

  // Pastoral note
  noteTitle: 'A gentle word',
  noteBody:
    'Joining the breath to the prayer is an old and tender aid — keep it soft, never forced. The fuller psychosomatic method is traditionally learned under the guidance of a spiritual father.',
  noteDismiss: 'Continue',
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
  tabRosary: 'Metanier',
  tabBreathing: 'Respirație',
  tablistAria: 'Alege metanierul sau respirația',
  beadLabel: 'Mărgea',
  circuitsLabel: 'Cercuri',
  spinHint: 'Învârte centrul ca pe un joystick — un cerc complet numără o mărgea, apoi ridică degetul pentru următoarea.',
  circuitComplete: 'Cerc încheiat — se începe din nou.',
  previous: 'Înapoi',
  next: 'Înainte',
  reset: 'Resetează',
  prevBeadAria: 'Mărgeaua anterioară',
  nextBeadAria: 'Mărgeaua următoare',
  ropeAria: 'Șirag de rugăciune — învârte centrul ca pe un joystick pentru a număra mărgele sau folosește tastele săgeți',
  beadAria: 'Mărgea',
  footer: 'Rugați-vă neîncetat — 1 Tesaloniceni 5:17',

  // Breathing screen header
  breathingTitle: 'Respirație',
  breathingLead: 'O respirație ritmată care poartă rugăciunea.',

  // Practice — settings
  practiceHeading: 'Respirație și sunet',
  practiceHint: 'Un îndrumar de respirație și un fundal liniștit pentru rugăciune. Totul blând, totul opțional.',
  breathFormLabel: 'Forma rugăciunii',
  formCustom: 'În cuvintele tale',
  customInhaleLabel: 'La inspirație',
  customExhaleLabel: 'La expirație',
  timingsHeading: 'Ritmul respirației',
  timingsHint: 'Așază-te într-un ritm ușor pentru tine — nu e nicio viteză de urmat.',
  inhaleLabel: 'Inspiră',
  holdLabel: 'Ține',
  exhaleLabel: 'Expiră',
  secondsUnit: 'sec',
  audioHeading: 'Fundal sonor',
  audioHint: 'Un sunet blând care să odihnească în spatele rugăciunii.',
  layerIson: 'Ison',
  layerChant: 'Cântare',
  tapLabel: 'Bătaie blândă la fiecare cerc',
  volumeLabel: 'Volum',
  hapticsLabel: 'Vibrație blândă la fiecare respirație',
  syncLabel: 'Un nod la fiecare respirație',
  boundHeading: 'Durată',
  boundOpen: 'Liberă',
  boundKnots: 'Respirații',
  boundDuration: 'Minute',
  minutesUnit: 'min',
  knotsUnit: 'respirații',

  // Practice — session
  breathBegin: 'Respiră cu rugăciunea',
  breathStop: 'Odihnă',
  breathEnd: 'Amin.',
  inhale: 'Inspiră',
  exhale: 'Expiră',
  hold: 'Ține',
  breathAria: 'Îndrumar de respirație',

  // Pastoral note
  noteTitle: 'Un cuvânt blând',
  noteBody:
    'Unirea respirației cu rugăciunea este un ajutor vechi și gingaș — păstreaz-o blândă, niciodată silită. Metoda psihosomatică deplină se învață în chip tradițional sub îndrumarea unui părinte duhovnicesc.',
  noteDismiss: 'Continuă',
};

const dicts: Record<Lang, Dict> = { en, ro };

export function t(key: string, lang: Lang): string {
  return dicts[lang][key] ?? dicts.en[key] ?? key;
}
