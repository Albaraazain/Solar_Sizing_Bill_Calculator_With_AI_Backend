// src/core/loading/LoadingUI.js
import { loadingManager } from './LoadingManager.js';

export class LoadingUI {
    constructor() {
        this.initializeStyles();
    }

    /**
     * Create a loading spinner element
     * @param {string} size - Size of the spinner ('sm', 'md', 'lg')
     * @param {string} color - Color of the spinner ('primary', 'white')
     * @returns {HTMLElement}
     */
    static createSpinner(size = 'md', color = 'primary') {
        const sizes = {
            sm: 'w-4 h-4',
            md: 'w-6 h-6',
            lg: 'w-8 h-8'
        };

        const colors = {
            primary: 'border-emerald-500',
            white: 'border-white'
        };

        const spinner = document.createElement('div');
        spinner.className = `${sizes[size]} loading-spinner ${colors[color]}`;
        return spinner;
    }

    /**
     * Create a skeleton loading placeholder
     * @param {string} type - Type of skeleton ('text', 'circle', 'rect')
     * @param {object} options - Skeleton options
     * @returns {HTMLElement}
     */
    static createSkeleton(type = 'text', options = {}) {
        const element = document.createElement('div');
        element.className = 'skeleton-loading';

        switch (type) {
            case 'text':
                element.className += ' h-4 rounded';
                element.style.width = options.width || '100%';
                break;
            case 'circle':
                element.className += ' rounded-full';
                const size = options.size || '3rem';
                element.style.width = size;
                element.style.height = size;
                break;
            case 'rect':
                element.className += ' rounded';
                element.style.width = options.width || '100%';
                element.style.height = options.height || '100px';
                break;
        }

        return element;
    }

    /**
     * Create a loading overlay
     * @param {string} message - Loading message
     * @returns {HTMLElement}
     */
    static createLoadingOverlay(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        
        const content = document.createElement('div');
        content.className = 'loading-overlay-content';
        
        const spinner = this.createSpinner('lg', 'primary');
        
        const messageEl = document.createElement('p');
        messageEl.className = 'loading-message';
        messageEl.textContent = message;
        
        content.appendChild(spinner);
        content.appendChild(messageEl);
        overlay.appendChild(content);
        
        return overlay;
    }

    /**
     * Show global loading overlay
     * @param {string} message - Loading message
     */
    static showGlobalLoading(message) {
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) return;

        const overlay = this.createLoadingOverlay(message);
        document.body.appendChild(overlay);
        
        // Add appear animation
        requestAnimationFrame(() => {
            overlay.classList.add('loading-overlay-visible');
        });
    }

    /**
     * Hide global loading overlay
     */
    static hideGlobalLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (!overlay) return;

        overlay.classList.remove('loading-overlay-visible');
        
        // Remove after animation
        overlay.addEventListener('transitionend', () => {
            overlay.remove();
        });
    }

    /**
     * Initialize loading styles
     */
    static initializeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Spinner */
            .loading-spinner {
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-left-color: currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Skeleton Loading */
            .skeleton-loading {
                background: linear-gradient(
                    90deg,
                    rgba(226, 232, 240, 0.6) 25%,
                    rgba(226, 232, 240, 0.9) 37%,
                    rgba(226, 232, 240, 0.6) 63%
                );
                background-size: 400% 100%;
                animation: skeleton-loading 1.4s ease infinite;
            }

            @keyframes skeleton-loading {
                0% {
                    background-position: 100% 50%;
                }
                100% {
                    background-position: 0 50%;
                }
            }

            /* Loading Overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .loading-overlay-visible {
                opacity: 1;
            }

            .loading-overlay-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            .loading-message {
                color: #374151;
                font-size: 0.875rem;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
LoadingUI.initializeStyles();