/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#191919',
        surface: '#202020',
        surfaceHover: '#2d2d2d',
        border: '#373737',
        textMain: '#ffffff',
        textMuted: '#9b9b9b',
        accentBlue: '#2563eb',
        accentOrange: '#f97316',
        success: '#10b981',
        successBg: 'rgba(16, 185, 129, 0.1)',
        danger: '#ef4444',
        dangerBg: 'rgba(239, 68, 68, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
