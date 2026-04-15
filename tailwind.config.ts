import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        ui: ['var(--font-ui)', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        'bg-3': 'var(--bg-3)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        green: 'var(--green)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        dim: 'var(--text-dim)',
        border: 'var(--border)',
        'border-2': 'var(--border-2)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
      },
      spacing: {
        sidebar: 'var(--sidebar-w)',
      },
    },
  },
  plugins: [],
}
export default config
