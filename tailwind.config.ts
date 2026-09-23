import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0D5C3A",
          "primary-hover": "#09472C",
          "primary-light": "#E8F5E9",
          "primary-border": "#A7F3D0",
          accent: "#F59E0B",
          "accent-hover": "#D97706",
          "accent-light": "#FEF3C7",
          surface: "#F8FAF9",
          card: "#FFFFFF",
          "card-muted": "#F1F5F3",
          text: "#0F291E",
          "text-secondary": "#4A5D54",
          "text-muted": "#7C9085",
        },
        athletic: {
          green: "#0D5C3A",
          mint: "#E8F5E9",
          gold: "#F59E0B",
          amber: "#D97706",
          emerald: "#10B981",
          forest: "#09472C",
          slate: "#0F291E",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "var(--font-plus-jakarta)", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(15, 41, 30, 0.06), 0 4px 12px rgba(15, 41, 30, 0.04)",
        elevated: "0 4px 6px -1px rgba(15, 41, 30, 0.07), 0 12px 24px -4px rgba(15, 41, 30, 0.08)",
        card: "0 2px 8px -2px rgba(13, 92, 58, 0.08), 0 1px 4px -1px rgba(15, 41, 30, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
