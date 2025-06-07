/** @type {import('prettier').Config} */
const config = {
  bracketSpacing: true,
  printWidth: 125,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
  endOfLine: 'auto',
};

module.exports = config;
