'use client';

import { useEffect, useState } from 'react';

// A full navigation between microapps must retain the same-tab demo state.
// Start with identical server/client defaults, then restore after hydration.
export function useDemoState<T extends unknown[]>(key: string, initialValue: T) {
  const storageKey = `erp-demo:v1:${key}`;
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setValue(parsed as T);
      }
    } catch {
      // Demo pages still work when browser storage is unavailable.
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try { window.sessionStorage.setItem(storageKey, JSON.stringify(value)); } catch {}
  }, [ready, storageKey, value]);

  return [value, setValue] as const;
}
