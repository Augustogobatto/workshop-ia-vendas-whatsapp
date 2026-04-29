export default function Loading() {
  return (
    <div style={{
      minHeight: '60dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          width: 28,
          height: 28,
          border: '2.5px solid var(--border-2)',
          borderTopColor: 'var(--green)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{
          fontSize: 12,
          color: 'var(--text-dim)',
          letterSpacing: '0.04em',
        }}>
          Carregando…
        </span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
