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
        light_action_active: "#B71515",
        light_subheading: "#1F1F1F",
        dark_primary: "#1E1E24",
        dark_secondary: "#56718A",
        dark_action: "#ED2A1D",
        dark_action_active: "#BD1B0F",
        dark_subheading: "#E0E0E0",

        light_event: "#8344C2",
        light_event_active: "#7037A9",
        
        dark_event: "#66329A",
        dark_event_active: "#52287B",

        //* Exam Class Colors
        light_exam: "#8b0000",
        light_exam_active: "#b22727",
        dark_exam: "#640b0b",
        dark_exam_active: "#832a2a",

        //* Online Class Colors
        light_online: "#006400",
        light_online_active: "#1c811c",
        dark_online: "#084808",
        dark_online_active: "#1f5f1f",

        primary: "#0A1128",
        secondary: "#171717",
        font_primary: "#E0E0E2",
        font_secondary: "#B5BAD0",
      },
    },
  },
  plugins: [],
};
