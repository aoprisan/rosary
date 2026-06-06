/**
 * Fetches and decodes a bundled audio file into an AudioBuffer, memoized so a
 * layer that is toggled off and on again does not re-fetch or re-decode.
 *
 * Assets live in `public/audio/` and are precached by the service worker (see
 * the Workbox `globPatterns` in `vite.config.ts`), so playback is fully offline
 * after first load. `import.meta.env.BASE_URL` keeps the path under `/rosary/`.
 *
 * Expected slots (drop real, royalty-free recordings in under the same names):
 *   - ison-drone.wav  — a low ison / drone, seamless loop, 44.1 kHz
 *   - chant.wav       — a soft Byzantine chant bed, seamless loop
 *   - semantron.wav   — a short (~300 ms) wooden tap, one-shot
 *
 * The committed files are tiny synthesized placeholders so the mixer is audible
 * out of the box; replace them with recorded chant (WAV or OGG) when ready.
 */
const cache = new Map<string, Promise<AudioBuffer>>();

export function fetchBuffer(ctx: AudioContext, file: string): Promise<AudioBuffer> {
  const url = `${import.meta.env.BASE_URL}audio/${file}`;
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`audio ${file}: ${res.status}`);
        return res.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data));
    // Drop a failed fetch from the cache so a later attempt can retry.
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}
