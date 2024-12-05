// src/js/app.js
import { Api } from '../api/index.js';
import { eventBus } from '../core/events/EventBus.js';

export class App {
    constructor() {
        this.setupEventListeners();
    }

    async initialize() {
        try {
            const apiInitialized = await Api.initialize();
            if (!apiInitialized) {
                this.handleError({ code: 'INIT_ERROR', message: 'API initialization failed' });
                return false;
            }
            return true;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    setupEventListeners() {
        eventBus.subscribe('auth:unauthorized', () => {
            this.handleUnauthorized();
        });

        eventBus.subscribe('auth:session-expired', () => {
            this.handleSessionExpired();
        });

        eventBus.subscribe('error', (error) => {
            this.handleError(error);
        });
    }

    handleUnauthorized() {
        if (window.toasts) {
            window.toasts.show('Please log in to continue', 'error');
        }
    }

    handleSessionExpired() {
        if (window.toasts) {
            window.toasts.show('Your session has expired. Please log in again.', 'warning');
        }
    }

    handleError(error) {
        if (!window.toasts) return;

        switch (error.code) {
            case 'NETWORK_ERROR':
                window.toasts.show('Network error. Please check your connection.', 'error');
                break;
            case 'SERVER_ERROR':
                window.toasts.show('Server error. Please try again later.', 'error');
                break;
            case 'INIT_ERROR':
                window.toasts.show('Failed to initialize application. Please refresh.', 'error');
                break;
            default:
                window.toasts.show(error.message || 'An error occurred', 'error');
        }
    }
}
