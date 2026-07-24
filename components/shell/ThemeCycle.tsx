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

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'cursor-pointer text-[var(--bb-cy-text)] transition-opacity hover:opacity-70',
        className,
      )}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {/* Render a stable glyph until mounted so the markup matches on hydration. */}
      <Icon
        name={mounted && isDark ? 'sun' : 'moon'}
        size={size}
      />
    </button>
  );
}
