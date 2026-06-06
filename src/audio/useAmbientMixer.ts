import { useEffect, useMemo, useRef } from 'react';
import { fetchBuffer } from './buffers';

/** Ambient layer ids → bundled files. Ids match the keys in PracticeSettings.layers. */
export const LAYER_FILES: Record<string, string> = {
  'ison-drone': 'ison-drone.wav',
  chant: 'chant.wav',
};
const TAP_FILE = 'semantron.wav';

/** Seconds for gain ramps — long enough to avoid clicks, short enough to feel responsive. */
const RAMP = 0.06;

interface Layer {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

export interface AmbientMixer {
  /** Resume the audio context from a user gesture (autoplay policy). */
  resume(): Promise<void>;
  /** Start or stop a looping layer, ramping its gain. */
  setLayer(id: string, on: boolean): void;
  /** Set a layer's target volume (0..1), ramped; takes effect whether on or off. */
  setVolume(id: string, v: number): void;
  /** Fire a one-shot tap (semantron). Counter-driven; never advances the rope. */
  playTap(volume?: number): void;
  /** Fade everything out over `ms` and stop — a gentle session end. */
  fadeOutAll(ms: number): Promise<void>;
}

/**
 * A tiny Web Audio mixer: one looping AudioBufferSourceNode per ambient layer
 * (loop=true is sample-accurately gapless, which `<audio>` looping is not),
 * each through its own GainNode into a master gain. No audio library — the
 * behavior is a few nodes. The context starts suspended and must be resumed
 * from a user gesture; on iOS it plays through the ringer channel, so the
 * hardware silent switch quietens it, which is the behavior we want.
 */
export function useAmbientMixer(): AmbientMixer {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const layersRef = useRef<Map<string, Layer>>(new Map());
  /** Target volume per layer, remembered across stop/start. */
  const volumesRef = useRef<Map<string, number>>(new Map());

  function ensureCtx(): AudioContext | null {
    if (ctxRef.current) return ctxRef.current;
    if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') {
      return null;
    }
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
    return ctx;
  }

  const api = useMemo<AmbientMixer>(() => {
    return {
      async resume() {
        const ctx = ensureCtx();
        if (ctx && ctx.state !== 'running') {
          await ctx.resume().catch(() => {});
        }
      },

      setLayer(id, on) {
        const ctx = ctxRef.current;
        const master = masterRef.current;
        if (!ctx || !master) return;
        const existing = layersRef.current.get(id);
        const target = volumesRef.current.get(id) ?? 0.5;

        if (on) {
          if (existing) return; // already playing
          const file = LAYER_FILES[id];
          if (!file) return;
          const gain = ctx.createGain();
          gain.gain.value = 0;
          gain.connect(master);
          // Decode may be async; only wire up if the layer is still wanted.
          void fetchBuffer(ctx, file).then((buffer) => {
            if (!layersRef.current.has(id)) {
              gain.disconnect();
              return;
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gain);
            source.start(0);
            gain.gain.setTargetAtTime(target, ctx.currentTime, RAMP);
            layersRef.current.set(id, { source, gain });
          });
          // Reserve the slot synchronously so a quick off cancels the start.
          layersRef.current.set(id, { source: null as unknown as AudioBufferSourceNode, gain });
        } else if (existing) {
          layersRef.current.delete(id);
          existing.gain.gain.setTargetAtTime(0, ctx.currentTime, RAMP);
          const node = existing.source;
          window.setTimeout(() => {
            try {
              node?.stop();
            } catch {
              /* not started */
            }
            existing.gain.disconnect();
          }, RAMP * 1000 * 4);
        }
      },

      setVolume(id, v) {
        volumesRef.current.set(id, v);
        const ctx = ctxRef.current;
        const layer = layersRef.current.get(id);
        if (ctx && layer?.gain) {
          layer.gain.gain.setTargetAtTime(v, ctx.currentTime, RAMP);
        }
      },

      playTap(volume = 0.6) {
        const ctx = ctxRef.current;
        const master = masterRef.current;
        if (!ctx || !master || ctx.state !== 'running') return;
        void fetchBuffer(ctx, TAP_FILE).then((buffer) => {
          const gain = ctx.createGain();
          gain.gain.value = volume;
          gain.connect(master);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(gain);
          source.onended = () => gain.disconnect();
          source.start(0);
        });
      },

      fadeOutAll(ms) {
        const ctx = ctxRef.current;
        const master = masterRef.current;
        if (!ctx || !master) return Promise.resolve();
        master.gain.setTargetAtTime(0, ctx.currentTime, ms / 1000 / 4);
        return new Promise((resolve) => {
          window.setTimeout(() => {
            for (const { source, gain } of layersRef.current.values()) {
              try {
                source?.stop();
              } catch {
                /* not started */
              }
              gain.disconnect();
            }
            layersRef.current.clear();
            master.gain.value = 1; // ready again if reused
            resolve();
          }, ms);
        });
      },
    };
  }, []);

  // Tear down on unmount: stop sources and close the context.
  useEffect(() => {
    const layers = layersRef.current;
    return () => {
      for (const { source, gain } of layers.values()) {
        try {
          source?.stop();
        } catch {
          /* not started */
        }
        gain.disconnect();
      }
      layers.clear();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    };
  }, []);

  return api;
}
