/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // Handle ESM modules
  transformIgnorePatterns: [],
  moduleFileExtensions: ['js', 'json', 'node'],
};

module.exports = config;
