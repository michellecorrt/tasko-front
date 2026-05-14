/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        primary: '#203d7f',
        'primary-dark': '#162a5c',
        'primary-light': '#2d52a8',
        surface: '#0f172a',
        'surface-2': '#1e293b',
      },
    },
  },
  plugins: [],
}
