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
    '!src/app/**/layout.tsx',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/lib/**',
    '!src/components/ui/**',
    '!src/hooks/**',
  ],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 75,
      lines: 85,
      statements: 80,
    },
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
