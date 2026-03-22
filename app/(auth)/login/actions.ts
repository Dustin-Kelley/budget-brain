'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function sendOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient()

  const { error, data } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user record exists in our users table
  if (data.user) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single()

    // If no user record, this is a new sign-up — create household and user
    if (!existingUser) {
      const { data: householdData, error: householdError } = await supabase
        .from('household')
        .insert({ name: 'Your Household' })
        .select()
        .single()

      if (householdError || !householdData) {
        return { error: 'Failed to create household' }
      }

      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        household_id: householdData.id,
      })

      if (userError) {
        return { error: 'Failed to create user profile' }
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/welcome')
}
