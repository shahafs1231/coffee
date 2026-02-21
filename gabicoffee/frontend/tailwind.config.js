/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50:  '#fdf8f3',
          100: '#faefd8',
          200: '#f3d9a8',
          300: '#e8bc70',
          400: '#dc9b3d',
          500: '#c47d22',
          600: '#a6621a',
          700: '#884d18',
          800: '#6f3d18',
          900: '#5c3317',
          950: '#321908',
        },
        cream: '#fdf8f3',
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'Heebo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
