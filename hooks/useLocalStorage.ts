'use client';
import { useState, useEffect, useCallback } from 'react';

/**
 * Hydration-safe localStorage hook.
 * Always starts with initialValue (for SSR/hydration parity),
 * then reads from localStorage on the client after mount.
 * Returns [value, set, isHydrated].
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // ignore parse errors, fall back to initialValue
    }
    setIsHydrated(true);
  }, [key]);

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue(prev => {
        const resolved =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prev)
            : newValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // ignore quota / access errors
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set, isHydrated] as const;
}
