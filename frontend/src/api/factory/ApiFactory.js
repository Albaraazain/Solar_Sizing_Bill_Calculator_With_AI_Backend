// src/api/factory/ApiFactory.js
import { ENV } from '/src/config/environment.js';
import { MockBillApi } from '../mock/MockBillApi.js';
import { MockQuoteApi } from '../mock/MockQuoteApi.js';
import { BillApi } from '../services/billApi.js';
import { QuoteApi } from '../services/quoteApi.js';

export class ApiFactory {
    static createBillApi() {
        const useMock = ENV.USE_MOCK_API;
        console.log('ApiFactory creating BillApi. Using mock:', useMock);
        return useMock ? new MockBillApi() : new BillApi();
    }

    static createQuoteApi() {
        return ENV.USE_MOCK_API ? new MockQuoteApi() : new QuoteApi();
    }
}
