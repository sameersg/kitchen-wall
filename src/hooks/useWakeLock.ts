import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        setIsLocked(true);

        sentinel.addEventListener('release', () => {
          setIsLocked(false);
        });

        return sentinel;
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
        setIsLocked(false);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;

    const acquire = async () => {
      sentinel = await requestLock();
    };

    acquire();

    // Re-acquire when document becomes visible (e.g. after switching tabs or unlocking iPad)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        sentinel = await requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinel) {
        sentinel.release().catch(() => {});
      }
    };
  }, [requestLock]);

  return { isLocked, isSupported, requestLock };
}
