const { FlatCompat } = require('@eslint/eslintrc');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const prettierConfig = require('eslint-config-prettier');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Archivos ignorados
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
      'eslint.config.js',
    ],
  },

  // Configuración base para TypeScript + React
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // React
      'react/react-in-jsx-scope': 'off', // No necesario con React 17+
      'react/prop-types': 'off',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Prettier al final (desactiva reglas de formato que conflictúan)
  prettierConfig,
];
