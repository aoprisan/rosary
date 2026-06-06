// Generates tiny synthesized PLACEHOLDER audio for the ambient mixer, so the
// feature is audible out of the box with no binary assets to hand-author.
// Replace public/audio/*.wav with real, royalty-free recordings (same names)
// when ready. Run: `node scripts/gen-audio.mjs`.
//
// Loop seamlessness: the looping beds are 8 s long and use only frequencies
// f with f*8 ∈ ℤ, so the waveform completes whole cycles over the buffer and
// AudioBufferSourceNode{loop:true} joins end→start with no click. Every
// modulator (swell, beat, vibrato) is likewise whole-cycle over 8 s, and
// vibrato is done as phase modulation whose index returns to 0 at the seam —
// so the beds stay click-free despite the extra movement. The beds are kept
// strictly periodic (no noise); only the one-shot semantron uses noise.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SR = 44100;
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');
mkdirSync(outDir, { recursive: true });

/** Encode mono float samples (−1..1) as a 16-bit PCM WAV. */
function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s < 0 ? s * 0x8000 : s * 0x7fff) | 0, 44 + i * 2);
  }
  return buf;
}

const TAU = 2 * Math.PI;
const sin = (f, t, ph = 0) => Math.sin(TAU * f * t + ph);
const make = (dur, fn) => {
  const n = Math.round(dur * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR);
  return out;
};

/** Additive voice: a fundamental f0 with the given per-harmonic gains. */
const voice = (f0, t, gains) => {
  let s = 0;
  for (let i = 0; i < gains.length; i++) s += gains[i] * sin(f0 * (i + 1), t);
  return s;
};

// Ison / drone — a warm low fundamental, organ-like rather than buzzy: the
// harmonics roll off steeply (1/n²-ish) so the timbre stays round, and two
// voices a hair apart (110.25 vs 110.0 Hz) beat at 0.25 Hz for a slow chorus
// shimmer. Both detunes are whole-cycle over 8 s (882, 880), so the loop and
// every beat partial close cleanly.
const F0 = 110.25; // 110.25 * 8 = 882
const GAINS = [0.5, 0.16, 0.08, 0.035, 0.015]; // gentle roll-off → mellow
const drone = make(8, (t) => {
  const swell = 0.85 + 0.15 * sin(0.25, t); // 2 cycles / 8 s
  return 0.3 * swell * (voice(F0, t, GAINS) + voice(110.0, t, GAINS));
});

// Chant bed — an airy fifth above the drone with a vocal-ish vibrato and a
// vowel-leaning formant (2nd/3rd partials lifted). Vibrato is phase modulation
// at 5 Hz; since 5*8 = 40 the modulation index returns to 0 at the seam, so the
// movement never breaks the loop. Softer and breathier than the drone.
const chant = make(8, (t) => {
  const f = F0 * 1.5; // 165.375 Hz (165.375 * 8 = 1323)
  const ph = 0.6 * sin(5, t); // vibrato, whole-cycle → seamless
  const tone =
    0.12 * sin(f, t, ph) +
    0.1 * sin(2 * f, t, 2 * ph) +
    0.07 * sin(3 * f, t, 3 * ph) +
    0.035 * sin(4 * f, t, 4 * ph);
  const swell = 0.7 + 0.3 * sin(0.125, t); // 1 cycle / 8 s
  return swell * tone;
});

// Semantron — a dry wooden knock (one-shot, not looped). A broadband noise
// transient gives the attack that reads as "wood struck", over an inharmonic
// body at a free-free bar's overtone ratios (1 : 2.76 : 5.40), each partial
// decaying faster the higher it sits. Noise is fine here: nothing loops.
const tap = make(0.32, (t) => {
  const click = 0.45 * Math.exp(-t * 520) * (Math.random() * 2 - 1);
  const body =
    0.45 * Math.exp(-t * 32) * sin(440, t) +
    0.26 * Math.exp(-t * 48) * sin(440 * 2.76, t) +
    0.12 * Math.exp(-t * 70) * sin(440 * 5.4, t);
  return 0.85 * (click + body);
});

writeFileSync(join(outDir, 'ison-drone.wav'), wav(drone));
writeFileSync(join(outDir, 'chant.wav'), wav(chant));
writeFileSync(join(outDir, 'semantron.wav'), wav(tap));
console.log('wrote ison-drone.wav, chant.wav, semantron.wav to public/audio/');
