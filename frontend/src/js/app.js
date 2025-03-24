// src/js/app.js
import { Api } from '../api/index.js';
import { eventBus } from '../core/events/EventBus.js';
import { Router } from './router.js';
import { Toasts } from './Toasts.js';
import { loadingManager } from '../core/loading/LoadingManager.js';

export class App {
    constructor() {
        // Initialize core components
        this.router = new Router();
        this.toasts = new Toasts();
        
        // Make essential components globally available
        window.router = this.router;
        window.toasts = this.toasts;

        // Set up event listeners
        this.setupEventListeners();

        // Bind cleanup method
        this.cleanup = this.cleanup.bind(this);
        this.handleError = this.handleError.bind(this);
        window.addEventListener('unload', this.cleanup);
    }

    async initialize() {
        try {
            // Handle global errors
            window.addEventListener('error', this.handleError);
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError(event.reason || new Error('Promise rejection'));
            });

            const apiInitialized = await Api.initialize();
            if (!apiInitialized) {
                this.handleError({ code: 'INIT_ERROR', message: 'API initialization failed' });
                return false;
            }

            // Start the router after successful initialization
            await this.router.navigate();
            console.log('Application initialized successfully');
            return true;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    setupEventListeners() {
        // Auth events
        eventBus.subscribe('auth:unauthorized', () => {
            this.handleUnauthorized();
        });

        eventBus.subscribe('auth:session-expired', () => {
            this.handleSessionExpired();
        });

        // Error events
        eventBus.subscribe('error', (error) => {
            this.handleError(error);
        });

        // Loading state events
        loadingManager.subscribeToGlobal((isLoading) => {
            if (isLoading) {
                console.log('Global loading started');
            } else {
                console.log('Global loading ended');
            }
        });
    }

    handleUnauthorized() {
        if (window.toasts) {
            window.toasts.show('Please log in to continue', 'error');
        }
        // Reset loading states on auth errors
        loadingManager.reset();
    }

    handleSessionExpired() {
        if (window.toasts) {
            window.toasts.show('Your session has expired. Please log in again.', 'warning');
        }
        // Reset loading states on session expiry
        loadingManager.reset();
    }

    handleError(error) {
        // Reset any active loading states
        loadingManager.reset();

        // Log error for debugging
        console.error('Application error:', error);

        if (!window.toasts) return;

        // Handle different error types
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
            case 'NAVIGATION_ERROR':
                window.toasts.show('Failed to load page. Please try again.', 'error');
                if (this.router) {
                    this.router.handleRouteError();
                }
                break;
            default:
                window.toasts.show(error.message || 'An error occurred', 'error');
        }
    }

    /**
     * Clean up application resources
     */
    cleanup() {
        try {
            // Remove global event listeners
            window.removeEventListener('unload', this.cleanup);
            window.removeEventListener('error', this.handleError);
            window.removeEventListener('unhandledrejection', this.handleError);

            // Clean up managers and services
            loadingManager.cleanup();
            eventBus.clear();

            // Clean up router if it exists
            if (this.router && typeof this.router.cleanup === 'function') {
                this.router.cleanup();
            }

            // Remove global references
            delete window.router;
            delete window.toasts;

            console.log('Application cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}
