module.exports = {
    testEnvironment: "jsdom",
    testMatch: ["<rootDir>/__tests__/**/*.test.js"],
    collectCoverageFrom: ["src/**/*.js"],
    coveragePathIgnorePatterns: ["<rootDir>/src/app.js"],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
    },
};
