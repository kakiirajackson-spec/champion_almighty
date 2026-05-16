/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'insta-purple': '#833ab4',
        'insta-pink': '#fd1d1d',
        'insta-orange': '#fcb045',
        'dark-card': '#121212',
      }
    },
  },
  plugins: [],
}