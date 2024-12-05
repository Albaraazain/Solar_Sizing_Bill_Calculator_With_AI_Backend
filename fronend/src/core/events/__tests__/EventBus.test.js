// src/core/events/__tests__/EventBus.test.js
import { jest, expect, test, describe, beforeEach } from '@jest/globals';
import { eventBus } from '../EventBus.js';
import { createMockEventBus } from '../../../test/setup.js';

describe('EventBus', () => {
    beforeEach(() => {
        eventBus.clear();
    });

    test('subscribe and publish', () => {
        const mockCallback = jest.fn();
        eventBus.subscribe('test-event', mockCallback);

        const testData = { message: 'test' };
        eventBus.publish('test-event', testData);

        expect(mockCallback).toHaveBeenCalledWith(testData);
    });
});
