/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: "#a1391e",
          dark: "#7c2811",
          light: "#bd4a2c",
          soft: "#faeae5",
          pale: "#fdf5f2"
        },
        parchment: {
          50: "#fdfbf7",
          100: "#f9f5ed",
          200: "#f2ece0",
          300: "#e6dcce",
          400: "#d3c4b1"
        },
        ink: "#1d1916",
        sage: {
          DEFAULT: "#446556",
          subtle: "#eef5f1",
          dark: "#2d453a"
        },
        ochre: "#8d6332",
        warm: {
          bg: '#f9f7f2',
          surface: '#ffffff',
          border: '#ece7de',
          borderHover: '#ded6ca',
          ink: '#221e1a',
          inkMuted: '#786f65',
          terracotta: '#a1391e',
          terracottaLight: '#faeae5',
          terracottaDark: '#7c2811',
          sage: '#446556',
          sageLight: '#eef5f1',
          amber: '#d97706',
          amberLight: '#fef9ee',
          rose: '#e11d48',
          roseLight: '#fff1f2'
        }
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        manrope: ['"Manrope"', 'Helvetica', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        instrument: ['"Instrument Serif"', 'Georgia', 'serif'],
        editorial: ['"Newsreader"', 'serif'],
        hand: ['"Caveat"', 'cursive'],
        mono: ['"Manrope"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'folio': '0 20px 45px -15px rgba(45, 30, 20, 0.12), 0 4px 12px -2px rgba(45, 30, 20, 0.05)',
        'emboss': 'inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.06)',
        'stamp': '0 2px 8px -1px rgba(161,57,30,0.2)',
        'clean': '0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 4px 16px -4px rgba(0, 0, 0, 0.04)',
        'clean-lg': '0 8px 30px -6px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
