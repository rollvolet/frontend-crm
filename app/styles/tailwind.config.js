/* eslint-disable */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        display: ['Nunito', 'Inter var', ...defaultTheme.fontFamily.sans]
      },
      screens: {
        'print': {'raw': 'print'} // => @media print { ... }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ]
};
