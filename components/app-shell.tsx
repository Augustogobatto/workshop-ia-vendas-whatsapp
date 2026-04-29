'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { AIPanel } from './ai-panel'

const DEFAULT_AI_W = 360

interface AppShellProps {
  userName?: string | null
  userEmail?: string | null
  ownedProducts?: { slug: string; name: string }[]
  children: React.ReactNode
}

export function AppShell({ userName, userEmail, ownedProducts = [], children }: AppShellProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiOpen, setAiOpen] = useState(true)
  const [aiWidth, setAiWidth] = useState(DEFAULT_AI_W)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
        setAiOpen(false)
      } else {
        const savedW = localStorage.getItem('ai_panel_w')
        if (savedW) setAiWidth(Math.min(580, Math.max(280, parseInt(savedW))))
        const savedOpen = localStorage.getItem('ai_panel_open')
        if (savedOpen === 'false') setAiOpen(false)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function toggleAI() {
    setAiOpen(v => {
      if (!isMobile) localStorage.setItem('ai_panel_open', String(!v))
      return !v
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>

      {/* ── Mobile top bar ───────────────────────────── */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 52,
          zIndex: 25,
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 12,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: 36, height: 36, flexShrink: 0,
              background: 'transparent', border: 'none',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 24, height: 24, flexShrink: 0,
              background: '#FFFFFF', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, lineHeight: 1,
            }}>🦾</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: 'var(--text)', whiteSpace: 'nowrap',
            }}>IA Revolution</span>
          </div>

          <button
            onClick={toggleAI}
            title={aiOpen ? 'Fechar Claudinei' : 'Abrir Claudinei'}
            style={{
              width: 36, height: 36, flexShrink: 0,
              background: aiOpen ? 'var(--green-10)' : 'transparent',
              border: `1px solid ${aiOpen ? 'rgba(0,255,136,0.25)' : 'transparent'}`,
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: aiOpen ? 'var(--green)' : 'var(--text-muted)',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Backdrop — sidebar overlay no mobile ─────── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 18,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      <Sidebar
        userName={userName}
        userEmail={userEmail}
        ownedProducts={ownedProducts}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
        isMobile={isMobile}
      />

      {/* Floating AI toggle button — desktop only */}
      {!aiOpen && !isMobile && (
        <button
          onClick={toggleAI}
          title="Abrir Claudinei"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 40,
            width: 42, height: 42, borderRadius: '50%',
            background: 'var(--green)', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(0,255,136,0.25), 0 6px 20px rgba(0,255,136,0.15)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)'
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,255,136,0.4), 0 8px 28px rgba(0,255,136,0.25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,255,136,0.25), 0 6px 20px rgba(0,255,136,0.15)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : (sidebarOpen ? 'var(--sidebar-w)' : 'var(--sidebar-collapsed-w)'),
          marginRight: isMobile ? 0 : (aiOpen ? aiWidth : 0),
          minHeight: '100dvh',
          overflowY: 'auto',
          paddingTop: isMobile ? 52 : 0,
          transition: 'margin 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {children}
      </main>

      <AIPanel
        open={aiOpen}
        onToggle={toggleAI}
        width={aiWidth}
        onWidthChange={setAiWidth}
        userName={userName}
        ownedProducts={ownedProducts}
        isMobile={isMobile}
      />
    </div>
  )
}
