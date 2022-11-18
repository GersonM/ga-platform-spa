module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recomended', 'plugin:react/jsx-runtime', 'standard'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react/display-name': 'off',
    'no-console': 'warn',
    'no-nested-ternary': 'off',
    'no-unused-vars': 'warn',
    'react/no-unknown-property': ['warn', {}],
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'no-inline-comments': 'warn',
  },
  globals: {
    React: 'writable',
  },
};
