import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#fbf6ed",
        champagne: "#eadfc9",
        blush: "#ebc2bb",
        rose: "#d7a79c",
        cocoa: "#8b5a46",
        sage: "#6f7a57",
        moss: "#2f3a22",
        terracotta: "#c9785e",
        wine: "#6e0d1b",
        ink: "#2d241f"
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        script: ["var(--font-great-vibes)", "cursive"],
        sans: ["var(--font-montserrat)", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(86, 54, 42, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
