'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NAV_MODE_COOKIE, type NavMode } from './nav';

/**
 * Nav mode lives in a cookie so the server renders the right chrome on first
 * paint. A year is arbitrary but long enough that it reads as "a setting".
 */
export async function setNavMode(mode: NavMode) {
  const store = await cookies();
  store.set(NAV_MODE_COOKIE, mode, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
