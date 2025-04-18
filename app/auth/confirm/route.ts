import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  console.log('Verification attempt:', {
    token_hash,
    type,
    url: request.url
  })

  if (!token_hash || !type) {
    console.log('Missing required parameters')
    return redirect('/error')
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.verifyOtp({
    type: 'email',
    token_hash,
  })

  console.log('Verification response:', { error, data })

  if (error) {
    console.error('Verification failed:', error)
    return redirect('/error')
  }

  // If we get here, verification was successful
  console.log('Verification successful, redirecting to home')
  return redirect('/')
}