/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0d1117',
        mist: '#f4f6fb',
        panel: '#ffffff',
        ocean: {
          500: '#0a8fbf',
          600: '#06749d',
          700: '#045977',
        },
      },
      boxShadow: {
        soft: '0 12px 30px -16px rgba(15, 23, 42, 0.35)',
      },
      backgroundImage: {
        'dashboard-glow':
          'radial-gradient(80% 100% at 0% 0%, rgba(10, 143, 191, 0.22) 0%, rgba(255,255,255,0) 55%), radial-gradient(80% 100% at 100% 0%, rgba(4, 89, 119, 0.18) 0%, rgba(255,255,255,0) 58%)',
      },
    },
  },
  plugins: [],
}

