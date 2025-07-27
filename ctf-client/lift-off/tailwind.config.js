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
        blinkBorder: {
          '0%, 100%': { borderColor: 'white' },
          '50%': { borderColor: 'transparent' },
        },
        blinkText: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        moveHorizontal: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadein: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeBgOpacity: {
          '0%': { backgroundColor: 'rgba(0, 0, 0, 1)' },
          '100%': { backgroundColor: 'rgba(0, 0, 0, 0)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        blinkBorder: 'blinkBorder 0.8s step-end infinite',
        blinkText: 'blinkText 0.7s step-start infinite',
        speedLine1: 'moveHorizontal 1s linear infinite',
        speedLine2: 'moveHorizontal 1.2s linear infinite',
        fadeBgOpacity: 'fadeBgOpacity 2s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
