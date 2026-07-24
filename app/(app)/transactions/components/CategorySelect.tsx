'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateLedgerCategory } from '@/app/mutations/importLedgerFile';

/**
 * Inline recategorise. Saves on change rather than behind a Save button — the
 * design's table has no room for one, and this is the most repeated action on
 * the screen.
 */
export function CategorySelect({
  transactionId,
  value,
  categories,
}: {
  transactionId: string;
  value: string | null;
  categories: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value ?? 'none'}
      disabled={pending}
      aria-label='Category'
      className='w-full max-w-[130px] cursor-pointer truncate rounded-md border border-transparent bg-transparent py-0.5 text-[12.5px] text-[var(--bb-sub)] transition-colors hover:border-[var(--bb-line)] focus-visible:border-[var(--bb-cy)] disabled:opacity-50'
      onChange={(event) => {
        const formData = new FormData();
        formData.set('transaction_id', transactionId);
        formData.set('spend_category_id', event.target.value);
        startTransition(async () => {
          const result = await updateLedgerCategory(formData);
          if (result?.error) toast.error(result.error);
        });
      }}
    >
      <option value='none'>Uncategorised</option>
      {categories.map((category) => (
        <option
          key={category.id}
          value={category.id}
        >
          {category.name}
        </option>
      ))}
    </select>
  );
}
