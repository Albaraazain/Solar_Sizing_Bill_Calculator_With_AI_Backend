// frontend/src/js/components/Loaders/SolarLoader.js

export class SolarLoader {
    /**
     * Creates a solar loader element
     * @param {Object} options - Configuration options 
     * @param {string} options.size - Size of the loader ('sm', 'md', 'lg', 'xl')
     * @param {string|null} options.message - Message to display under the loader
     * @param {boolean} options.showDots - Whether to show animated dots
     * @returns {HTMLElement} The loader element
     */
    static create(options = {}) {
        const size = options.size || 'lg';
        const message = options.message !== undefined ? options.message : 'Calculating';
        const showDots = options.showDots !== undefined ? options.showDots : true;
        
        // Create container element
        const container = document.createElement('div');
        container.className = 'flex flex-col items-center justify-center';
        
        // Set SVG dimensions based on size
        let width, height;
        if (size === 'sm') {
            width = height = 120;
        } else if (size === 'md') {
            width = height = 160;
        } else if (size === 'lg') {
            width = height = 200;
        } else { // 'xl'
            width = height = 240;
        }
        
        // Create SVG element with solar panel and animations
        container.innerHTML = `
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 200 200"
                width="${width}"
                height="${height}"
            >
                <!-- Background Circle -->
                <circle cx="100" cy="100" r="90" fill="#f5f5f5" />
                
                <!-- Solar Panel Base -->
                <rect x="45" y="80" width="110" height="70" rx="3" fill="#2e7d32" />
                
                <!-- Solar Panel Grid Lines -->
                <line x1="45" y1="95" x2="155" y2="95" stroke="#1b5e20" stroke-width="1" />
                <line x1="45" y1="110" x2="155" y2="110" stroke="#1b5e20" stroke-width="1" />
                <line x1="45" y1="125" x2="155" y2="125" stroke="#1b5e20" stroke-width="1" />
                <line x1="45" y1="140" x2="155" y2="140" stroke="#1b5e20" stroke-width="1" />
                
                <line x1="63" y1="80" x2="63" y2="150" stroke="#1b5e20" stroke-width="1" />
                <line x1="81" y1="80" x2="81" y2="150" stroke="#1b5e20" stroke-width="1" />
                <line x1="99" y1="80" x2="99" y2="150" stroke="#1b5e20" stroke-width="1" />
                <line x1="117" y1="80" x2="117" y2="150" stroke="#1b5e20" stroke-width="1" />
                <line x1="135" y1="80" x2="135" y2="150" stroke="#1b5e20" stroke-width="1" />
                
                <!-- Sun Rays (Animated) -->
                <g>
                    <line x1="100" y1="30" x2="100" y2="45" stroke="#ffc107" stroke-width="3" stroke-linecap="round">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                    </line>
                    <line x1="135" y1="40" x2="125" y2="52" stroke="#ffc107" stroke-width="3" stroke-linecap="round">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.25s" />
                    </line>
                    <line x1="160" y1="65" x2="145" y2="72" stroke="#ffc107" stroke-width="3" stroke-linecap="round">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
                    </line>
                    <line x1="65" y1="40" x2="75" y2="52" stroke="#ffc107" stroke-width="3" stroke-linecap="round">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.25s" />
                    </line>
                    <line x1="40" y1="65" x2="55" y2="72" stroke="#ffc107" stroke-width="3" stroke-linecap="round">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
                    </line>
                </g>
                
                <!-- Energy Flow Animation -->
                <path d="M100 150 L100 165 L120 165" stroke="#4caf50" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <animate attributeName="stroke-dasharray" values="0,300;300,0" dur="3s" repeatCount="indefinite" />
                </path>
                
                <!-- Battery indicator -->
                <rect x="120" y="155" width="25" height="15" fill="#388e3c" rx="2" />
                <rect x="145" y="160" width="3" height="5" fill="#388e3c" rx="1" />
                
                <!-- Pulsing Energy Circle -->
                <circle cx="100" cy="100" r="15" fill="#66bb6a" opacity="0.7">
                    <animate attributeName="r" values="15;25;15" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
                </circle>
            </svg>
        `;
        
        // Add message if provided
        if (message) {
            const messageContainer = document.createElement('div');
            messageContainer.className = 'flex items-center mt-2';
            
            const messageText = document.createElement('span');
            messageText.className = 'text-green-800 font-medium text-sm';
            messageText.textContent = message;
            
            messageContainer.appendChild(messageText);
            
            if (showDots) {
                const dotsContainer = document.createElement('span');
                dotsContainer.className = 'inline-block w-6 overflow-hidden';
                
                const dots = document.createElement('span');
                dots.className = 'animate-dots';
                
                dotsContainer.appendChild(dots);
                messageContainer.appendChild(dotsContainer);
            }
            
            container.appendChild(messageContainer);
        }
        
        return container;
    }
}

export class SolarLoadingOverlay {
    /**
     * Creates a solar loading overlay card
     * @param {Object} options - Configuration options
     * @param {string} options.message - Message to display
     * @returns {HTMLElement} The loading overlay element
     */
    static create(options = {}) {
        const message = options.message || "Calculating system size";
        
        const container = document.createElement('div');
        container.className = 'w-full p-6 bg-white rounded-lg shadow-lg border border-emerald-100 flex flex-col items-center solar-loading-overlay';
        
        // For global overlays, add necessary positioning styles
        if (options.isGlobal || options.fullscreen) {
            container.classList.add('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center');
            container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }
        
        // Add solar loader without message
        const loader = SolarLoader.create({ size: 'lg', message: null });
        container.appendChild(loader);
        
        // Add message
        const messageElement = document.createElement('p');
        messageElement.className = 'text-emerald-800 font-medium text-sm mt-4';
        messageElement.textContent = message;
        container.appendChild(messageElement);
        
        // Add progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'w-full h-1 bg-emerald-100 rounded-full mt-4 overflow-hidden';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'h-full bg-gradient-to-r from-emerald-500 to-green-600 w-2/5 rounded-full animate-progress';
        
        progressContainer.appendChild(progressBar);
        container.appendChild(progressContainer);
        
        return container;
    }
    
    /**
     * Shows a fullscreen solar loading overlay
     * @param {string} message - Message to display
     * @returns {HTMLElement} The created overlay
     */
    static show(message = "Calculating system size") {
        const overlay = this.create({ 
            message: message,
            isGlobal: true
        });
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    /**
     * Hides/removes the solar loading overlay
     * @param {HTMLElement} overlay - The overlay to remove (optional)
     */
    static hide(overlay = null) {
        if (overlay) {
            overlay.remove();
        } else {
            const existingOverlay = document.querySelector('.solar-loading-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }
    }
}

export class SolarLoaderDemo {
    constructor() {
        this.activeTab = 'loader';
        this.container = null;
    }
    
    render(targetElement) {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'w-full';
        
        // Create tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'flex border-b border-gray-200 mb-6';
        
        const loaderTabButton = document.createElement('button');
        loaderTabButton.className = `px-4 py-2 font-medium text-sm ${this.activeTab === 'loader' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`;
        loaderTabButton.textContent = 'Basic Loader';
        loaderTabButton.addEventListener('click', () => this.setActiveTab('loader'));
        
        const overlayTabButton = document.createElement('button');
        overlayTabButton.className = `px-4 py-2 font-medium text-sm ${this.activeTab === 'overlay' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`;
        overlayTabButton.textContent = 'Loading Card';
        overlayTabButton.addEventListener('click', () => this.setActiveTab('overlay'));
        
        tabsContainer.appendChild(loaderTabButton);
        tabsContainer.appendChild(overlayTabButton);
        
        // Create content area
        const contentArea = document.createElement('div');
        contentArea.className = 'flex justify-center items-center py-8 bg-gray-50 rounded-lg';
        
        this.updateContent(contentArea);
        
        // Add elements to container
        this.container.appendChild(tabsContainer);
        this.container.appendChild(contentArea);
        
        // Add to target element
        if (targetElement) {
            targetElement.appendChild(this.container);
        }
        
        return this.container;
    }
    
    setActiveTab(tab) {
        this.activeTab = tab;
        
        // Update tab buttons
        const tabButtons = this.container.querySelectorAll('button');
        tabButtons[0].className = `px-4 py-2 font-medium text-sm ${tab === 'loader' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`;
        tabButtons[1].className = `px-4 py-2 font-medium text-sm ${tab === 'overlay' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'}`;
        
        // Update content
        const contentArea = this.container.querySelector('.flex.justify-center');
        this.updateContent(contentArea);
    }
    
    updateContent(contentElement) {
        // Clear content
        contentElement.innerHTML = '';
        
        if (this.activeTab === 'loader') {
            const loaderContainer = document.createElement('div');
            loaderContainer.className = 'flex flex-col items-center';
            
            const loader = SolarLoader.create({
                size: 'lg',
                message: 'Calculating system size'
            });
            
            loaderContainer.appendChild(loader);
            contentElement.appendChild(loaderContainer);
        } else {
            const overlay = SolarLoadingOverlay.create({
                message: 'Analyzing solar potential...'
            });
            
            contentElement.appendChild(overlay);
        }
    }
}

// Add the animations to the global stylesheet
(function() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
        
        .animate-dots::after {
            content: '';
            animation: dots 1.5s infinite;
        }
        
        @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .animate-progress {
            animation: progress 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(styleSheet);
})();

export default SolarLoaderDemo; 