/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)']
      },
      colors: {
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        red: 'var(--red)',
        'red-deep': 'var(--red-deep)',
        amber: 'var(--amber)',
        'amber-deep': 'var(--amber-deep)',
        green: 'var(--green)',
        'green-deep': 'var(--green-deep)'
      },
      boxShadow: {
        soft: '0 8px 32px rgba(0, 0, 0, 0.30)',
        glow: '0 0 20px rgba(129, 140, 248, 0.15), 0 8px 32px rgba(0, 0, 0, 0.25)'
      },
      backdropBlur: {
        glass: '16px'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 500ms ease-out both',
        'fade-in': 'fadeIn 500ms ease-out both'
      }
    }
  },
  plugins: []
};
