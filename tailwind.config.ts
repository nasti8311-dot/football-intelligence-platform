import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: "#ecfff4",
          400: "#36f29a",
          500: "#16d17d",
          900: "#072016"
        },
        ink: {
          900: "#05070c",
          800: "#0b1020",
          700: "#101827"
        }
      },
      boxShadow: {
        glow: "0 0 80px rgba(54, 242, 154, 0.14)",
        card: "0 20px 70px rgba(0,0,0,.35)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)"
      }
    },
  },
  plugins: [],
};

export default config;
