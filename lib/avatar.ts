/** Profile photo from Supabase Auth metadata, when a provider stored one. */
export function avatarUrlFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return null;
  const record = metadata as Record<string, unknown>;
  const candidates = [record.avatar_url, record.picture, record.avatar];
  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
  }
  return null;
}

/** One or two letters. Empty when there is nothing to abbreviate. */
export function initialsFromName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
) {
  const first = (firstName ?? '').trim().charAt(0);
  const last = (lastName ?? '').trim().charAt(0);
  const fromName = `${first}${last}`;
  if (fromName) return fromName.toUpperCase();
  const fromEmail = (email ?? '').trim().charAt(0);
  if (fromEmail) return fromEmail.toUpperCase();
  return '';
}
