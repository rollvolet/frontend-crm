/* eslint-disable */
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  content: [
    './app/**/*.{hbs,js,ts,html}',
    './public/assets/icons/*.svg',
    './tests/**/*.{hbs,js,ts,html}'
  ],
  safelist: [
    'ember-tooltip',
    { pattern: /^ember-power-select.*/ }
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        display: ['Dosis', 'Inter var', ...defaultTheme.fontFamily.sans]
      },
      color: {
        green: colors.emerald,
        yellow: colors.amber
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
