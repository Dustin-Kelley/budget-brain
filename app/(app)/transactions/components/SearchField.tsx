'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/shell/Icon';

/** Debounced merchant search, kept in the URL so results stay shareable. */
export function SearchField({ initial }: { initial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (value === initial) return;

    const timer = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (value) next.set('q', value);
      else next.delete('q');
      next.delete('show');
      router.push(`${pathname}?${next.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
    // `params`/`router` are stable enough here; re-running on them would
    // re-fire the push that changed them in the first place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className='flex min-w-[190px] items-center gap-2.5 rounded-[10px] border border-[var(--bb-line)] bg-[var(--bb-surface)] px-3.5 py-2 text-[13.5px]'>
      <Icon
        name='magnifying-glass'
        size={16}
        className='flex-none text-[var(--bb-dim)]'
      />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder='Search merchants'
        className='w-full bg-transparent outline-none placeholder:text-[var(--bb-dim)]'
      />
    </label>
  );
}
