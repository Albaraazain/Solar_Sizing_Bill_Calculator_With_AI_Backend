// src/api/services/__tests__/quoteApi.test.js
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

// Mock axiosClient
jest.mock('../../client/axiosClient.js', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}));


import { quoteApi } from '../quoteApi.js';
import axiosClient from '../../client/axiosClient.js';

describe('QuoteApi', () => {
    const mockQuoteId = '123456789';
    const mockBillData = {
        referenceNumber: 'BILL123',
        consumption: 500,
        monthlyAverage: 450,
        peakUsage: 600
    };
    const mockQuoteData = {
        systemSize: 5,
        cost: 10000,
        estimatedSavings: 2000,
        paybackPeriod: 5
    };
    const mockResponse = { success: true, data: {} };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Quote Generation', () => {
        test('generateQuote sends correct request', async () => {
            axiosClient.post.mockResolvedValueOnce(mockResponse);

            const result = await quoteApi.generateQuote(mockBillData);

            expect(axiosClient.post).toHaveBeenCalledWith(
                '/quote/generate',
                mockBillData,
                {}
            );
            expect(result).toBe(mockResponse);
        });

        test('generateQuote handles validation errors', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { message: 'Invalid bill data' }
                }
            };
            axiosClient.post.mockRejectedValueOnce(validationError);

            await expect(quoteApi.generateQuote(mockBillData))
                .rejects
                .toMatchObject({
                    code: 'BAD_REQUEST',
                    message: 'Invalid bill data'
                });
        });
    });

    describe('Quote Retrieval', () => {
        test('getQuoteById sends correct request', async () => {
            axiosClient.get.mockResolvedValueOnce(mockResponse);

            const result = await quoteApi.getQuoteById(mockQuoteId);

            expect(axiosClient.get).toHaveBeenCalledWith(
                `/quote/${mockQuoteId}`,
                {}
            );
            expect(result).toBe(mockResponse);
        });

        test('getQuoteById handles not found error', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: { message: 'Quote not found' }
                }
            };
            axiosClient.get.mockRejectedValueOnce(notFoundError);

            await expect(quoteApi.getQuoteById(mockQuoteId))
                .rejects
                .toMatchObject({
                    code: 'NOT_FOUND',
                    message: 'Resource not found'
                });
        });
    });

    describe('Quote Updates', () => {
        test('updateQuote sends correct request', async () => {
            axiosClient.put.mockResolvedValueOnce(mockResponse);

            const result = await quoteApi.updateQuote(mockQuoteId, mockQuoteData);

            expect(axiosClient.put).toHaveBeenCalledWith(
                `/quote/${mockQuoteId}`,
                mockQuoteData,
                {}
            );
            expect(result).toBe(mockResponse);
        });

        test('updateQuote handles validation errors', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { message: 'Invalid quote data' }
                }
            };
            axiosClient.put.mockRejectedValueOnce(validationError);

            await expect(quoteApi.updateQuote(mockQuoteId, mockQuoteData))
                .rejects
                .toMatchObject({
                    code: 'BAD_REQUEST',
                    message: 'Invalid quote data'
                });
        });
    });

    describe('Quote Saving', () => {
        test('saveQuote sends correct request', async () => {
            axiosClient.post.mockResolvedValueOnce(mockResponse);

            const result = await quoteApi.saveQuote(mockQuoteData);

            expect(axiosClient.post).toHaveBeenCalledWith(
                '/quote',
                mockQuoteData,
                {}
            );
            expect(result).toBe(mockResponse);
        });
    });

    describe('Error Handling', () => {
        const errorCases = [
            {
                name: 'handles network errors',
                error: new Error('Network Error'),
                expected: {
                    code: 'NETWORK_ERROR',
                    message: 'Network error'
                }
            },
            {
                name: 'handles unauthorized access',
                error: {
                    response: {
                        status: 401,
                        data: { message: 'Unauthorized' }
                    }
                },
                expected: {
                    code: 'UNAUTHORIZED',
                    message: 'Unauthorized access'
                }
            },
            {
                name: 'handles server errors',
                error: {
                    response: {
                        status: 500,
                        data: { message: 'Internal server error' }
                    }
                },
                expected: {
                    code: 'SERVER_ERROR',
                    message: 'Server error'
                }
            }
        ];

        errorCases.forEach(({ name, error, expected }) => {
            test(name, async () => {
                axiosClient.post.mockRejectedValueOnce(error);

                await expect(quoteApi.generateQuote(mockBillData))
                    .rejects
                    .toMatchObject(expected);
            });
        });
    });
});
