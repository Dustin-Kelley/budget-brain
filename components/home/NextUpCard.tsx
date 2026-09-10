'use client';

import { useState } from 'react';
import { Icon } from '@/components/shell/Icon';
import { DEMO_NEXT_UP } from '@/lib/foo/demo';

export function NextUpCard() {
  const [marked, setMarked] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <section className='bb-card flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center'>
      <span
        className='flex size-[48px] flex-none items-center justify-center rounded-full bg-[var(--bb-cy-tint)] text-[var(--bb-cy-text)]'
        aria-hidden
      >
        <Icon
          name='wallet'
          size={24}
        />
      </span>

      <div className='min-w-0 flex-1'>
        <p className='bb-kicker text-[var(--bb-cy-text)]'>Next up</p>
        <h2 className='mt-1 text-[20px] font-semibold tracking-[-0.015em]'>
          {DEMO_NEXT_UP.title}
        </h2>
        {marked && (
          <p className='mt-1.5 text-[12.5px] text-[var(--bb-dim)]'>
            {DEMO_NEXT_UP.demoNote}
          </p>
        )}
        {whyOpen && (
          <p className='mt-2 max-w-[52ch] text-[13.5px] text-[var(--bb-sub)]'>
            {DEMO_NEXT_UP.whyBody}
          </p>
        )}
      </div>

      <div className='flex flex-none flex-wrap gap-2.5'>
        <button
          type='button'
          className='bb-solid'
          disabled={marked}
          onClick={() => setMarked(true)}
        >
          {marked ? DEMO_NEXT_UP.markedLabel : DEMO_NEXT_UP.markLabel}
        </button>
        <button
          type='button'
          className='bb-ghost bb-ghost-accent'
          aria-expanded={whyOpen}
          onClick={() => setWhyOpen((open) => !open)}
        >
          {DEMO_NEXT_UP.whyTitle}
        </button>
      </div>
    </section>
  );
}
