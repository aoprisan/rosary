import type { PracticeForm } from '../types';

/**
 * Breathing forms: the prayer split across an inhale and an exhale. These are
 * standalone — chosen in the Practice settings, not tied to the prayer loaded
 * on the rope. The phrases match the Jesus Prayer text in `prayers.ts` so the
 * two read alike.
 */
export const PRACTICE_FORMS: PracticeForm[] = [
  {
    id: 'jesus-full',
    name: { en: 'Jesus Prayer — full', ro: 'Rugăciunea lui Iisus — deplină' },
    inhale: {
      en: 'Lord Jesus Christ, Son of God,',
      ro: 'Doamne Iisuse Hristoase, Fiul lui Dumnezeu,',
    },
    exhale: {
      en: 'have mercy on me, a sinner.',
      ro: 'miluiește-mă pe mine, păcătosul.',
    },
    builtin: true,
  },
  {
    id: 'jesus-short',
    name: { en: 'Jesus Prayer — short', ro: 'Rugăciunea lui Iisus — scurtă' },
    inhale: { en: 'Lord Jesus Christ,', ro: 'Doamne Iisuse Hristoase,' },
    exhale: { en: 'have mercy on me.', ro: 'miluiește-mă.' },
    builtin: true,
  },
];

/** Sentinel id for the user's own inhale/exhale text. */
export const CUSTOM_FORM_ID = 'custom';
export const DEFAULT_FORM_ID = 'jesus-full';

export function getPracticeForm(id: string): PracticeForm | undefined {
  return PRACTICE_FORMS.find((f) => f.id === id);
}
