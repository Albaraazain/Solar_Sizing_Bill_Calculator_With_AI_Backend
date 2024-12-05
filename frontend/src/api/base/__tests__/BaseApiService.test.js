// src/api/base/__tests__/BaseApiService.test.js
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

// Mock the ErrorHandler and AppError
jest.mock('../../../core/utils/ErrorHandler.js', () => ({
    ErrorHandler: {
        handle: jest.fn()
    },
    AppError: class AppError extends Error {
        constructor(message, code, data = {}) {
            super(message);
            this.code = code;
            this.data = data;
        }
    }
}));

// Mock the eventBus
jest.mock('../../../core/events/EventBus.js', () => ({
    eventBus: {
        publish: jest.fn()
    }
}));

// Mock axiosClient with all its methods
jest.mock('../../client/axiosClient.js', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}));

import axiosClient from '../../client/axiosClient.js';
import { BaseApiService } from '../BaseApiService.js';
import { ErrorHandler, AppError } from '../../../core/utils/ErrorHandler.js';
import { eventBus } from '../../../core/events/EventBus.js';

describe('BaseApiService', () => {
    let service;
    const baseURL = '/api';
    const endpoint = '/test';
    const mockData = { test: 'data' };
    const mockResponse = { success: true };
    const mockConfig = {};

    beforeEach(() => {
        jest.clearAllMocks();
        service = new BaseApiService(baseURL);
    });

    describe('HTTP Methods', () => {
        test('GET request is handled correctly', async () => {
            axiosClient.get.mockResolvedValueOnce(mockResponse);

            const result = await service.get(endpoint, mockConfig);

            expect(axiosClient.get).toHaveBeenCalledWith(`${baseURL}${endpoint}`, mockConfig);
            expect(result).toBe(mockResponse);
        });

        test('POST request is handled correctly', async () => {
            axiosClient.post.mockResolvedValueOnce(mockResponse);

            const result = await service.post(endpoint, mockData, mockConfig);

            expect(axiosClient.post).toHaveBeenCalledWith(`${baseURL}${endpoint}`, mockData, mockConfig);
            expect(result).toBe(mockResponse);
        });

        test('PUT request is handled correctly', async () => {
            axiosClient.put.mockResolvedValueOnce(mockResponse);

            const result = await service.put(endpoint, mockData, mockConfig);

            expect(axiosClient.put).toHaveBeenCalledWith(`${baseURL}${endpoint}`, mockData, mockConfig);
            expect(result).toBe(mockResponse);
        });

        test('DELETE request is handled correctly', async () => {
            axiosClient.delete.mockResolvedValueOnce(mockResponse);

            const result = await service.delete(endpoint, mockConfig);

            expect(axiosClient.delete).toHaveBeenCalledWith(`${baseURL}${endpoint}`, mockConfig);
            expect(result).toBe(mockResponse);
        });
    });

    describe('Error Handling', () => {
        const testErrorCases = [
            {
                status: 400,
                message: 'Bad Request',
                expectedCode: 'BAD_REQUEST'
            },
            {
                status: 401,
                message: 'Unauthorized access',
                expectedCode: 'UNAUTHORIZED'
            },
            {
                status: 404,
                message: 'Resource not found',
                expectedCode: 'NOT_FOUND'
            },
            {
                status: 500,
                message: 'Server error',
                expectedCode: 'SERVER_ERROR'
            }
        ];

        testErrorCases.forEach(({ status, message, expectedCode }) => {
            test(`handles ${status} error correctly`, async () => {
                const errorResponse = {
                    response: {
                        status,
                        data: { message }
                    }
                };
                axiosClient.get.mockRejectedValueOnce(errorResponse);

                try {
                    await service.get(endpoint);
                    fail('Should have thrown an error');
                } catch (error) {
                    expect(error.code).toBe(expectedCode);
                    expect(error.message).toBe(message);
                }
            });
        });

        test('handles network error correctly', async () => {
            const networkError = new Error('Network Error');
            axiosClient.get.mockRejectedValueOnce(networkError);

            try {
                await service.get(endpoint);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.code).toBe('NETWORK_ERROR');
                expect(error.message).toBe('Network error');
            }
        });

        test('handles unknown error correctly', async () => {
            const unknownError = new Error('Unknown error');
            axiosClient.get.mockRejectedValueOnce(unknownError);

            try {
                await service.get(endpoint);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.code).toBe('NETWORK_ERROR');
                expect(error.message).toBe('Network error');
                expect(error.data.originalError).toBe(unknownError);
            }
        });
    });
});
