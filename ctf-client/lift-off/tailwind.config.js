/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bitcount: ['"Bitcount Prop Single"', 'sans-serif'],
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

       
        glitch: {
          "0%, 100%": { clipPath: "inset(0 0 0 0)", transform: "translate(0)" },
          "20%": { clipPath: "inset(15% 0 80% 0)", transform: "translate(-4px, -4px)" },
          "40%": { clipPath: "inset(80% 0 15% 0)", transform: "translate(4px, 4px)" },
          "60%": { clipPath: "inset(15% 0 80% 0)", transform: "translate(-4px, 4px)" },
          "80%": { clipPath: "inset(80% 0 15% 0)", transform: "translate(4px, -4px)" },
        },

       
        glitch1: {
          '0%,100%': { transform: 'none', opacity: '1' },
          '7%': { transform: 'skew(-0.5deg, -0.9deg)', opacity: '0.75' },
          '10%': { transform: 'none', opacity: '1' },
          '27%': { transform: 'none', opacity: '1' },
          '30%': { transform: 'skew(0.8deg, -0.1deg)', opacity: '0.75' },
          '35%': { transform: 'none', opacity: '1' },
          '52%': { transform: 'none', opacity: '1' },
          '55%': { transform: 'skew(-1deg, 0.2deg)', opacity: '0.75' },
          '72%': { transform: 'none', opacity: '1' },
          '75%': { transform: 'skew(0.4deg, 1deg)', opacity: '0.75' },
          '80%': { transform: 'none', opacity: '1' },
        },
        glitch2: {
          '0%,100%': { transform: 'none', opacity: '0.25' },
          '7%': { transform: 'translate(-2px, -3px)', opacity: '0.5' },
          '10%': { transform: 'none', opacity: '0.25' },
          '27%': { transform: 'none', opacity: '0.25' },
          '30%': { transform: 'translate(-5px, -2px)', opacity: '0.5' },
          '35%': { transform: 'none', opacity: '0.25' },
          '52%': { transform: 'none', opacity: '0.25' },
          '55%': { transform: 'translate(-5px, -1px)', opacity: '0.5' },
          '72%': { transform: 'none', opacity: '0.25' },
          '75%': { transform: 'translate(-2px, -6px)', opacity: '0.5' },
          '80%': { transform: 'none', opacity: '0.25' },
        },
        glitch3: {
          '0%,100%': { transform: 'none', opacity: '0.25' },
          '7%': { transform: 'translate(2px, 3px)', opacity: '0.5' },
          '10%': { transform: 'none', opacity: '0.25' },
          '27%': { transform: 'none', opacity: '0.25' },
          '30%': { transform: 'translate(5px, 2px)', opacity: '0.5' },
          '35%': { transform: 'none', opacity: '0.25' },
          '52%': { transform: 'none', opacity: '0.25' },
          '55%': { transform: 'translate(5px, 1px)', opacity: '0.5' },
          '72%': { transform: 'none', opacity: '0.25' },
          '75%': { transform: 'translate(2px, 6px)', opacity: '0.5' },
          '80%': { transform: 'none', opacity: '0.25' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        blinkBorder: 'blinkBorder 0.8s step-end infinite',
        blinkText: 'blinkText 0.7s step-start infinite',
        speedLine1: 'moveHorizontal 1s linear infinite',
        speedLine2: 'moveHorizontal 1.2s linear infinite',
        fadeBgOpacity: 'fadeBgOpacity 2s ease-in-out forwards',
        glitch: "glitch 2s infinite linear",

       
        glitch1: "glitch1 2.5s infinite",
        glitch2: "glitch2 2.5s infinite",
        glitch3: "glitch3 2.5s infinite",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};

