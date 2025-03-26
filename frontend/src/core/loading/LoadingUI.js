// src/core/loading/LoadingUI.js

export class LoadingUI {
    constructor() {
        this.initializeStyles();
    }

    /**
     * Create a loading spinner element
     * @param {string} size - Size of the spinner ('sm', 'md', 'lg', 'xl')
     * @param {string} color - Color of the spinner ('primary', 'white', 'green')
     * @returns {HTMLElement}
     */
    static createSpinner(size = 'md', color = 'primary') {
        const sizes = {
            sm: 'w-4 h-4',
            md: 'w-6 h-6',
            lg: 'w-8 h-8',
            xl: 'w-16 h-16'
        };

        const colors = {
            primary: 'text-emerald-500',
            white: 'text-white',
            green: 'text-green-600'
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
            case 'circle': {
                element.className += ' rounded-full';
                const size = options.size || '3rem';
                element.style.width = size;
                element.style.height = size;
                break;
            }
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
     * @param {object} options - Additional overlay options
     * @returns {HTMLElement}
     */
    static createLoadingOverlay(message = 'Loading...', options = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        
        if (options.transparent) {
            overlay.classList.add('loading-overlay-transparent');
        }
        
        const content = document.createElement('div');
        content.className = 'loading-overlay-content';
        
        const spinner = this.createSpinner(options.spinnerSize || 'lg', options.spinnerColor || 'primary');
        
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
     * @param {object} options - Additional options
     */
    static showGlobalLoading(message = 'Loading...', options = {}) {
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) {
            const messageEl = existingOverlay.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
            return;
        }

        const overlay = this.createLoadingOverlay(message, options);
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
     * Create a page-level loading template
     * @param {string} message - Loading message
     * @param {string} bgColor - Background color class
     * @returns {string} HTML template
     */
    static createPageLoadingTemplate(message = 'Loading...', bgColor = 'bg-white') {
        return `
            <div class="page-loading-container h-screen w-full flex items-center justify-center ${bgColor}">
                <div class="loading-card">
                    <div class="spinner-container">
                        ${this.createSpinner('xl', 'primary').outerHTML}
                    </div>
                    <p class="loading-text">${message}</p>
                    <div class="loading-progress-bar">
                        <div class="loading-progress-value"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize loading styles
     */
    static initializeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Spinner */
            .loading-spinner {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .loading-spinner::before,
            .loading-spinner::after {
                content: '';
                position: absolute;
                border-radius: 50%;
            }
            
            .loading-spinner::before {
                width: 100%;
                height: 100%;
                background-color: currentColor;
                opacity: 0.15;
            }
            
            .loading-spinner::after {
                width: 75%;
                height: 75%;
                border: 2px solid currentColor;
                border-radius: 50%;
                border-top-color: transparent;
                animation: minimal-spin 0.8s linear infinite;
            }

            @keyframes minimal-spin {
                to { transform: rotate(360deg); }
            }

            /* Page Loading Container */
            .page-loading-container {
                display: flex;
                align-items: center;
                justify-content: center;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
            }

            /* Loading Card */
            .loading-card {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                max-width: 90%;
                width: 240px;
                transform: translateY(0);
                animation: subtle-pulse 2s ease-in-out infinite;
            }

            /* Spinner Container */
            .spinner-container {
                margin-bottom: 1rem;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .loading-text {
                color: #10b981;
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 1rem;
                text-align: center;
            }

            /* Loading Progress Bar */
            .loading-progress-bar {
                height: 2px;
                width: 100%;
                background-color: rgba(16, 185, 129, 0.1);
                border-radius: 4px;
                overflow: hidden;
            }

            .loading-progress-value {
                height: 100%;
                width: 30%;
                background-color: #10b981;
                border-radius: 4px;
                animation: minimal-progress 1.5s ease-in-out infinite;
            }

            @keyframes minimal-progress {
                0% { 
                    width: 0%;
                    transform: translateX(0);
                }
                50% { 
                    width: 30%;
                }
                100% { 
                    width: 0%;
                    transform: translateX(100%);
                }
            }

            @keyframes subtle-pulse {
                0% { opacity: 0.95; }
                50% { opacity: 1; }
                100% { opacity: 0.95; }
            }

            /* Skeleton Loading */
            .skeleton-loading {
                background: linear-gradient(
                    90deg,
                    rgba(226, 232, 240, 0.4) 25%,
                    rgba(226, 232, 240, 0.7) 37%,
                    rgba(226, 232, 240, 0.4) 63%
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
                background-color: rgba(255, 255, 255, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.2s ease;
                backdrop-filter: blur(2px);
            }
            
            .loading-overlay-transparent {
                background-color: rgba(255, 255, 255, 0.5);
            }

            .loading-overlay-visible {
                opacity: 1;
            }

            .loading-overlay-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                background-color: white;
                border-radius: 8px;
                padding: 1.5rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                min-width: 200px;
                text-align: center;
                animation: slide-up 0.3s ease-out forwards;
            }

            @keyframes slide-up {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .loading-message {
                color: #10b981;
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            /* Media queries for responsive design */
            @media (max-width: 640px) {
                .loading-card {
                    width: 220px;
                    padding: 1.25rem;
                }
                
                .loading-overlay-content {
                    padding: 1.25rem;
                    min-width: 180px;
                }
                
                .loading-message {
                    font-size: 0.8125rem;
                }

                .loading-text {
                    font-size: 0.8125rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
LoadingUI.initializeStyles();