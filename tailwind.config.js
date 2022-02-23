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
    { pattern: /^ember-tooltip.*/ },
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
      height: {
        '128': '32rem',
      },
      minHeight: (theme) => ({
        ...theme('spacing'),
        '128': '32rem',
      }),
      maxHeight: (theme) => ({
        ...theme('spacing'),
        '128': '32rem',
      }),
      screens: {
        'print': {'raw': 'print'} // => @media print { ... }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-bullets': theme('colors.gray[500]'),
          }
        }
      })
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ]
};
