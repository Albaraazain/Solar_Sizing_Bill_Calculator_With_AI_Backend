// src/js/main.js
import { Router } from "./router.js";
import { Api } from "../api/index.js";
import { Toasts } from "./Toasts.js";

class App {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Initialize toasts first
            window.toasts = new Toasts();

            // Initialize API
            const apiInitialized = await Api.initialize();
            if (!apiInitialized) {
                this.handleInitializationError(new Error('API initialization failed'));
                return;
            }

            // Initialize router last
            window.router = new Router();

            // Set up global error handling
            this.setupErrorHandling();

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    setupErrorHandling() {
        window.onerror = (msg, url, line, col, error) => {
            console.error('Global error:', { msg, url, line, col, error });
            window.toasts?.show(
                'An unexpected error occurred. Please try again.',
                'error'
            );
        };

        window.onunhandledrejection = (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            window.toasts?.show(
                'An unexpected error occurred. Please try again.',
                'error'
            );
        };
    }

    handleInitializationError(error) {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div class="flex items-center justify-center h-screen">
                    <div class="text-center max-w-md mx-auto px-4">
                        <h1 class="text-2xl font-bold text-gray-800 mb-4">
                            Failed to Initialize Application
                        </h1>
                        <p class="text-gray-600 mb-6">
                            We're having trouble starting the application. 
                            Please refresh the page or try again later.
                        </p>
                        <button 
                            onclick="window.location.reload()" 
                            class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Start the application
new App();
