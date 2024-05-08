/* @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/provider/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        light_primary: "#E8EBF7",
        light_secondary: "#ACBED8",
        light_action: "#DE1A1A",
        dark_primary: "#1E1E24",
        dark_secondary: "#E0E2DB",
        dark_action: "#ED2A1D",

        light_event: "#8344C2",
        light_event_active: "#7037A9",

        dark_event: "#66329A",
        dark_event_active: "#52287B",

        primary: "#0A1128",
        secondary: "#171717",
        font_primary: "#E0E0E2",
        font_secondary: "#B5BAD0",
      },
    },
  },
  plugins: [],
};
