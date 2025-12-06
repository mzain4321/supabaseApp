/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "instagram-purple": "#833AB4",
        "instagram-pink": "#E1306C",
        "instagram-orange": "#F77737",
      },
    },
  },
  plugins: [],
};
