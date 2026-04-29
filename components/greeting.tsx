'use client'

import { useEffect, useState } from 'react'

function buildGreeting(name?: string | null): string {
  const h = new Date().getHours()
  const parte = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return name ? `${parte}, ${name.split(' ')[0]}` : parte
}

export function Greeting({ name }: { name?: string | null }) {
  const [text, setText] = useState('')

  useEffect(() => {
    setText(buildGreeting(name))
  }, [name])

  return (
    <h1
      className="heading-xl"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: 'var(--text)',
        lineHeight: 1.1,
        minHeight: '1.1em',
      }}
    >
      {text}.
    </h1>
  )
}
