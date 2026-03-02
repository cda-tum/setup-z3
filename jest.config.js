export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx|mjs)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ES2022",
          target: "ES2022"
        }
      }
    ]
  },
  transformIgnorePatterns: [],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json"]
}
