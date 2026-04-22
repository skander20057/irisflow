/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          accent: '#0696D6', // Elite Medical Blue
          text: '#1D1D1F',
          muted: '#86868B',
        }
      },
      borderRadius: {
        'bento': '24px',
      },
      boxShadow: {
        'bento': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'bento-hover': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [],
}
