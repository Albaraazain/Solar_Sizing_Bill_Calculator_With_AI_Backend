// src/api/middleware/__tests__/authMiddleware.test.js
import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { AuthMiddleware } from '../authMiddleware.js';
import { eventBus } from '../../../core/events/EventBus.js';

jest.mock('../../../core/events/EventBus.js');

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock fetch for testing refresh token
global.fetch = jest.fn();

describe('AuthMiddleware', () => {
    const mockToken = 'test-token';
    const mockRefreshToken = 'refresh-token';

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('Token Management', () => {
        test('sets and gets token correctly', () => {
            AuthMiddleware.setToken(mockToken);

            expect(localStorage.setItem).toHaveBeenCalledWith(AuthMiddleware.TOKEN_KEY, mockToken);
            expect(AuthMiddleware.getToken()).toBe(mockToken);
        });

        test('sets both token and refresh token', () => {
            AuthMiddleware.setToken(mockToken, mockRefreshToken);

            expect(localStorage.setItem).toHaveBeenCalledWith(AuthMiddleware.TOKEN_KEY, mockToken);
            expect(localStorage.setItem).toHaveBeenCalledWith(AuthMiddleware.REFRESH_TOKEN_KEY, mockRefreshToken);
        });

        test('clears tokens correctly', () => {
            AuthMiddleware.setToken(mockToken, mockRefreshToken);
            AuthMiddleware.clearTokens();

            expect(localStorage.removeItem).toHaveBeenCalledWith(AuthMiddleware.TOKEN_KEY);
            expect(localStorage.removeItem).toHaveBeenCalledWith(AuthMiddleware.REFRESH_TOKEN_KEY);
        });
    });

    describe('Authentication Status', () => {
        test('isAuthenticated returns true when token exists', () => {
            AuthMiddleware.setToken(mockToken);
            expect(AuthMiddleware.isAuthenticated()).toBe(true);
        });

        test('isAuthenticated returns false when no token exists', () => {
            expect(AuthMiddleware.isAuthenticated()).toBe(false);
        });
    });

    describe('Auth Headers', () => {
        test('getAuthHeader returns correct bearer token', () => {
            AuthMiddleware.setToken(mockToken);
            expect(AuthMiddleware.getAuthHeader()).toBe(`Bearer ${mockToken}`);
        });

        test('getAuthHeader returns null when no token exists', () => {
            expect(AuthMiddleware.getAuthHeader()).toBe(null);
        });
    });

    describe('Error Handling', () => {
        test('handleAuthError clears tokens and publishes event on 401', async () => {
            const error = {
                response: { status: 401 }
            };

            try {
                AuthMiddleware.handleAuthError(error);
            } catch (e) {
                expect(localStorage.removeItem).toHaveBeenCalled();
                expect(eventBus.publish).toHaveBeenCalledWith('auth:unauthorized');
                expect(e.code).toBe('AUTH_REQUIRED');
            }
        });
    });

    describe('Token Refresh', () => {
        test('refreshTokenIfNeeded succeeds with valid refresh token', async () => {
            const newToken = 'new-token';
            const newRefreshToken = 'new-refresh-token';

            AuthMiddleware.setToken(mockToken, mockRefreshToken);

            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ token: newToken, newRefreshToken })
                })
            );

            const result = await AuthMiddleware.refreshTokenIfNeeded();

            expect(result).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith(AuthMiddleware.TOKEN_KEY, newToken);
        });

        test('refreshTokenIfNeeded handles failure gracefully', async () => {
            AuthMiddleware.setToken(mockToken, mockRefreshToken);

            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false
                })
            );

            const result = await AuthMiddleware.refreshTokenIfNeeded();

            expect(result).toBe(false);
            expect(eventBus.publish).toHaveBeenCalledWith('auth:session-expired');
        });
    });
});
