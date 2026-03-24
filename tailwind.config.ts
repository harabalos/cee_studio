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
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        brand: "var(--color-brand)",
        "brand-hover": "var(--color-brand-hover)",
        accent: "var(--color-accent)",
      },
      fontFamily: {
        seasons: ["var(--font-seasons)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-line": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "loading-bar": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        kenburns: "kenburns 20s ease-in-out infinite alternate",
        marquee: "marquee 30s linear infinite",
        "pulse-line": "pulse-line 2s ease-in-out infinite",
        "loading-bar": "loading-bar 1.2s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
