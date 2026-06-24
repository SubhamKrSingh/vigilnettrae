/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#090A0F",
        surface: "#111318",
        card: "#191C24",
        border: "#252830",
        blue: "#2B7FE8",
        purple: "#7F77DD",
        teal: "#1DB87A",
        coral: "#D85A30",
        amber: "#E09B20",
        text: "#E8E6E0",
        muted: "#888780",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
