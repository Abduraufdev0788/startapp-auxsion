/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        lotly: {
          blue: '#2563eb',
          purple: '#7c3aed',
          accent: '#10b981',
          dark: '#090d16',
          card: '#0f172a',
          surface: '#1e293b',
        },
        brand: {
          dark: '#0b0f19',
          card: '#111827',
          border: '#1f2937',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px -5px rgba(16, 185, 129, 0.4)' },
          'to': { boxShadow: '0 0 35px 5px rgba(16, 185, 129, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}

