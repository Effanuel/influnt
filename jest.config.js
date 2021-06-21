module.exports = {
  verbose: true,
  clearMocks: true,
  roots: ['<rootDir>/src'],
  transform: {'^.+\\.tsx?$': 'ts-jest'},
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/?(*.)(spec|test|it).(ts|tsx|js|jsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'json', 'node'],
};
