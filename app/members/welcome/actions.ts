'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function markWelcomed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/members/login')

  await supabase
    .from('leads')
    .update({ welcomed_at: new Date().toISOString() })
    .eq('auth_user_id', user.id)

  redirect('/members')
}
