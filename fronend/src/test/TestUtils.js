// src/test/TestUtils.js
import { jest } from '@jest/globals';

export class TestUtils {
    static createMockEvent(type, data = {}) {
        return {
            type,
            data,
            timestamp: new Date()
        };
    }

    static async expectEventually(callback, timeout = 1000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            try {
                await callback();
                return;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        await callback();
    }

    static createMockState(initialData = {}) {
        return {
            data: { ...initialData },
            listeners: new Map(),
            setState: jest.fn(),
            getState: jest.fn()
        };
    }
}
