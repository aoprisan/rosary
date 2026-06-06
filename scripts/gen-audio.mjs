// Generates tiny synthesized PLACEHOLDER audio for the ambient mixer, so the
// feature is audible out of the box with no binary assets to hand-author.
// Replace public/audio/*.wav with real, royalty-free recordings (same names)
// when ready. Run: `node scripts/gen-audio.mjs`.
//
// Loop seamlessness: the looping beds are 8 s long and use only frequencies
// f with f*8 ∈ ℤ, so the waveform completes whole cycles over the buffer and
// AudioBufferSourceNode{loop:true} joins end→start with no click.

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

const sin = (f, t) => Math.sin(2 * Math.PI * f * t);
const make = (dur, fn) => {
  const n = Math.round(dur * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR);
  return out;
};

// Ison / drone — a low fundamental with two quiet partials and a slow swell.
const F0 = 110.25; // 110.25 * 8 = 882 (whole cycles)
const drone = make(8, (t) => {
  const swell = 0.8 + 0.2 * sin(0.25, t);
  return swell * (0.2 * sin(F0, t) + 0.1 * sin(2 * F0, t) + 0.05 * sin(3 * F0, t));
});

// Chant bed — an airy fifth above the drone, softer and breathier.
const chant = make(8, (t) => {
  const swell = 0.75 + 0.25 * sin(0.125, t);
  return swell * (0.12 * sin(F0 * 1.5, t) + 0.08 * sin(3 * F0, t) + 0.05 * sin(F0 * 2, t));
});

// Semantron — a short, soft wooden tap (one-shot, not looped).
const tap = make(0.3, (t) => {
  const env = Math.exp(-t * 22);
  return env * (0.5 * sin(523.25, t) + 0.2 * sin(784, t));
});

writeFileSync(join(outDir, 'ison-drone.wav'), wav(drone));
writeFileSync(join(outDir, 'chant.wav'), wav(chant));
writeFileSync(join(outDir, 'semantron.wav'), wav(tap));
console.log('wrote ison-drone.wav, chant.wav, semantron.wav to public/audio/');
