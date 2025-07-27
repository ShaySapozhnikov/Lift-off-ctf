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
          '50%': { borderColor: 'transparent' },
          '100%': { borderColor: 'white' },
        },
        moveHorizontal: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        typing: {
          from: { width: '0ch' },
          to: { width: '30ch' }, // adjust max width as needed
        },
        fadein: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        blink: 'blink 0.8s step-end infinite',
        speedLine1: 'moveHorizontal 1s linear infinite',
        speedLine2: 'moveHorizontal 1.2s linear infinite',
        typing: 'typing 2s steps(30, end) forwards',
        'fadein-1': 'fadein 0.5s ease forwards 2.2s',
        'fadein-2': 'fadein 0.5s ease forwards 3s',
        'fadein-3': 'fadein 0.5s ease forwards 3.8s',
        'fadein-4': 'fadein 0.5s ease forwards 4.4s',
        'fadein-5': 'fadein 0.5s ease forwards 5s',
        'fadein-6': 'fadein 0.5s ease forwards 5.6s',
        'fadein-7': 'fadein 0.5s ease forwards 6.2s',
        'fadein-8': 'fadein 0.5s ease forwards 6.8s',
        'fadein-9': 'fadein 0.5s ease forwards 7.4s',
        'fadein-10': 'fadein 0.5s ease forwards 8s',
      },
    },
  },
  plugins: [],
};
