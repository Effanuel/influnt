module.exports = {
  verbose: true,
  clearMocks: true,
  roots: ['<rootDir>/tests'],
  transform: {'^.+\\.tsx?$': 'ts-jest'},
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)(spec|test|it).(ts|tsx|js|jsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'json', 'node', 'js'],
};
