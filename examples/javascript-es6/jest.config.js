module.exports = {
    testEnvironment: "jsdom",
    testMatch: ["**/src/__tests__/**/*.test.js"],
    collectCoverageFrom: ["src/**/*.js", "!src/__tests__/**"],
    coveragePathIgnorePatterns: ["/src/app\\.js$"],
    coverageThreshold: {
        global: {
            statements: 80,
            lines: 80,
            functions: 80,
            branches: 80,
        },
    },
};
