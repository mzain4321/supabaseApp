/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          pink: '#E1306C',
          purple: '#833AB4',
          yellow: '#FCAF45',
          orange: '#FD1D1D',
          blue: '#405DE6',
        }
      }
    },
  },
  plugins: [],
}