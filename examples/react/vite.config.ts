import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "./",
    server: {
        port: 7003,
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./test/setup.ts"],
        include: ["test/**/*.test.{ts,tsx}"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/main.tsx"],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80,
            },
        },
    },
});
