/** True when PostgREST is talking to a database that has no transactions.account_id yet. */
export function isMissingAccountColumn(error: {
  code?: string;
  message?: string;
} | null) {
  if (!error) return false;
  if (error.code === '42703' || error.code === 'PGRST204') return true;
  const message = (error.message ?? '').toLowerCase();
  if (!message.includes('account_id')) return false;
  if (message.includes('does not exist')) return true;
  if (message.includes('schema cache')) return true;
  return false;
}
