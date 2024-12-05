// src/api/services/__tests__/billApi.test.js
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


import { billApi } from '../billApi.js';
import { API_CONFIG } from '../../client/apiConfig.js';
import axiosClient from '../../client/axiosClient.js';

describe('BillApi', () => {
    const mockReferenceNumber = '123456789';
    const mockResponse = { success: true, data: {} };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Bill Analysis', () => {
        test('analyzeBill sends correct request', async () => {
            axiosClient.post.mockResolvedValueOnce(mockResponse);

            const result = await billApi.analyzeBill(mockReferenceNumber);

            expect(axiosClient.post).toHaveBeenCalledWith(
                '/bill/analyze',
                { referenceNumber: mockReferenceNumber },
                {}
            );
            expect(result).toBe(mockResponse);
        });

        test('analyzeBill handles errors correctly', async () => {
            const errorResponse = {
                response: {
                    status: 400,
                    data: { message: 'Invalid reference number' }
                }
            };
            axiosClient.post.mockRejectedValueOnce(errorResponse);

            await expect(billApi.analyzeBill(mockReferenceNumber))
                .rejects
                .toMatchObject({
                    code: 'BAD_REQUEST',
                    message: 'Invalid reference number'
                });
        });
    });

    describe('Bill Details', () => {
        test('getBillDetails sends correct request', async () => {
            axiosClient.get.mockResolvedValueOnce(mockResponse);

            const result = await billApi.getBillDetails(mockReferenceNumber);

            expect(axiosClient.get).toHaveBeenCalledWith(
                `/bill/${mockReferenceNumber}`,
                {}
            );
            expect(result).toBe(mockResponse);
        });
    });

    describe('Consumption History', () => {
        test('getConsumptionHistory sends correct request', async () => {
            axiosClient.get.mockResolvedValueOnce(mockResponse);

            const result = await billApi.getConsumptionHistory(mockReferenceNumber);

            expect(axiosClient.get).toHaveBeenCalledWith(
                `/bill/${mockReferenceNumber}/history`,
                {}
            );
            expect(result).toBe(mockResponse);
        });
    });

    describe('Reference Number Validation', () => {
        test('validateReferenceNumber sends correct request', async () => {
            axiosClient.post.mockResolvedValueOnce(mockResponse);

            const result = await billApi.validateReferenceNumber(mockReferenceNumber);

            expect(axiosClient.post).toHaveBeenCalledWith(
                '/bill/validate',
                { referenceNumber: mockReferenceNumber },
                {}
            );
            expect(result).toBe(mockResponse);
        });

        test('validateReferenceNumber handles validation errors', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { message: 'Invalid format' }
                }
            };
            axiosClient.post.mockRejectedValueOnce(validationError);

            await expect(billApi.validateReferenceNumber(mockReferenceNumber))
                .rejects
                .toMatchObject({
                    code: 'BAD_REQUEST',
                    message: 'Invalid format'
                });
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
                name: 'handles not found errors',
                error: {
                    response: {
                        status: 404,
                        data: { message: 'Bill not found' }
                    }
                },
                expected: {
                    code: 'NOT_FOUND',
                    message: 'Resource not found'
                }
            }
        ];

        errorCases.forEach(({ name, error, expected }) => {
            test(name, async () => {
                axiosClient.post.mockRejectedValueOnce(error);

                await expect(billApi.analyzeBill(mockReferenceNumber))
                    .rejects
                    .toMatchObject(expected);
            });
        });
    });
});
