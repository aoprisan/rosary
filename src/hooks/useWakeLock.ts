import { useEffect, useRef } from 'react';

/**
 * Holds a screen wake lock while `active` is true, so the phone may be set down
 * mid-prayer without the screen sleeping. Sentinels are released by the OS when
 * the tab is hidden, so we re-acquire on `visibilitychange`. Where the API is
 * absent (e.g. iOS Safari historically), this is a silent no-op.
 */
export function useWakeLock(active: boolean) {
  const sentinel = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) return;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await lock.release().catch(() => {});
          return;
        }
        sentinel.current = lock;
      } catch {
        /* rejected (not visible, permission, unsupported) — leave it be */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && sentinel.current === null) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      sentinel.current?.release().catch(() => {});
      sentinel.current = null;
    };
  }, [active]);
}
