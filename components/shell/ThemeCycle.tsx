'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

/** One-click light↔dark, matching the header/sidebar toggle in the design. */
export function ThemeCycle({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // The resolved theme is unknown on the server, so everything that depends on
  // it — glyph and label alike — must wait for mount or hydration mismatches.
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type='button'
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'cursor-pointer text-[var(--bb-cy-text)] transition-opacity hover:opacity-70',
        className,
      )}
      aria-label={mounted ? (isDark ? 'Switch to light theme' : 'Switch to dark theme') : 'Toggle theme'}
    >
      <Icon
        name={isDark ? 'sun' : 'moon'}
        size={size}
      />
    </button>
  );
}
