export type Lang = 'en' | 'ro';

/** A string available in both supported languages. */
export type Localized = { en: string; ro: string };

export interface Prayer {
  id: string;
  /** Title shown in the picker and session header. */
  name: Localized;
  /** A short tag (tradition / kind) shown under the title in the picker. */
  kind: Localized;
  /** The prayer body, broken into display lines per language. */
  lines: { en: string[]; ro: string[] };
}

/** What the session screen needs to run a circuit of the rope. */
export interface SessionConfig {
  beadCount: number;
  prayerId: string;
}

export type Screen = 'setup' | 'session';
