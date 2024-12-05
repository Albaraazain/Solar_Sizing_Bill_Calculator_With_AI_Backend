// src/api/index.js
import { billApi } from './services/billApi.js';
import { quoteApi } from './services/quoteApi.js';
import { ApiFactory } from './factory/ApiFactory.js';
import { AuthMiddleware } from './middleware/authMiddleware.js';
import { ApiErrorHandler } from './middleware/errorHandler.js';
import { API_CONFIG } from './client/apiConfig.js';

export class Api {
    static bill = ApiFactory.createBillApi();
    static quote = ApiFactory.createQuoteApi();
    static auth = AuthMiddleware;
    static errorHandler = ApiErrorHandler;
    static config = API_CONFIG;

    static async initialize() {
        try {
            if (this.auth.isAuthenticated()) {
                await this.auth.refreshTokenIfNeeded();
            }
            return true;
        } catch (error) {
            console.error('API initialization failed:', error);
            return false;
        }
    }

    static async handleRequest(requestFn) {
        try {
            return await requestFn();
        } catch (error) {
            throw this.errorHandler.handle(error);
        }
    }
}
// Export individual services for direct use
export { billApi, quoteApi, AuthMiddleware, ApiErrorHandler };
