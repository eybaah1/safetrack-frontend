import { useEffect } from 'react';

export default function useEscapeKey(enabled, onEscape) {
  useEffect(() => {
    if (!enabled) return;
    if (!onEscape) return;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      onEscape();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onEscape]);
}

