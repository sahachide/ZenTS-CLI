// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    <% extendRules.forEach(function(rule){ %>'<%= rule %>',<% }); %>
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // customize your rules
  }
}
