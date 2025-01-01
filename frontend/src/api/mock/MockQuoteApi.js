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


}
