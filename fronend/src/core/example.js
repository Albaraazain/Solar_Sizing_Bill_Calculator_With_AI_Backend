// src/core/example.js

import { appState } from './state/State';
import { eventBus } from './events/EventBus';
import { ErrorHandler, AppError } from './utils/ErrorHandler';
import { ENV } from '../config/environment';

// Example usage
function testCoreSystem() {
    // Subscribe to state changes
    eventBus.subscribe('state:change', ({key, newValue}) => {
        console.log(`State changed: ${key} = `, newValue);
    });

    // Subscribe to errors
    eventBus.subscribe('error', error => {
        console.log('Error occurred:', error);
    });

    // Update state
    appState.setState('user', { id: 1, name: 'Test User' });

    // Watch specific state key
    appState.watch('billData', (newValue, oldValue) => {
        console.log('Bill data changed:', { oldValue, newValue });
    });

    // Test error handling
    try {
        throw new AppError('Test error', 'TEST_ERROR', { detail: 'test' });
    } catch (error) {
        ErrorHandler.handle(error);
    }
}

// Run the test if we're in development
if (ENV.DEBUG) {
    testCoreSystem();
}
