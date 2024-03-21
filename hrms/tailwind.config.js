/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    "./node_modules/tw-elements-react/dist/js/**/*.js"
  ],
  theme: {
    extend: {
      colors:{
        "site" :"#376BFF",
        "light-white" : "rgba(255,255,255,0.17)"
      }
    },
  },
  plugins: [
    require('flowbite/plugin'),
    require("tw-elements-react/dist/plugin.cjs")
  ]
}