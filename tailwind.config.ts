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
          // Neon accents (poster palette) — lime leads
          lime: "#C6F94B",
          accent: "#FF2E93",
          pink: "#FF2E93",
          blue: "#3E6FF5",
          coral: "#FF6B4A",
          purple: "#7C5CFF",
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
