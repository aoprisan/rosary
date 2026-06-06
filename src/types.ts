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

/**
 * A breathing "form": the prayer split across an inhale and an exhale phrase.
 * Standalone — chosen in the Practice settings, independent of which prayer is
 * loaded on the rope.
 */
export interface PracticeForm {
  id: string;
  /** Shown in the form picker. */
  name: Localized;
  /** Phrase rested on while breathing in (the form expands). */
  inhale: Localized;
  /** Phrase rested on while breathing out (the form contracts). */
  exhale: Localized;
  builtin: boolean;
}

/** How a breathing session ends: never, after a count of breaths, or after a time. */
export type SessionBound =
  | { kind: 'open' }
  | { kind: 'knots'; count: number }
  | { kind: 'duration'; minutes: number };

/** Per-audio-layer mixer state. `volume` is 0..1. */
export interface LayerSetting {
  on: boolean;
  volume: number;
}

/**
 * The unified "Practice" settings: breathing form, breath timings, the ambient
 * audio mix, and the quiet toggles. Persisted as one JSON blob under
 * `rosary:practice`, mirroring the `rosary:progress` precedent.
 */
export interface PracticeSettings {
  /** Selected PracticeForm id, or the custom-form sentinel. */
  formId: string;
  /** Free text for the custom form (not localized — the user's own words). */
  customInhale: string;
  customExhale: string;
  /** Breath phase durations, in milliseconds. */
  inhaleMs: number;
  /** Optional rest between phases; 0 means no hold (the default). */
  holdMs: number;
  exhaleMs: number;
  /** Ambient mixer, keyed by audio layer id. */
  layers: Record<string, LayerSetting>;
  /** Soft tap marking each completed circuit — off by default. */
  tapOn: boolean;
  /** Haptic pulse at each breath-phase transition — off by default. */
  hapticsOn: boolean;
  /** Advance the rope one knot per completed breath cycle — off by default. */
  syncToCounter: boolean;
  /** When a breathing session ends. */
  bound: SessionBound;
}
