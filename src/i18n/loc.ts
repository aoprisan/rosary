import type { Lang, Localized } from '../types';

/** Resolve a `{ en, ro }` value for the active language, falling back to English. */
export function loc(value: Localized, lang: Lang): string {
  return value[lang] ?? value.en;
}
