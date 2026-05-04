/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#020b18',
        surface:  '#061325',
        card:     '#0a1b33',
        border:   '#182e4e',
        ink:      '#ffffff',
        muted:    '#94a3b8',
        primary:  '#D4AF37',
        'primary-foreground': '#000000',
        secondary:'#ffffff',
        'secondary-foreground': '#061325',
        accent:   '#1e3a8a',
        highlight:'#3b82f6',
        danger:   '#ef4444',
        gold:     '#D4AF37',
        info:     '#3b82f6',
        success:  '#10b981',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: { DEFAULT: '8px' },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'zoom-in-out': 'zoomInOut 20s infinite alternate ease-in-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        zoomInOut: { 
          '0%': { transform: 'scale(1)' }, 
          '100%': { transform: 'scale(1.15)' } 
        },
      },
    },
  },
  plugins: [],
}
