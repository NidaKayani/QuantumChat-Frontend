/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        qc: {
          navy950: '#050D1A',
          navy900: '#0A1628',
          navy800: '#0F2240',
          navy700: '#1A365D',
          navy600: '#234876',
          accent: '#3B82F6',
          accentLight: '#60A5FA',
          text: '#F1F5F9',
          muted: '#94A3B8',
          border: 'rgba(148, 163, 184, 0.15)',
        },
      },
      boxShadow: {
        widget: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.15)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: false },
};
