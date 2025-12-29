/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a58e0',
        danger: '#d32f2f',
        dark: '#2a2a2a',
      },
    },
  },
  plugins: [],
}

