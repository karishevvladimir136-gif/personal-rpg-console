import js from '@eslint/js';
export default [
  { ignores: ['dist/**', 'node_modules/**', 'results/**', 'fixtures/**'] },
  js.configs.recommended,
  { languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: {
    console: 'readonly', process: 'readonly', Buffer: 'readonly', URL: 'readonly',
    Response: 'readonly', Request: 'readonly', Headers: 'readonly', AbortSignal: 'readonly',
    setTimeout: 'readonly', clearTimeout: 'readonly', fetch: 'readonly', performance: 'readonly', structuredClone: 'readonly'
  } }, rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } }
];
