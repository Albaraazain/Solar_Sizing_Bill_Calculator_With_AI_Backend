// src/api/services/quoteApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class QuoteApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.QUOTE.BASE);
    }
    
    async generateQuote(billData) {
        try {
            console.log('Generating quote for bill data:', billData);
            const response = await this.post(API_CONFIG.ENDPOINTS.QUOTE.GENERATE, billData);
            return response;
        } catch (error) {
            console.error('Error generating quote:', error);
            throw error;
        }
    }

    async getQuoteById(quoteId) {
        try {
            const url = `${API_CONFIG.ENDPOINTS.QUOTE.GET}${quoteId}/`;
            console.log('Fetching quote:', url);
            const response = await this.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching quote:', error);
            throw error;
        }
    }

    async updateQuote(quoteId, updates) {
        try {
            const url = `${API_CONFIG.ENDPOINTS.QUOTE.BASE}${quoteId}/`;
            console.log('Updating quote:', { quoteId, updates });
            const response = await this.put(url, updates);
            return response;
        } catch (error) {
            console.error('Error updating quote:', error);
            throw error;
        }
    }

    async saveQuote(quote) {
        try {
            console.log('Saving quote:', quote);
            const response = await this.post(API_CONFIG.ENDPOINTS.QUOTE.SAVE, quote);
            return response;
        } catch (error) {
            console.error('Error saving quote:', error);
            throw error;
        }
    }
}

export const quoteApi = new QuoteApi();
