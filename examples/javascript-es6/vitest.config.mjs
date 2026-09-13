import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["test/**/*.test.js"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.js"],
            // app.js is the webpack entry point: it imports CSS bundles and relies on
            // webpack's `module.hot`, so it cannot be imported outside a webpack build.
            exclude: ["src/app.js"],
            thresholds: {
                statements: 80,
                lines: 80,
                functions: 80,
                branches: 80,
            },
        },
    },
});
