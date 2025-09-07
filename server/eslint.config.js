const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // console.log 사용 금지 (console.error는 허용)
      'no-console': ['error', { allow: ['error'] }],
      
      // 사용하지 않는 변수 경고
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    },
  },
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      '*.min.js',
      'coverage/',
      'src/**/*.ts',
      'scripts/**/*.js',
      'tests/**/*.js',
      'check-user.js',
      'test-password.js',
      'start.js',
    ],
  },
];
