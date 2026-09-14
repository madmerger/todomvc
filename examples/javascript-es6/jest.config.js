module.exports = {
    testEnvironment: "jsdom",
    testMatch: ["<rootDir>/test/**/*.test.js"],
    moduleNameMapper: {
        "\\.css$": "identity-obj-proxy",
    },
    collectCoverageFrom: ["src/**/*.js"],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
    },
};
