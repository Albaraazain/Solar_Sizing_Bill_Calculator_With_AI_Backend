import {beforeEach, jest} from '@jest/globals';

// Global test setup
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

// Mock ENV
global.ENV = {
    DEBUG: true,
    API_URL: 'http://localhost:3000',
    VERSION: 'test'
};

// Add custom matchers if needed
expect.extend({
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true
            };
        } else {
            return {
                message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
                pass: false
            };
        }
    }
});

// Export utilities
export const createMockEventBus = () => ({
    subscribe: jest.fn(),
    publish: jest.fn(),
    clear: jest.fn()
});
