// src/api/middleware/__tests__/errorHandler.test.js
import { jest, expect, describe, test } from '@jest/globals';
import { ApiErrorHandler } from '../errorHandler.js';
import { AppError } from '../../../core/utils/ErrorHandler.js';
import { HTTP_STATUS } from '../../client/apiConfig.js';

describe('ApiErrorHandler', () => {
    test('returns AppError instance unchanged', () => {
        const originalError = new AppError('Test error', 'TEST_ERROR');
        const result = ApiErrorHandler.handle(originalError);
        expect(result).toBe(originalError);
    });

    test('handles API response errors with custom messages', () => {
        const responseError = {
            response: {
                status: HTTP_STATUS.BAD_REQUEST,
                data: {
                    message: 'Custom validation error'
                }
            }
        };

        const result = ApiErrorHandler.handle(responseError);

        expect(result).toBeInstanceOf(AppError);
        expect(result.message).toBe('Custom validation error');
        expect(result.code).toBe('VALIDATION_ERROR');
    });

    test('handles API response errors with default messages', () => {
        const responseError = {
            response: {
                status: HTTP_STATUS.NOT_FOUND,
                data: {}
            }
        };

        const result = ApiErrorHandler.handle(responseError);

        expect(result).toBeInstanceOf(AppError);
        expect(result.message).toBe('Resource not found');
        expect(result.code).toBe('NOT_FOUND');
    });

    test('handles network errors', () => {
        const networkError = {
            request: {},
            message: 'Network Error'
        };

        const result = ApiErrorHandler.handle(networkError);

        expect(result).toBeInstanceOf(AppError);
        expect(result.code).toBe('NETWORK_ERROR');
    });

    test('handles unknown errors', () => {
        const unknownError = new Error('Unknown error');

        const result = ApiErrorHandler.handle(unknownError);

        expect(result).toBeInstanceOf(AppError);
        expect(result.code).toBe('UNKNOWN_ERROR');
    });

    test('preserves original error data', () => {
        const originalData = { field: 'value' };
        const responseError = {
            response: {
                status: HTTP_STATUS.BAD_REQUEST,
                data: originalData
            }
        };

        const result = ApiErrorHandler.handle(responseError);

        expect(result.data).toBe(originalData);
    });
});
