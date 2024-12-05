// jest.config.mjs
export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.m?js$': ['babel-jest', {
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
        }]
    },
    moduleFileExtensions: ['js', 'mjs'],
    testMatch: ['**/__tests__/**/*.test.js'],
    transformIgnorePatterns: ['/node_modules/'],
    setupFilesAfterEnv: ['./src/test/setup.js'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@/(.*)$': '<rootDir>/src/$1' // Example alias mapping for root imports (adjust as needed)
    }
    // Removed extensionsToTreatAsEsm since it's inferred from package.json
}
