// src/core/state/__tests__/State.test.js
import { jest, expect, test, describe, beforeEach } from '@jest/globals';
import { appState } from '../State.js';
import { eventBus } from '../../events/EventBus.js';
import { TestUtils } from '../../../test/TestUtils.js';
import { createMockEventBus } from '../../../test/setup.js';

describe('State Management', () => {
    beforeEach(() => {
        appState.clearState();
        eventBus.clear();
    });

    test('setState updates state and notifies listeners', async () => {
        const mockCallback = jest.fn();
        appState.watch('testKey', mockCallback);

        appState.setState('testKey', 'testValue');

        await TestUtils.expectEventually(() => {
            expect(mockCallback).toHaveBeenCalledWith('testValue', undefined);
            expect(appState.getState('testKey')).toBe('testValue');
        });
    });

    test('multiple state changes are handled correctly', async () => {
        const states = [];
        appState.watch('counter', value => states.push(value));

        appState.setState('counter', 1);
        appState.setState('counter', 2);
        appState.setState('counter', 3);

        await TestUtils.expectEventually(() => {
            expect(states).toEqual([1, 2, 3]);
        });
    });

    test('unsubscribe removes listener', () => {
        const mockCallback = jest.fn();
        const unsubscribe = appState.watch('testKey', mockCallback);

        appState.setState('testKey', 'testValue');
        expect(mockCallback).toHaveBeenCalledTimes(1);

        unsubscribe();
        appState.setState('testKey', 'newValue');
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });
});
