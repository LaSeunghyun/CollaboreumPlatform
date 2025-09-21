module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', '@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // console.log 사용 금지 (console.error는 허용)
    'no-console': ['error', { allow: ['error'] }],

    // 사용하지 않는 변수 경고
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // any 타입 사용 경고
    '@typescript-eslint/no-explicit-any': 'warn',

    // 빈 함수 허용
    '@typescript-eslint/no-empty-function': 'off',

    // require 사용 허용 (CommonJS)
    '@typescript-eslint/no-var-requires': 'off',
  },
  ignorePatterns: ['node_modules/', 'build/', 'dist/', '*.min.js', 'coverage/'],
};
