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
    },
  },
  plugins: [],
};

export default config;
