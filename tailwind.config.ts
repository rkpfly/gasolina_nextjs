import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0A0A0A",
          ink: "#07070B",
          white: "#FFFFFF",
          offwhite: "#F4F4F5",
          gray: "#86868B",
          border: "#E5E5E5",
          // Neon accents — electric violet leads, neon green pops (site-wide)
          lime: "#6CFB13",
          accent: "#FF2E93",
          pink: "#FF2E93",
          blue: "#723CF4",
          coral: "#FF6B4A",
          purple: "#7C5CFF",
        },
        club: {
          purple: "#723CF4",
          green: "#6CFB13",
          // FUEGO red rebrand
          red: "#FF2323",
          ember: "#FF5A2E",
          crimson: "#B00010",
          cream: "#FDFBD4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-syne)", "sans-serif"],
      },
      transitionTimingFunction: {
        custom: "cubic-bezier(0.83, 0, 0.17, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
