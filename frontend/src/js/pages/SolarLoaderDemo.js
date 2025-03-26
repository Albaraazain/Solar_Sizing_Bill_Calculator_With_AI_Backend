import { SolarLoader, SolarLoadingOverlay } from '../components/Loaders/SolarLoader.js';
import { LoadingUI } from '../../core/loading/LoadingUI.js';

export class SolarLoaderDemo {
    constructor() {
        this.initialized = false;
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div class="max-w-4xl mx-auto">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Solar Loading Indicators Demo
                        </h1>
                        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                            Interactive demo of the new solar-themed loading indicators
                        </p>
                    </div>

                    <div class="mt-8 mb-12">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-white shadow rounded-lg p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">Page Loading</h2>
                                <button id="page-loading-btn" class="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
                                    Show Page Loading
                                </button>
                            </div>
                            
                            <div class="bg-white shadow rounded-lg p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">Global Overlay</h2>
                                <button id="global-loading-btn" class="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
                                    Show Global Overlay
                                </button>
                            </div>
                            
                            <div class="bg-white shadow rounded-lg p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4">Component Loading</h2>
                                <button id="component-loading-btn" class="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
                                    Show Component Loading
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8">
                        <div class="bg-white shadow rounded-lg overflow-hidden">
                            <div class="p-6">
                                <h2 class="text-xl font-semibold text-gray-900 mb-4">Demo Area</h2>
                                <div id="demo-container" class="bg-gray-50 h-64 rounded-lg flex items-center justify-center border border-gray-200">
                                    <p class="text-gray-500">Click one of the buttons above to see the demos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const pageLoadingBtn = document.getElementById('page-loading-btn');
        const globalLoadingBtn = document.getElementById('global-loading-btn');
        const componentLoadingBtn = document.getElementById('component-loading-btn');
        const demoContainer = document.getElementById('demo-container');

        if (pageLoadingBtn) {
            pageLoadingBtn.addEventListener('click', () => {
                demoContainer.innerHTML = LoadingUI.createPageLoadingTemplate('Calculating solar system size...', 'bg-gray-50');
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    demoContainer.innerHTML = '<p class="text-gray-500">Demo completed. Try another one!</p>';
                }, 3000);
            });
        }

        if (globalLoadingBtn) {
            globalLoadingBtn.addEventListener('click', () => {
                const overlay = SolarLoadingOverlay.show('Analyzing solar potential...');
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    SolarLoadingOverlay.hide(overlay);
                }, 3000);
            });
        }

        if (componentLoadingBtn) {
            componentLoadingBtn.addEventListener('click', () => {
                demoContainer.innerHTML = '';
                
                const card = document.createElement('div');
                card.className = 'bg-white p-6 rounded-lg shadow-sm max-w-sm mx-auto';
                
                const loader = SolarLoader.create({
                    size: 'md',
                    message: 'Calculating your savings...'
                });
                
                card.appendChild(loader);
                demoContainer.appendChild(card);
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    demoContainer.innerHTML = '<p class="text-gray-500">Demo completed. Try another one!</p>';
                }, 3000);
            });
        }
    }
}

export default SolarLoaderDemo; 