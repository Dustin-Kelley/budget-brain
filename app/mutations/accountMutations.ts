'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { ensureLedgerDefaults } from '@/app/mutations/ensureLedgerDefaults';

export async function createAccount(formData: FormData) {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id) {
    return { error: 'You must be signed in to create an account.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const institution = String(formData.get('institution') ?? '').trim() || null;
  const purpose = String(formData.get('purpose') ?? 'other');
  const accountType = String(formData.get('account_type') ?? 'checking');
  const balanceRaw = String(formData.get('current_balance') ?? '').trim();
  const currentBalance = balanceRaw ? Number(balanceRaw) : null;

  if (!name) {
    return { error: 'Account name is required.' };
  }

  await ensureLedgerDefaults(currentUser.household_id);
  const supabase = await createClient();

  const { error } = await supabase.from('accounts').insert({
    household_id: currentUser.household_id,
    name,
    institution,
    purpose,
    account_type: accountType,
    current_balance:
      currentBalance != null && Number.isFinite(currentBalance)
        ? currentBalance
        : null,
  });

  if (error) {
    console.error('createAccount:', error);
    return { error: error.message };
  }

  revalidatePath('/accounts');
  revalidatePath('/');
  return { error: null };
}

export async function updateAccountBalance(formData: FormData) {
  const { currentUser } = await getCurrentUser();
  if (!currentUser?.household_id) {
    return { error: 'You must be signed in.' };
  }

  const accountId = String(formData.get('account_id') ?? '');
  const balanceRaw = String(formData.get('current_balance') ?? '').trim();
  const currentBalance = balanceRaw === '' ? null : Number(balanceRaw);

  if (!accountId) {
    return { error: 'Account id is required.' };
  }
  if (currentBalance != null && !Number.isFinite(currentBalance)) {
    return { error: 'Balance must be a number.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('accounts')
    .update({
      current_balance: currentBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('household_id', currentUser.household_id);

  if (error) {
    console.error('updateAccountBalance:', error);
    return { error: error.message };
  }

  revalidatePath('/accounts');
  revalidatePath('/');
  return { error: null };
}
