/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00ff90',
        'background-light': '#000000',
        'background-dark': '#000000',
        'zinc-gray': '#71717a',
        'neon-green': '#00ff90',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
      },
    },
  },
  plugins: [],
};
