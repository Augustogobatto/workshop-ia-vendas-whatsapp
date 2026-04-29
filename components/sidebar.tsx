'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const WORKSHOP_ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
    <path d="M2 4.5C2 3.67 2.67 3 3.5 3h9C13.33 3 14 3.67 14 4.5v7c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6.5 6.5 9 8l-2.5 1.5v-3Z" fill="currentColor"/>
  </svg>
)

interface SidebarProps {
  userName?: string | null
  userEmail?: string | null
  ownedProducts?: { slug: string; name: string }[]
  open?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

export function Sidebar({ userName, userEmail, ownedProducts = [], open = true, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/members/login')
  }

  const initial = (userName ?? userEmail ?? '?')[0].toUpperCase()

  return (
    <aside
      style={{
        width: isMobile ? '280px' : (open ? 'var(--sidebar-w)' : 'var(--sidebar-collapsed-w)'),
        transform: isMobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 20,
        overflow: 'hidden',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* ── Logo / Header ─────────────────────────────── */}
      <div style={{
        padding: open ? '16px 16px 14px' : '16px 0 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        flexShrink: 0,
        gap: 8,
      }}>
        <Link
          href="/members"
          title="IA Revolution"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}
        >
          <div style={{
            width: 28, height: 28, flexShrink: 0,
            background: '#FFFFFF', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, lineHeight: 1,
          }}>
            🦾
          </div>
          {open && (
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 13.5, letterSpacing: '0.04em', textTransform: 'uppercase',
                color: 'var(--text)', lineHeight: 1.1, whiteSpace: 'nowrap',
              }}>
                IA Revolution
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
                Área de membros
              </div>
            </div>
          )}
        </Link>

        {onToggle && open && (
          <button
            onClick={onToggle}
            title={isMobile ? 'Fechar menu' : 'Recolher menu'}
            style={{
              width: 26, height: 26, flexShrink: 0,
              background: 'transparent', border: 'none',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-dim)',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            {isMobile ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3.5h10M2 7h10M2 10.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav style={{
        padding: open ? '10px 8px' : '10px 0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: open ? 'stretch' : 'center',
      }}>
        {/* Dashboard */}
        {(() => {
          const href = '/members'
          const active = pathname === '/members'
          return (
            <NavLink key="dashboard" href={href} label="Dashboard" active={active} open={open}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </NavLink>
          )
        })()}

        {/* Owned workshops */}
        {ownedProducts.map((product) => {
          const href = `/members/${product.slug}`
          const active = pathname.startsWith(href)
          return (
            <NavLink key={product.slug} href={href} label={product.name} active={active} open={open}>
              {WORKSHOP_ICON}
            </NavLink>
          )
        })}

        {/* Expandir — só aparece no modo compacto desktop */}
        {!open && !isMobile && onToggle && (
          <button
            onClick={onToggle}
            title="Expandir menu"
            style={{
              marginTop: 4,
              width: 36, height: 36,
              background: 'transparent', border: 'none',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-dim)',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M5.5 3.5 9 7.5l-3.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </nav>

      {/* ── User + Sign out ───────────────────────────── */}
      <div style={{
        padding: open ? '10px 8px 14px' : '10px 0 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: open ? 'stretch' : 'center',
        gap: 2,
      }}>
        {/* Avatar / user info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: open ? '7px 10px' : '7px',
          borderRadius: 'var(--radius)',
        }}>
          <div
            title={!open ? (userName ?? userEmail ?? undefined) : undefined}
            style={{
              width: 28, height: 28, flexShrink: 0,
              borderRadius: '50%',
              background: 'var(--green-subtle)',
              border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--green)',
            }}
          >
            {initial}
          </div>
          {open && (
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
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          title={!open ? 'Sair' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
            gap: 8,
            padding: open ? '6px 10px' : '9px',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
            fontFamily: 'var(--font-ui)',
            width: open ? '100%' : 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--red)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5M9.5 9.5 13 7l-3.5-2.5M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {open && 'Sair'}
        </button>
      </div>
    </aside>
  )
}

function NavLink({
  href,
  label,
  active,
  open,
  children,
}: {
  href: string
  label: string
  active: boolean
  open: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      title={!open ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center',
        gap: 10,
        padding: open ? '7px 10px' : '9px',
        borderRadius: 'var(--radius)',
        fontSize: 13.5,
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--text)' : 'var(--text-muted)',
        background: active ? 'var(--surface)' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
        width: open ? '100%' : 'auto',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-3)'
          e.currentTarget.style.color = 'var(--text)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-muted)'
        }
      }}
    >
      <span style={{ color: active ? 'var(--green)' : 'inherit', flexShrink: 0, display: 'flex' }}>
        {children}
      </span>
      {open && label}
    </Link>
  )
}
