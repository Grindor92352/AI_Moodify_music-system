/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'services/**/*.js',
    'middleware/**/*.js',
    'controllers/**/*.js',
    'routes/**/*.js',
    'createApp.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/']
};
