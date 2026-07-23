'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { parseImportFile } from '@/lib/ledger/importParsers';
import { ensureLedgerDefaults } from '@/app/mutations/ensureLedgerDefaults';

export type ImportResult = {
  error: string | null;
  imported?: number;
  skipped?: number;
};

export async function importLedgerFile(formData: FormData): Promise<ImportResult> {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id || !currentUser.id) {
    return { error: 'You must be signed in to import transactions.' };
  }

  const accountId = String(formData.get('account_id') ?? '');
  const categoryIdRaw = String(formData.get('spend_category_id') ?? '');
  const file = formData.get('file');

  if (!accountId) {
    return { error: 'Choose an account to import into.' };
  }
  if (!(file instanceof File)) {
    return { error: 'Choose a CSV, OFX, or QFX file to import.' };
  }

  const text = await file.text();
  if (!text.trim()) {
    return { error: 'The selected file is empty.' };
  }

  let rows;
  try {
    rows = parseImportFile(file.name || 'import.csv', text);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to parse import file.';
    return { error: message };
  }

  await ensureLedgerDefaults(currentUser.household_id);
  const supabase = await createClient();

  // Confirm account belongs to household
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .eq('household_id', currentUser.household_id)
    .single();

  if (accountError || !account) {
    return { error: 'That account was not found in your household.' };
  }

  let defaultCategoryId: string | null =
    categoryIdRaw && categoryIdRaw !== 'none' ? categoryIdRaw : null;

  // If no default category, try to map Income for inflows later per-row;
  // leave null for now and let overview show Uncategorized.
  if (defaultCategoryId) {
    const { data: cat } = await supabase
      .from('spend_categories')
      .select('id')
      .eq('id', defaultCategoryId)
      .eq('household_id', currentUser.household_id)
      .maybeSingle();
    if (!cat) defaultCategoryId = null;
  }

  const { data: incomeCategory } = await supabase
    .from('spend_categories')
    .select('id')
    .eq('household_id', currentUser.household_id)
    .eq('name', 'Income')
    .maybeSingle();

  const payload = rows.map((row) => ({
    household_id: currentUser.household_id,
    account_id: accountId,
    amount: row.amount,
    posted_at: row.postedAt,
    description: row.description,
    merchant: row.merchant ?? null,
    source: 'import' as const,
    external_id: row.externalId ?? null,
    created_by: currentUser.id,
    spend_category_id:
      row.amount > 0 && incomeCategory?.id
        ? incomeCategory.id
        : defaultCategoryId,
  }));

  // Upsert-like behavior: insert and ignore duplicates on (account_id, external_id)
  let imported = 0;
  let skipped = 0;

  // Insert in chunks to avoid payload limits
  const chunkSize = 100;
  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('ledger_transactions')
      .upsert(chunk, {
        onConflict: 'account_id,external_id',
        ignoreDuplicates: true,
      })
      .select('id');

    if (error) {
      console.error('importLedgerFile:', error);
      return {
        error: `Import failed: ${error.message}`,
        imported,
        skipped,
      };
    }

    const inserted = data?.length ?? 0;
    imported += inserted;
    skipped += chunk.length - inserted;
  }

  revalidatePath('/');
  revalidatePath('/accounts');
  revalidatePath('/transactions');

  return { error: null, imported, skipped };
}

export async function updateLedgerCategory(formData: FormData) {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id) {
    return { error: 'You must be signed in.' };
  }

  const txnId = String(formData.get('transaction_id') ?? '');
  const categoryIdRaw = String(formData.get('spend_category_id') ?? '');
  const categoryId =
    !categoryIdRaw || categoryIdRaw === 'none' ? null : categoryIdRaw;

  if (!txnId) {
    return { error: 'Transaction id is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('ledger_transactions')
    .update({
      spend_category_id: categoryId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', txnId)
    .eq('household_id', currentUser.household_id);

  if (error) {
    console.error('updateLedgerCategory:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/transactions');
  return { error: null };
}
