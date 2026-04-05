/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#111827',
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        danger: '#EF4444',
        success: '#10B981',
        muted: '#6B7280',
        glass: 'rgba(17, 24, 39, 0.75)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
