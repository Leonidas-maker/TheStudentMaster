/* @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0A1128',
        secondary: '#171717',
        font_primary: '#E0E0E2',
        font_secondary: '#B5BAD0'
      },
    },
  },
  plugins: [],
}
