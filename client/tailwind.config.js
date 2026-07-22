/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          50: "#EAFFF3",
          100: "#C9FFE1",
          300: "#6BF6AE",
          400: "#21F27A",
          500: "#0FD968",
          600: "#0BB554",
          700: "#0A8F44",
          glow: "#21F27A",
        },
        surface: {
          light: "#FFFFFF",
          "light-2": "#F4F8F6",
          "light-3": "#E9EFEC",
          dark: "#0A0F0C",
          "dark-2": "#111813",
          "dark-3": "#1B2620",
        },
        ink: {
          light: "#0B1210",
          dark: "#EAF7EF",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(33,242,122,0.4), 0 0 24px rgba(33,242,122,0.35)",
        "neon-lg": "0 0 0 1px rgba(33,242,122,0.5), 0 0 60px rgba(33,242,122,0.45)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(33,242,122,0.4), 0 0 16px rgba(33,242,122,0.3)" },
          "50%": { boxShadow: "0 0 0 1px rgba(33,242,122,0.7), 0 0 40px rgba(33,242,122,0.6)" },
        },
        flipIn: {
          "0%": { transform: "rotateX(90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0deg)", opacity: "1" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        flipIn: "flipIn 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
