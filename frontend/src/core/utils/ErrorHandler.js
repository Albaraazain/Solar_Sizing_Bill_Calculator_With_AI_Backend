// src/core/utils/ErrorHandler.js
import { eventBus } from '../events/EventBus.js';
import { ENV } from '../../config/environment.js';

export class AppError extends Error {
    constructor(message, code, data = {}) {
        super(message);
        this.code = code;
        this.data = data;
        this.timestamp = new Date();
    }
}

export class ErrorHandler {
    static handle(error) {
        if (error instanceof AppError) {
            return this.handleAppError(error);
        }
        return this.handleUnknownError(error);
    }

    static handleAppError(error) {
        eventBus.publish('error', {
            message: error.message,
            code: error.code,
            data: error.data
        });

        if (ENV.DEBUG) {
            console.error('App Error:', error);
        }
    }

    static handleUnknownError(error) {
        eventBus.publish('error', {
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
            originalError: error
        });

        if (ENV.DEBUG) {
            console.error('Unknown Error:', error);
        }
    }
}
