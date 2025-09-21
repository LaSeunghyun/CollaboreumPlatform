module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // 일반 규칙
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
