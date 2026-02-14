/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        romantic: ['Dancing Script', 'cursive'],
        sans: ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
