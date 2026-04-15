'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  {
    label: 'Dashboard',
    href: '/members',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: 'Meus cursos',
    href: '/members',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4.5C2 3.67 2.67 3 3.5 3h9C13.33 3 14 3.67 14 4.5v7c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6.5 6.5 9 8l-2.5 1.5v-3Z" fill="currentColor"/>
      </svg>
    ),
  },
]

interface SidebarProps {
  userName?: string | null
  userEmail?: string | null
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/members/login')
  }

  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: 'var(--green)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 10.5H1L7 1Z" fill="#0A0A0A"/>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                lineHeight: 1.1,
              }}
            >
              IA Revolution
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
              Área de membros
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ marginBottom: 4 }}>
          {NAV.map((item) => {
            const active = item.href === '/members'
              ? pathname === '/members'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 10px',
                  borderRadius: 'var(--radius)',
                  fontSize: 13.5,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  background: active ? 'var(--surface)' : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                  marginBottom: 1,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--bg-3)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }
                }}
              >
                <span style={{ color: active ? 'var(--green)' : 'inherit', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User + Sign out */}
      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '8px 10px', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--green-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--green)',
                border: '1px solid var(--border-2)',
              }}
            >
              {(userName ?? userEmail ?? '?')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              {userName && (
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </div>
              )}
              {userEmail && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
            fontFamily: 'var(--font-ui)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-3)'
            e.currentTarget.style.color = 'var(--red)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5M9.5 9.5 13 7l-3.5-2.5M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  )
}
