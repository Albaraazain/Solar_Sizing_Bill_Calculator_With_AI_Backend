// src/api/mock/MockQuoteApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { MOCK_DATA } from './mockData.js';
import { AppError } from '../../core/utils/ErrorHandler.js';
import { API_CONFIG } from '../client/apiConfig.js';
import { calculateQuoteDetails } from './quoteCalculator.js';

export class MockQuoteApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.QUOTE.BASE);
        this.mockDelay = 800;
    }

    async get(endpoint, config = {}) {
        console.log('MockQuoteApi - GET Request:', endpoint);
        await this.simulateDelay();

        // Extract quote ID from endpoint
        const quoteId = endpoint.split('/').pop();
        console.log('MockQuoteApi - Looking for quote:', quoteId);

        const quote = MOCK_DATA.quotes[quoteId];
        if (!quote) {
            throw new AppError('Quote not found', 'NOT_FOUND', { quoteId });
        }

        return {
            data: quote
        };
    }

    async generateQuote(billDetails) {
        console.log('MockQuoteApi - Generating quote for bill:', billDetails);
        await this.simulateDelay();

        try {
            // Validate bill details
            if (!billDetails || !billDetails.referenceNumber) {
                throw new AppError(
                    'Invalid bill details provided',
                    'VALIDATION_ERROR',
                    { field: 'billDetails' }
                );
            }

            // Generate quote data based on bill details
            const quoteData = calculateQuoteDetails(billDetails);

            // Generate a unique quote ID
            const quoteId = `Q${Date.now().toString().slice(-6)}`;

            // Store the quote in mock data
            const quote = {
                quoteId,
                ...quoteData,
                status: "PENDING",
                createdAt: new Date().toISOString()
            };

            MOCK_DATA.quotes[quoteId] = quote;

            console.log('MockQuoteApi - Generated quote:', quote);

            return {
                success: true,
                data: quote
            };

        } catch (error) {
            console.error('MockQuoteApi - Error generating quote:', error);
            throw error;
        }
    }

    async getQuoteById(quoteId) {
        console.log('MockQuoteApi - Fetching quote:', quoteId);
        return this.get(`/${quoteId}`);
    }

    async saveQuote(quoteData) {
        console.log('MockQuoteApi - Saving quote:', quoteData);
        await this.simulateDelay();

        if (!quoteData.quoteId) {
            throw new AppError('Quote ID is required', 'VALIDATION_ERROR');
        }

        // Update existing quote
        MOCK_DATA.quotes[quoteData.quoteId] = {
            ...MOCK_DATA.quotes[quoteData.quoteId],
            ...quoteData,
            updatedAt: new Date().toISOString()
        };

        return {
            success: true,
            data: MOCK_DATA.quotes[quoteData.quoteId]
        };
    }

    async simulateDelay() {
        const variance = Math.random() * 200;
        const delay = this.mockDelay + variance;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async getPanels() {
        await this.simulateDelay();
        console.log('Fetching mock panels');

        const mockPanels = [
            {
                id: 1,
                brand: "Longhi",
                power: 545,
                price: 400,
                default_choice: false,
                availability: true
            },
            {
                id: 2,
                brand: "Canada Solar",
                power: 580,
                price: 57,
                default_choice: true,
                availability: true
            },
            {
                id: 3,
                brand: "Longi",
                power: 545,
                price: 34,
                default_choice: false,
                availability: true
            }
        ];

        return {
            success: true,
            data: mockPanels
        };
    }

    async getInverters() {
        await this.simulateDelay();
        console.log('Fetching mock inverters');

        const mockInverters = [
            {
                id: 1,
                brand: "Maxpower",
                power: 5,
                price: 100000,
                availability: true
            },
            {
                id: 2,
                brand: "Maxpower",
                power: 8,
                price: 170000,
                availability: true
            },
            {
                id: 3,
                brand: "Maxpower",
                power: 10,
                price: 20000,
                availability: true
            },
            {
                id: 4,
                brand: "Maxpower",
                power: 15,
                price: 250000,
                availability: true
            }
        ];

        return {
            success: true,
            data: mockInverters
        };
    }
}
