// src/api/services/quoteApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class QuoteApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.QUOTE.BASE);
    }

    async generateQuote(billData) {
        return this.post(API_CONFIG.ENDPOINTS.QUOTE.GENERATE, billData);
    }

    async getQuoteById(quoteId) {
        return this.get(`/${quoteId}`);
    }

    async updateQuote(quoteId, updates) {
        return this.put(`/${quoteId}`, updates);
    }

    async saveQuote(quote) {
        return this.post('', quote);
    }
}

export const quoteApi = new QuoteApi();
