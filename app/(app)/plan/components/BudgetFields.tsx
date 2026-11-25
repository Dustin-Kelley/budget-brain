'use client';

import { useEffect, useState } from 'react';
import { money } from '@/lib/budget/math';

export function parseMoneyInput(text: string) {
  const cleaned = text.replace(/[$,\s]/g, '');
  if (cleaned === '') return 0;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return money(value);
}

export function MoneyField({
  value,
  label,
  onSave,
}: {
  value: number;
  label: string;
  onSave: (amount: number) => Promise<boolean>;
}) {
  const [text, setText] = useState(value.toFixed(2));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(value.toFixed(2));
  }, [value]);

  async function commit() {
    const next = parseMoneyInput(text);
    if (next === null) {
      setText(value.toFixed(2));
      return;
    }
    if (next === value) {
      setText(next.toFixed(2));
      return;
    }
    setSaving(true);
    const saved = await onSave(next);
    setSaving(false);
    if (!saved) setText(value.toFixed(2));
  }

  return (
    <input
      aria-label={label}
      inputMode='decimal'
      value={text}
      disabled={saving}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        void commit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      className='h-11 w-[6.5rem] shrink-0 rounded-xl border border-[var(--bb-line)] bg-[var(--bb-surface-2)] px-2 text-right text-base font-semibold text-[var(--bb-text)] outline-none focus:border-[var(--bb-text)] md:h-8 md:w-[108px] md:text-sm'
    />
  );
}

export function NameField({
  value,
  label,
  onSave,
  className,
}: {
  value: string;
  label: string;
  onSave: (name: string) => Promise<boolean>;
  className?: string;
}) {
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  async function commit() {
    const next = text.trim();
    if (!next || next === value) {
      setText(value);
      return;
    }
    setSaving(true);
    const saved = await onSave(next);
    setSaving(false);
    if (!saved) setText(value);
  }

  return (
    <input
      aria-label={label}
      value={text}
      disabled={saving}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        void commit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      className={
        className ??
        'min-h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-[var(--bb-text)] outline-none md:min-h-0 md:text-[14.5px]'
      }
    />
  );
}
