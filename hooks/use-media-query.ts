'use client';

import { useEffect, useState } from 'react';

/**
 * True when the viewport matches a CSS media query.
 * Reads matchMedia, so it stays in step with layout breakpoints
 * (including device-mode previews) rather than the outer window size.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => {
      setMatches(media.matches);
    };
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
