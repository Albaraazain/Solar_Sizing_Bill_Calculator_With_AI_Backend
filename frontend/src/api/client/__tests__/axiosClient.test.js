// src/api/client/__tests__/axiosClient.test.js
import { jest, expect, describe, test, beforeEach } from '@jest/globals';

// Mock modules first, before any imports
jest.mock('../../../core/events/EventBus.js', () => ({
    eventBus: {
        publish: jest.fn(),
        subscribe: jest.fn(),
        clear: jest.fn()
    }
}));

jest.mock('../../../core/utils/ErrorHandler.js', () => ({
    ErrorHandler: {
        handle: jest.fn()
    }
}));

// Now import the modules
import axiosClient from '../axiosClient.js';
import { eventBus } from '../../../core/events/EventBus.js';
import { ErrorHandler } from '../../../core/utils/ErrorHandler.js';

describe('Axios Client', () => {
    const localStorageMock = {
        store: {},
        getItem: jest.fn(key => localStorageMock.store[key] || null),
        setItem: jest.fn((key, value) => {
            localStorageMock.store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
            delete localStorageMock.store[key];
        }),
        clear: jest.fn(() => {
            localStorageMock.store = {};
        })
    };

    beforeEach(() => {
        Object.defineProperty(globalThis, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    test('adds auth token to request headers when available', async () => {
        const token = 'test-token';
        localStorage.setItem('token', token);

        const config = { headers: {} };
        const modifiedConfig = await axiosClient.interceptors.request.handlers[0].fulfilled(config);

        expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${token}`);
    });

    test('handles unauthorized response', async () => {
        const error = {
            response: { status: 401 }
        };

        try {
            await axiosClient.interceptors.response.handlers[0].rejected(error);
            throw new Error('Should have thrown an error');
        } catch (e) {
            expect(eventBus.publish).toHaveBeenCalledWith('auth:unauthorized');
            expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
        }
    });

    test('handles request errors', async () => {
        const error = new Error('Network Error');

        try {
            await axiosClient.interceptors.request.handlers[0].rejected(error);
            throw new Error('Should have thrown an error');
        } catch (e) {
            expect(ErrorHandler.handle).toHaveBeenCalledWith(error);
        }
    });
});
