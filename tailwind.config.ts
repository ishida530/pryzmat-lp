import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1B3A6B",
          blue: "#2E6EC5",
          red: "#C0392B",
          "dark-navy": "#0f2444",
          "light-blue": "#f0f4f9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      lineHeight: {
        tight: "1.2",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
