'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { setNavMode } from '@/components/shell/navModeAction';
import type { NavMode } from '@/components/shell/nav';

export function AppearanceSettings({ navMode }: { navMode: NavMode }) {
  return (
    <>
      <ThemePicker />
      <NavPicker current={navMode} />
    </>
  );
}

function ThemePicker() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Before mount next-themes has no value; showing nothing selected is
  // better than flashing the wrong selection.
  const active = mounted ? theme : undefined;

  return (
    <section>
      <div className='bb-kicker mb-3'>Theme</div>
      <div className='grid gap-3.5 sm:grid-cols-3'>
        <Option
          selected={active === 'light'}
          onSelect={() => setTheme('light')}
          title='Light'
          blurb='Paper ground, ink type'
          preview={
            <div className='flex h-[74px] items-center justify-center gap-1.5 overflow-hidden rounded-md border border-[var(--bb-line)] bg-[#efeeec]'>
              <span className='size-[22px] rounded-full bg-[#0f7ba0]' />
              <span className='size-[22px] rounded-full bg-[#e33f83]' />
            </div>
          }
        />
        <Option
          selected={active === 'dark'}
          onSelect={() => setTheme('dark')}
          title='Dark'
          blurb='Cool ink ground, brighter spots'
          preview={
            <div className='flex h-[74px] items-center justify-center gap-1.5 overflow-hidden rounded-md border border-[var(--bb-line)] bg-[#15181b]'>
              <span className='size-[22px] rounded-full bg-[#2aa4c9]' />
              <span className='size-[22px] rounded-full bg-[#e5478d]' />
            </div>
          }
        />
        <Option
          selected={active === 'system'}
          onSelect={() => setTheme('system')}
          title='Match system'
          blurb={
            mounted
              ? `Follows your device — now ${systemTheme ?? 'light'}`
              : 'Follows your device'
          }
          preview={
            <div className='flex h-[74px] overflow-hidden rounded-md border border-[var(--bb-line)]'>
              <div className='flex w-1/2 items-center justify-center bg-[#efeeec]'>
                <span className='size-[22px] rounded-full bg-[#0f7ba0]' />
              </div>
              <div className='flex w-1/2 items-center justify-center bg-[#15181b]'>
                <span className='size-[22px] rounded-full bg-[#2aa4c9]' />
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

function NavPicker({ current }: { current: NavMode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(current);

  const choose = (mode: NavMode) => {
    setOptimistic(mode);
    startTransition(async () => {
      await setNavMode(mode);
      router.refresh();
    });
  };

  return (
    <section>
      <div className='bb-kicker mb-3'>Navigation</div>
      <div className='grid max-w-[560px] gap-3.5 sm:grid-cols-2'>
        <Option
          selected={optimistic === 'sidebar'}
          disabled={pending}
          onSelect={() => choose('sidebar')}
          title='Sidebar'
          blurb='Every section visible — the default'
          preview={
            <div className='flex h-[74px] overflow-hidden rounded-md border border-[var(--bb-line)] bg-[var(--bb-bg)]'>
              <div className='flex w-[26%] flex-col gap-1 bg-[var(--bb-surface-2)] p-1.5'>
                <div className='h-[5px] rounded-[2px] bg-[var(--bb-line)]' />
                <div className='h-[5px] rounded-[2px] bg-[var(--bb-cy)]' />
                <div className='h-[5px] rounded-[2px] bg-[var(--bb-line)]' />
                <div className='h-[5px] rounded-[2px] bg-[var(--bb-line)]' />
              </div>
              <div className='flex flex-1 flex-col gap-1.5 p-1.5'>
                <div className='h-[7px] w-[52%] rounded-[2px] bg-[var(--bb-line)]' />
                <div className='flex-1 rounded-[3px] bg-[var(--bb-surface)]' />
              </div>
            </div>
          }
        />
        <Option
          selected={optimistic === 'top'}
          disabled={pending}
          onSelect={() => choose('top')}
          title='Top bar'
          blurb='Tabs across the top, wider content'
          preview={
            <div className='flex h-[74px] flex-col overflow-hidden rounded-md border border-[var(--bb-line)] bg-[var(--bb-bg)]'>
              <div className='flex h-4 items-center gap-1.5 bg-[var(--bb-surface-2)] px-1.5'>
                <div className='h-1 w-3.5 rounded-[2px] bg-[var(--bb-line)]' />
                <div className='h-1 w-3.5 rounded-[2px] bg-[var(--bb-cy)]' />
                <div className='h-1 w-3.5 rounded-[2px] bg-[var(--bb-line)]' />
                <div className='h-1 w-3.5 rounded-[2px] bg-[var(--bb-line)]' />
              </div>
              <div className='flex flex-1 flex-col items-center gap-1.5 p-1.5'>
                <div className='h-[7px] w-[46%] rounded-[2px] bg-[var(--bb-line)]' />
                <div className='flex-1 self-stretch rounded-[3px] bg-[var(--bb-surface)]' />
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

function Option({
  selected,
  disabled,
  onSelect,
  title,
  blurb,
  preview,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  blurb: string;
  preview: React.ReactNode;
}) {
  return (
    <button
      type='button'
      className='bb-opt disabled:opacity-60'
      data-on={selected}
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {preview}
      <div className='flex items-start gap-2.5'>
        <span className='mt-0.5 flex size-[15px] flex-none items-center justify-center rounded-full border-[1.5px] border-[var(--bb-line)]'>
          <span
            className='size-[7px] rounded-full bg-[var(--bb-cy)]'
            style={{ opacity: selected ? 1 : 0 }}
          />
        </span>
        <div>
          <div className='text-[14px] font-semibold'>{title}</div>
          <div className='mt-0.5 text-[12px] text-[var(--bb-dim)]'>{blurb}</div>
        </div>
      </div>
    </button>
  );
}
