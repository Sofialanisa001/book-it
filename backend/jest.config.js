module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
    testMatch: ["<rootDir>/tests/**/*.test.js"],
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js",
        "!src/seeder/**",
        "!src/config/**",
    ],
    clearMocks: true,
    verbose: true,
};
