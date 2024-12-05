// src/core/utils/__tests__/ErrorHandler.test.js
import { jest, expect, test, describe, beforeEach, afterEach } from '@jest/globals';
import { eventBus } from '../../events/EventBus.js';

// Setup mock ENV first, before any other imports
const mockENV = { DEBUG: true };
jest.unstable_mockModule('../../../config/environment.js', () => ({
    ENV: mockENV
}));

// Now import modules that depend on the mock
const { AppError, ErrorHandler } = await import('../ErrorHandler.js');

describe('ErrorHandler', () => {
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    beforeEach(() => {
        eventBus.clear();
        jest.clearAllMocks();
        // Reset mock state
        mockENV.DEBUG = true;
        mockConsoleError.mockClear();
    });

    afterEach(() => {
        mockConsoleError.mockReset();
    });

    test('handles AppError with event emission', async () => {
        const testError = new AppError('Test error', 'TEST_ERROR');
        let resolved = false;

        await new Promise(resolve => {
            eventBus.subscribe('error', errorData => {
                try {
                    expect(errorData).toEqual({
                        message: 'Test error',
                        code: 'TEST_ERROR',
                        data: {}
                    });
                    resolved = true;
                    resolve();
                } catch (error) {
                    resolve(error);
                }
            });

            ErrorHandler.handle(testError);
        });

        expect(resolved).toBe(true);
        expect(mockConsoleError).toHaveBeenCalledWith('App Error:', testError);
    });

    test('handles unknown errors with generic message', async () => {
        const randomError = new Error('Random error');
        let resolved = false;

        await new Promise(resolve => {
            eventBus.subscribe('error', errorData => {
                try {
                    expect(errorData).toEqual({
                        message: 'An unexpected error occurred',
                        code: 'UNKNOWN_ERROR',
                        originalError: randomError
                    });
                    resolved = true;
                    resolve();
                } catch (error) {
                    resolve(error);
                }
            });

            ErrorHandler.handle(randomError);
        });

        expect(resolved).toBe(true);
        expect(mockConsoleError).toHaveBeenCalledWith('Unknown Error:', randomError);
    });

    test('respects DEBUG flag for error logging', async () => {
        // Important: Set DEBUG to false before the test
        mockENV.DEBUG = false;

        // Clear any previous calls
        mockConsoleError.mockClear();

        const testError = new AppError('Test error', 'TEST_ERROR');

        // Set up event handler to ensure error is processed
        await new Promise(resolve => {
            eventBus.subscribe('error', () => {
                resolve();
            });

            ErrorHandler.handle(testError);
        });

        expect(mockConsoleError).not.toHaveBeenCalled();
    });
});
