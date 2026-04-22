/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "oklch(0.922 0 0)",
        emerald: {
          500: "#00ff88",
          600: "#00e67a",
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 5px #00ff88)' },
          '50%': { opacity: 0.8, filter: 'drop-shadow(0 0 15px #00ff88)' },
        }
      }
    },
  },
  plugins: [],
}
