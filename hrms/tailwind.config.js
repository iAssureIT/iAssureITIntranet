/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {
      colors:{
        "site" :"#428BCA",
        "light-white" : "rgba(255,255,255,0.17)"
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}