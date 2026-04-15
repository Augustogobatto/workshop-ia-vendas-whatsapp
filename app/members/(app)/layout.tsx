import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/members/login')

  const { data: lead } = await supabase
    .from('leads')
    .select('name, first_name, email')
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <Sidebar
        userName={lead?.name ?? null}
        userEmail={lead?.email ?? user.email ?? null}
      />
      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-w)',
          minHeight: '100dvh',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
