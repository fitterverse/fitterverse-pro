/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
      colors: {
        brand: {
          primary: 'rgb(0, 128, 255)',
          hover: 'rgb(0, 153, 255)',
          active: 'rgb(0, 102, 204)',
        },
      },
    },
  },
  plugins: [],
}
