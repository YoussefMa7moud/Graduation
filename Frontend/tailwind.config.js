/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // slate-900
        'teal-accent': '#14b8a6', // teal-500
        'background-dark': '#0f172a',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
