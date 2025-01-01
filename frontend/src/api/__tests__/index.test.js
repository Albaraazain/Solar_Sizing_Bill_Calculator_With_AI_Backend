// src/api/__tests__/index.test.js
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

// Mock the environment first
jest.mock('../../config/environment.js', () => ({
    ENV: {
        USE_MOCK_API: false
    }
}));

// Mock all dependencies before imports
jest.mock('../middleware/authMiddleware.js', () => ({
    AuthMiddleware: {
        isAuthenticated: jest.fn(),
        refreshTokenIfNeeded: jest.fn()
    }
}));

jest.mock('../middleware/errorHandler.js', () => ({
    ApiErrorHandler: {
        handle: jest.fn()
    }
}));

jest.mock('../services/billApi.js', () => ({
    billApi: {
        analyzeBill: jest.fn(),
        getBillDetails: jest.fn(),
        validateReferenceNumber: jest.fn()
    },
    BillApi: jest.fn()
}));

jest.mock('../services/quoteApi.js', () => ({
    quoteApi: {
        generateQuote: jest.fn(),
        getQuoteById: jest.fn(),
        saveQuote: jest.fn()
    },
    QuoteApi: jest.fn()
}));

import { Api } from '../index.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';
import { ApiErrorHandler } from '../middleware/errorHandler.js';
import { AppError } from '../../core/utils/ErrorHandler.js';

describe('API', () => {
    const mockToasts = {
        show: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(global, 'window', {
            value: { toasts: mockToasts },
            writable: true
        });
    });

    describe('initialization', () => {
        test('successfully initializes API layer', async () => {
            AuthMiddleware.isAuthenticated.mockReturnValue(false);

            const result = await Api.initialize();

            expect(result).toBe(true);
            expect(AuthMiddleware.refreshTokenIfNeeded).not.toHaveBeenCalled();
        });

        test('handles API initialization failure', async () => {
            AuthMiddleware.isAuthenticated.mockReturnValue(true);
            AuthMiddleware.refreshTokenIfNeeded.mockRejectedValue(new Error('Refresh failed'));

            const result = await Api.initialize();

            expect(result).toBe(false);
        });
    });

    describe('request handling', () => {
        test('successfully handles valid requests', async () => {
            const mockResponse = { data: 'test' };
            const mockRequest = jest.fn().mockResolvedValue(mockResponse);

            const result = await Api.handleRequest(mockRequest);
            expect(result).toBe(mockResponse);
        });

        test('handles errors through error handler', async () => {
            const originalError = new Error('Test error');
            const handledError = new AppError('Handled error', 'TEST_ERROR');

            ApiErrorHandler.handle.mockReturnValue(handledError);
            const mockRequest = jest.fn().mockRejectedValue(originalError);

            try {
                await Api.handleRequest(mockRequest);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBe(handledError);
                expect(ApiErrorHandler.handle).toHaveBeenCalledWith(originalError);
            }
        });
    });
});
