'use client';

import { useEffect } from 'react';

/**
 * Registers the production service worker. Dev skips this so hot reload
 * is not intercepted.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Private mode and some browsers reject registration. The site still works.
    });
  }, []);

  return null;
}
