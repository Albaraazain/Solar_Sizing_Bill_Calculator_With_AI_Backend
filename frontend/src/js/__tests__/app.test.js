// src/js/__tests__/app.test.js
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('../../api/index.js');

// Mock event bus with factory function
jest.mock('../../core/events/EventBus.js', () => {
    // Create subscribers map inside the factory
    const subscribers = new Map();

    return {
        eventBus: {
            subscribe: jest.fn((event, callback) => {
                if (!subscribers.has(event)) {
                    subscribers.set(event, []);
                }
                subscribers.get(event).push(callback);
            }),
            publish: jest.fn((event, data) => {
                if (subscribers.has(event)) {
                    subscribers.get(event).forEach(callback => callback(data));
                }
            }),
            clear: jest.fn(() => {
                subscribers.clear();
            })
        }
    };
});

// Now import the modules that use the mocks
import { App } from '../app.js';
import { Api } from '../../api/index.js';
import { eventBus } from '../../core/events/EventBus.js';

// Create mock toasts
const mockToasts = {
    show: jest.fn()
};

// Setup global window object
Object.defineProperty(global, 'window', {
    value: {
        toasts: mockToasts
    },
    writable: true
});

describe('App API Integration', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        eventBus.clear();
        mockToasts.show.mockClear();
        app = new App();
    });

    describe('API Initialization', () => {
        test('successfully initializes API layer', async () => {
            Api.initialize.mockResolvedValue(true);
            const result = await app.initialize();
            expect(result).toBe(true);
            expect(Api.initialize).toHaveBeenCalled();
        });

        test('handles API initialization failure', async () => {
            Api.initialize.mockResolvedValue(false);
            const result = await app.initialize();

            expect(result).toBe(false);
            expect(mockToasts.show).toHaveBeenCalledWith(
                'Failed to initialize application. Please refresh.',
                'error'
            );
        });
    });

    describe('API Event Handling', () => {
        test('handles authentication errors', () => {
            eventBus.publish('auth:unauthorized');
            expect(mockToasts.show).toHaveBeenCalledWith(
                'Please log in to continue',
                'error'
            );
        });

        test('handles session expiration', () => {
            eventBus.publish('auth:session-expired');
            expect(mockToasts.show).toHaveBeenCalledWith(
                'Your session has expired. Please log in again.',
                'warning'
            );
        });
    });

    describe('Error Handling', () => {
        test('handles network errors', () => {
            eventBus.publish('error', { code: 'NETWORK_ERROR' });
            expect(mockToasts.show).toHaveBeenCalledWith(
                'Network error. Please check your connection.',
                'error'
            );
        });

        test('handles server errors', () => {
            eventBus.publish('error', { code: 'SERVER_ERROR' });
            expect(mockToasts.show).toHaveBeenCalledWith(
                'Server error. Please try again later.',
                'error'
            );
        });

        test('handles generic errors', () => {
            const genericError = {
                code: 'UNKNOWN',
                message: 'Something went wrong'
            };
            eventBus.publish('error', genericError);
            expect(mockToasts.show).toHaveBeenCalledWith(
                'Something went wrong',
                'error'
            );
        });
    });
});
