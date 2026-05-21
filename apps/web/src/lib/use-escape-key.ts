'use client';

import { useEffect } from 'react';

/**
 * Calls handler when the Escape key is released. Used by modal dialogs
 * so keyboard users can dismiss them. The handler runs even when the
 * focused element is inside the dialog because we listen on window.
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler, enabled]);
}
