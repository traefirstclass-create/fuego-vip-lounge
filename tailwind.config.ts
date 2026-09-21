import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fuego: {
          black: "#0a0908",
          charcoal: "#17140f",
          gold: "#d4a24e",
          goldBright: "#f2c879",
          red: "#8c1f1f",
          redBright: "#c1341f",
        },
      },
      boxShadow: {
        gold: "0 0 24px rgba(212, 162, 78, 0.45)",
        red: "0 0 24px rgba(193, 52, 31, 0.45)",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
