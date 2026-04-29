import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markWelcomed } from './actions'

const VIDEO_URL = 'https://www.loom.com/embed/71b85bb424ea46eaaea17c8c3d3b98e9?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/members/login')

  const { data: lead } = await supabase
    .from('leads')
    .select('first_name, name, welcomed_at')
    .single()

  // Já viu a tela de boas-vindas
  if (lead?.welcomed_at) redirect('/members')

  const firstName = lead?.first_name ?? lead?.name?.split(' ')[0] ?? null

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: '#FFFFFF',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          🦾
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text)',
          }}
        >
          IA Revolution
        </span>
      </div>

      {/* Card */}
      <div
        className="fade-up"
        style={{
          width: '100%',
          maxWidth: 680,
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Vídeo */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
          <iframe
            src={VIDEO_URL}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              border: 'none',
            }}
          />
        </div>

        {/* Texto + botão */}
        <div style={{ padding: '32px 36px 36px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 12,
              lineHeight: 1.2,
            }}
          >
            {firstName ? `Bem-vindo, ${firstName}.` : 'Bem-vindo.'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28, maxWidth: '55ch' }}>
            Assista ao vídeo acima antes de entrar na área de membros.
            Tem informações importantes sobre o workshop e como aproveitar ao máximo.
          </p>

          <form action={markWelcomed}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                background: 'var(--green)',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Entrar na área de membros →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
