/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF7F50", // Coral Orange (primary CTA)
          peach: "#FFD1BA", // Soft Peach (hover, accents)
          green: "#7FB77E", // Fresh Green (success/freshness)
          pink: "#F6B6C3", // Pastel Pink (playful tags)
          offwhite: "#FFF9F5", // App background
          gray: {
            light: "#EDEDED", // Inputs, borders
            DEFAULT: "#6B6B6B" // Text
          }
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Pacifico', 'cursive'] // Optional playful accent
      }
    },
  },
  plugins: [],
}
