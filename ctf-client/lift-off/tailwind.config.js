/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bitcount: ['"Bitcount Prop Single"', 'sans-serif'], // added custom font
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0' },
        },
        moveHorizontal: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        blink: 'blink 2s step-start infinite',
        speedLine1: 'moveHorizontal 1s linear infinite',
        speedLine2: 'moveHorizontal 1.2s linear infinite',
      },
    },
  },
  plugins: [],
};
