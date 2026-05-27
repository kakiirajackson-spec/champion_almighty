/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cv-bg': '#0b0d14',      // The "Midnight" background
        'cv-surface': '#121420', // The "Card" face
        'cv-border': '#1e2235',  // The "Crisp" border
        'insta-purple': '#833ab4',
        'insta-pink': '#fd1d1d',
        'insta-orange': '#fcb045',
      }
    },
  },
  plugins: [],
}