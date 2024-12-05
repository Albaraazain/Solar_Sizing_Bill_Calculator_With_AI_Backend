// src/api/mock/MockBillApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { MOCK_DATA } from './mockData.js';
import { AppError } from '/src/core/utils/ErrorHandler.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class MockBillApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.BILL.BASE);
        this.mockDelay = 800;
    }

    async get(endpoint, config = {}) {
        console.log('MockBillApi - get method called with endpoint:', endpoint);
        await this.simulateDelay();
        console.log('Mock GET Request:', `${this.baseURL}${endpoint}`, config);

        // Extract reference number from endpoint
        const referenceNumber = endpoint.split('/').pop();
        console.log('MockBillApi - Extracted reference number:', referenceNumber);
        console.log('MockBillApi - Available mock bills:', Object.keys(MOCK_DATA.bills));

        const bill = MOCK_DATA.bills[referenceNumber];
        console.log('MockBillApi - Found bill:', bill);

        if (!bill) {
            throw new AppError('Bill not found', 'NOT_FOUND', { referenceNumber });
        }

        // Return in the format expected by Axios response
        return {
            data: {
                success: true,
                data: bill
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config
        };
    }

    async post(endpoint, data = {}, config = {}) {
        await this.simulateDelay();
        console.log('Mock POST Request:', `${this.baseURL}${endpoint}`, data, config);

        if (endpoint === '/validate') {
            return this.validateReferenceNumber(data.referenceNumber);
        }

        if (endpoint === '/analyze') {
            return this.handleAnalysis(data.referenceNumber);
        }

        throw new AppError('Endpoint not implemented', 'NOT_IMPLEMENTED');
    }

    async getBillDetails(referenceNumber) {
        console.log('MockBillApi - getBillDetails called with:', referenceNumber);

        try {
            // Add debugging logs
            console.log('MockBillApi - Base URL:', this.baseURL);
            console.log('MockBillApi - ENDPOINTS.BILL.GET:', API_CONFIG.ENDPOINTS.BILL.GET);

            const response = await this.get(`${API_CONFIG.ENDPOINTS.BILL.GET}/${referenceNumber}`);
            console.log('MockBillApi - Get response:', response);

            return response;
        } catch (error) {
            console.error('MockBillApi - Error in getBillDetails:', error);
            throw error;
        }
    }

    async simulateDelay() {
        const variance = Math.random() * 200;
        const delay = this.mockDelay + variance;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async validateReferenceNumber(referenceNumber) {
        console.log('Validating reference number:', referenceNumber);

        if (!referenceNumber) {
            throw new AppError(
                'Reference number is required',
                'VALIDATION_ERROR',
                { field: 'referenceNumber' }
            );
        }

        // Check if the reference number exists in mock data
        const isValid = Boolean(MOCK_DATA.bills[referenceNumber]);
        console.log('Reference number validation result:', isValid);

        // If invalid, throw validation error
        if (!isValid) {
            throw new AppError(
                'Invalid reference number',
                'VALIDATION_ERROR',
                { field: 'referenceNumber' }
            );
        }

        return {
            data: {
                isValid: true,
                referenceNumber: referenceNumber
            }
        };
    }

    async handleAnalysis(referenceNumber) {
        if (!MOCK_DATA.bills[referenceNumber]) {
            throw new AppError('Bill not found', 'NOT_FOUND', { referenceNumber });
        }

        const bill = MOCK_DATA.bills[referenceNumber];
        return {
            success: true,
            data: {
                ...bill,
                analysis: {
                    recommendedSystemSize: 5.0,
                    estimatedSavings: 15000,
                    paybackPeriod: 4.7
                }
            }
        };
    }

    simulateNetworkConditions() {
        const errorRate = 0.05; // 5% chance of network error
        if (Math.random() < errorRate) {
            throw new AppError('Network error', 'NETWORK_ERROR');
        }
    }


    handleValidation(referenceNumber) {
        // Simulate validation logic
        const isValid = Boolean(MOCK_DATA.bills[referenceNumber]);

        // Simulate random validation errors (10% chance)
        if (Math.random() < 0.1) {
            throw new AppError(
                'Validation service temporarily unavailable',
                'SERVICE_ERROR'
            );
        }

        return {
            success: true,
            data: {
                isValid,
                referenceNumber
            }
        };
    }


}
