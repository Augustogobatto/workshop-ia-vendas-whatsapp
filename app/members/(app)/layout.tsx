export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/app-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/members/login')

  const { data: lead } = await supabase
    .from('leads')
    .select('name, first_name, email, welcomed_at')
    .single()

  if (lead && !lead.welcomed_at) redirect('/members/welcome')

  const { data: catalog = [] } = await supabase.rpc('get_catalog_with_access')
  const ownedProducts = (catalog ?? [])
    .filter((p: { has_access: boolean; product_slug: string; product_name: string }) => p.has_access)
    .map((p: { product_slug: string; product_name: string }) => ({ slug: p.product_slug, name: p.product_name }))

  return (
    <AppShell
      userName={lead?.first_name ?? lead?.name ?? null}
      userEmail={lead?.email ?? user.email ?? null}
      ownedProducts={ownedProducts}
    >
      {children}
    </AppShell>
  )
}
