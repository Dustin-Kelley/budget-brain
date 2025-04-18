'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(data: { email: string; password: string }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(data: { email: string; password: string }) {
  const supabase = await createClient()

  console.log('Starting signup process for:', data.email)
  
  const { error, data: signupData } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  console.log('Signup response:', { error, signupData })

  if (error) {
    console.error('Signup error:', error)
    redirect('/error')
  }

  // Redirect to verify-email page after successful signup
  redirect('/verify-email')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}