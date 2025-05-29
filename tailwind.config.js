/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B7D4A',
          50: '#EBF5EE',
          100: '#D7EBDC',
          200: '#B0D7B9',
          300: '#88C396',
          400: '#61AF73',
          500: '#3B7D4A',
          600: '#2F6A3D',
          700: '#235730',
          800: '#174423',
          900: '#0C3116',
        },
        secondary: {
          DEFAULT: '#4A3B7D',
          50: '#EEEDF5',
          100: '#DCDAEB',
          200: '#B9B5D7',
          300: '#9690C3',
          400: '#736BAF',
          500: '#4A3B7D',
          600: '#3D2F6A',
          700: '#302357',
          800: '#231744',
          900: '#160C31',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
