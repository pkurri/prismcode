const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/app/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    '!src/app/**/layout.tsx',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 54,
      functions: 60,
      lines: 69,
      statements: 68,
    },
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
