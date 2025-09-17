module.exports = {
  testEnvironment: 'node',
  reporters: ['default', ['jest-junit', { outputDirectory: 'reports/junit' }]],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  testMatch: [
    '**/tests/**/*.(ts|js)',
    '**/*.(test|spec).(ts|js)',
    '**/pact/**/*.test.(ts|js)'
  ],
  collectCoverageFrom: [
    '**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  testTimeout: 10000
};
