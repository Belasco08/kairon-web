/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A', // Ajuste para a cor do seu app mobile
        secondary: '#64748B',
      }
    },
  },
  plugins: [],
}