'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import {
  DEFAULT_ACCOUNT_PRESETS,
  SPEND_CATEGORY_SEEDS,
} from '@/lib/ledger/constants';

/**
 * Idempotently seed spend categories + default accounts for a household.
 * Safe to call from Overview / Accounts on every visit.
 */
export async function ensureLedgerDefaults(householdId?: string | null) {
  const supabase = await createClient();
  let resolvedHouseholdId = householdId;

  if (!resolvedHouseholdId) {
    const { currentUser } = await getCurrentUser();
    resolvedHouseholdId = currentUser?.household_id;
  }

  if (!resolvedHouseholdId) {
    return { ok: false as const, error: 'Not signed in' };
  }

  const { data: existingCategories, error: catReadError } = await supabase
    .from('spend_categories')
    .select('id')
    .eq('household_id', resolvedHouseholdId)
    .limit(1);

  if (catReadError) {
    console.error('ensureLedgerDefaults categories read:', catReadError);
    return { ok: false as const, error: catReadError.message };
  }

  if (!existingCategories?.length) {
    const { error: catInsertError } = await supabase
      .from('spend_categories')
      .insert(
        SPEND_CATEGORY_SEEDS.map((seed) => ({
          household_id: resolvedHouseholdId!,
          name: seed.name,
          group_kind: seed.group_kind,
          sort_order: seed.sort_order,
          is_system: seed.is_system ?? false,
        })),
      );

    if (catInsertError) {
      console.error('ensureLedgerDefaults categories insert:', catInsertError);
      return { ok: false as const, error: catInsertError.message };
    }
  }

  const { data: existingAccounts, error: acctReadError } = await supabase
    .from('accounts')
    .select('id')
    .eq('household_id', resolvedHouseholdId)
    .limit(1);

  if (acctReadError) {
    console.error('ensureLedgerDefaults accounts read:', acctReadError);
    return { ok: false as const, error: acctReadError.message };
  }

  if (!existingAccounts?.length) {
    const { error: acctInsertError } = await supabase.from('accounts').insert(
      DEFAULT_ACCOUNT_PRESETS.map((preset) => ({
        household_id: resolvedHouseholdId!,
        name: preset.name,
        institution: preset.institution,
        account_type: preset.account_type,
        purpose: preset.purpose,
      })),
    );

    if (acctInsertError) {
      console.error('ensureLedgerDefaults accounts insert:', acctInsertError);
      return { ok: false as const, error: acctInsertError.message };
    }
  }

  return { ok: true as const };
}
