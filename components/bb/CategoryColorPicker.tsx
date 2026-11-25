'use client';

import { useState } from 'react';
import {
  CATEGORY_COLORS,
  categoryColorByKey,
  type CategoryColorKey,
} from '@/lib/category-colors';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function CategoryDot({
  color,
  className = 'size-2.5',
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block flex-none rounded-full ${className}`}
      style={{ background: color }}
    />
  );
}

export function CategoryColorPicker({
  name,
  color,
  colorKey,
  onPick,
}: {
  name: string;
  color: string;
  colorKey: CategoryColorKey;
  onPick: (key: CategoryColorKey) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const current = categoryColorByKey(colorKey);

  async function pick(key: CategoryColorKey) {
    setPending(true);
    const saved = await onPick(key);
    setPending(false);
    if (saved) setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <button
          type='button'
          className='inline-flex size-11 flex-none items-center justify-center rounded-full md:size-8'
          aria-label={`Color for ${name}, ${current.name}`}
          disabled={pending}
        >
          <CategoryDot color={color} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-[240px] p-3'
      >
        <p className='mb-2 text-[12px] font-semibold'>Group color</p>
        <div className='grid grid-cols-4 gap-1'>
          {CATEGORY_COLORS.map((swatch) => {
            const selected = swatch.key === colorKey;
            let ring: string | undefined;
            if (selected) {
              ring = '0 0 0 2px var(--bb-surface), 0 0 0 3.5px var(--bb-text)';
            }
            return (
              <button
                key={swatch.key}
                type='button'
                aria-label={swatch.name}
                aria-pressed={selected}
                disabled={pending}
                onClick={() => {
                  void pick(swatch.key);
                }}
                className='flex flex-col items-center gap-1 rounded-lg px-1 py-1.5'
              >
                <span
                  className='size-5 rounded-full'
                  style={{
                    background: `var(${swatch.cssVar})`,
                    boxShadow: ring,
                  }}
                />
                <span className='text-center text-[10px] leading-none text-[var(--bb-sub)]'>
                  {swatch.name}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
