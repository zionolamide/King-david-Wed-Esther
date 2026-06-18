import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#fbf6ed",
        champagne: "#eadfc9",
        blush: "#e9c0b6",
        rose: "#c89485",
        sage: "#737b54",
        moss: "#3f481f",
        terracotta: "#c97658",
        wine: "#7b0014",
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
