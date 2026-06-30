/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          deeper: '#1D4ED8',
          light: '#60A5FA',
          glow: '#93C5FD',
        },
        navy: {
          950: '#050D1A',
          900: '#0A1628',
          800: '#0F2240',
          700: '#1A365D',
          600: '#234876',
        },
        qc: {
          bg: 'var(--qc-bg)',
          surface: 'var(--qc-surface)',
          'surface-2': 'var(--qc-surface-2)',
          'surface-3': 'var(--qc-surface-3)',
          border: 'var(--qc-border)',
          text: 'var(--qc-text)',
          muted: 'var(--qc-muted)',
          accent: 'var(--qc-accent)',
          'accent-2': 'var(--qc-accent-2)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--qc-shadow)',
      },
    },
  },
  plugins: [],
};
