/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji']
      },
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bce7ff',
          300: '#8fd7ff',
          400: '#5cc2ff',
          500: '#2aa9ff',
          600: '#1787db',
          700: '#136cb0',
          800: '#135a8f',
          900: '#134d78'
        },
        accent: {
          500: '#7c5cff',
          600: '#6b46ff',
          700: '#5b38e6'
        }
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(0,0,0,0.12)'
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
