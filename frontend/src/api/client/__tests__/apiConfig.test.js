// src/api/client/__tests__/apiConfig.test.js
import { jest, expect, describe, test } from '@jest/globals';
import { API_CONFIG, HTTP_STATUS } from '../apiConfig.js';

describe('API Configuration', () => {
    test('API_CONFIG has required properties', () => {
        expect(API_CONFIG.BASE_URL).toBeDefined();
        expect(API_CONFIG.TIMEOUT).toBeDefined();
        expect(API_CONFIG.ENDPOINTS).toBeDefined();
        expect(API_CONFIG.HEADERS).toBeDefined();
    });

    test('ENDPOINTS contain required routes', () => {
        expect(API_CONFIG.ENDPOINTS.BILL).toBeDefined();
        expect(API_CONFIG.ENDPOINTS.QUOTE).toBeDefined();
        expect(API_CONFIG.ENDPOINTS.BILL.ANALYZE).toBeDefined();
        expect(API_CONFIG.ENDPOINTS.QUOTE.GENERATE).toBeDefined();
    });

    test('HTTP_STATUS contains standard status codes', () => {
        expect(HTTP_STATUS.OK).toBe(200);
        expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
        expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
        expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    });
});
