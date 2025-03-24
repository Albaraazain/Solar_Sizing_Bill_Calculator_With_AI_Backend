// src/core/loading/LoadingManager.js
import { eventBus } from '../events/EventBus.js';

export class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.subscribers = new Set();
        
        // Initialize global loading state
        this.globalLoading = false;
        
        // Loading state events
        this.events = {
            STATE_CHANGED: 'loading:state-changed',
            GLOBAL_CHANGED: 'loading:global-changed'
        };

        // Add error recovery mechanism
        window.addEventListener('unhandledrejection', this.handleError.bind(this));
        window.addEventListener('error', this.handleError.bind(this));
    }

    /**
     * Handle unexpected errors and cleanup loading states
     * @private
     */
    handleError() {
        // Clear all loading states to prevent UI from being stuck in loading
        const states = Array.from(this.loadingStates.keys());
        states.forEach(key => {
            try {
                this.stopLoading(key);
            } catch (error) {
                console.error('Error cleaning up loading state:', error);
            }
        });

        // Reset global loading state
        this.globalLoading = false;
        try {
            this._emitGlobalChange();
        } catch (error) {
            console.error('Error resetting global loading state:', error);
        }
    }

    /**
     * Reset all loading states
     * @public
     */
    reset() {
        this.loadingStates.clear();
        this.globalLoading = false;
        try {
            this._emitStateChange();
            this._emitGlobalChange();
        } catch (error) {
            console.error('Error resetting loading manager:', error);
        }
    }
    
    /**
     * Clean up event listeners and subscriptions
     * @public
     */
    cleanup() {
        window.removeEventListener('unhandledrejection', this.handleError);
        window.removeEventListener('error', this.handleError);
        eventBus.clear(); // Clear any remaining event subscriptions
        this.subscribers.clear();
        this.reset();
    }
    
    /**
     * Handle error event
     * @private
     * @param {ErrorEvent|PromiseRejectionEvent} event - Error event
     */
    handleError(event) {
        // Prevent handling same error multiple times
        if (event.defaultPrevented) return;
    
        // Mark error as handled
        event.preventDefault();
    
        const error = event.error || (event.reason ? new Error(event.reason) : new Error('Unknown error'));
        console.error('LoadingManager caught error:', error);
    
        // Reset loading states
        this.reset();
    }

    /**
     * Start a loading state with a given key and message
     * @param {string} key - Unique identifier for this loading state
     * @param {object} options - Loading state options
     * @param {string} options.message - Loading message to display
     * @param {boolean} options.isGlobal - Whether this is a global loading state
     * @param {string} options.type - Type of loading ('page', 'component', 'action')
     */
    async startLoading(key, { message = '', isGlobal = false, type = 'component' } = {}) {
        try {
            this.loadingStates.set(key, {
                message,
                type,
                startTime: Date.now()
            });

            if (isGlobal) {
                this.globalLoading = true;
                await this._emitGlobalChange();
            }

            await this._emitStateChange();
        } catch (error) {
            console.error('Error starting loading state:', error);
            // Ensure the loading state is still set even if event emission fails
            this.loadingStates.set(key, {
                message,
                type,
                startTime: Date.now()
            });
        }
    }

    /**
     * Stop a loading state
     * @param {string} key - Unique identifier for the loading state
     */
    async stopLoading(key) {
        try {
            const state = this.loadingStates.get(key);
            if (state) {
                this.loadingStates.delete(key);
                
                // Check if we need to update global loading state
                if (this.globalLoading && !this.hasGlobalLoadingStates()) {
                    this.globalLoading = false;
                    await this._emitGlobalChange();
                }

                await this._emitStateChange();
            }
        } catch (error) {
            console.error('Error stopping loading state:', error);
            // Ensure the loading state is still cleared even if event emission fails
            this.loadingStates.delete(key);
        }
    }

    /**
     * Check if a specific key is in loading state
     * @param {string} key - Unique identifier for the loading state
     * @returns {boolean}
     */
    isLoading(key) {
        return this.loadingStates.has(key);
    }

    /**
     * Get all active loading states
     * @returns {Map}
     */
    getActiveLoadingStates() {
        return new Map(this.loadingStates);
    }

    /**
     * Check if there are any global loading states active
     * @returns {boolean}
     */
    hasGlobalLoadingStates() {
        for (const [_, state] of this.loadingStates) {
            if (state.type === 'page') return true;
        }
        return false;
    }

    /**
     * Get the current global loading state
     * @returns {boolean}
     */
    isGlobalLoading() {
        return this.globalLoading;
    }

    /**
     * Subscribe to loading state changes
     * @param {Function} callback - Function to call when loading state changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Subscribe to global loading state changes
     * @param {Function} callback - Function to call when global loading state changes
     * @returns {Function} Unsubscribe function
     */
    subscribeToGlobal(callback) {
        return eventBus.subscribe(this.events.GLOBAL_CHANGED, callback);
    }

    /**
     * Emit loading state change event
     * @private
     */
    async _emitStateChange() {
        try {
            await Promise.resolve(); // Ensure async execution
            eventBus.publish(this.events.STATE_CHANGED, {
                states: this.getActiveLoadingStates(),
                isGlobalLoading: this.globalLoading
            });

            this.subscribers.forEach(callback => {
                try {
                    callback(this.getActiveLoadingStates());
                } catch (error) {
                    console.error('Error in loading state subscriber:', error);
                }
            });
        } catch (error) {
            console.error('Error emitting state change:', error);
        }
    }

    /**
     * Emit global loading state change event
     * @private
     */
    async _emitGlobalChange() {
        try {
            await Promise.resolve(); // Ensure async execution
            eventBus.publish(this.events.GLOBAL_CHANGED, this.globalLoading);
        } catch (error) {
            console.error('Error emitting global change:', error);
        }
    }
}

// Create and export singleton instance
export const loadingManager = new LoadingManager();