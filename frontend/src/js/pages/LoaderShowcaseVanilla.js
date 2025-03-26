import { SolarLoader, SolarLoadingOverlay, SolarLoaderDemo } from '../components/Loaders/SolarLoader.js';

export class LoaderShowcaseVanilla {
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
                            Solar Loading Indicators
                        </h1>
                        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                            Beautiful solar-themed loading indicators for your application
                        </p>
                    </div>

                    <div class="mt-12 space-y-12">
                        <!-- Demo section -->
                        <section>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Interactive Demo</h2>
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <div id="demo-container" class="w-full"></div>
                                </div>
                            </div>
                        </section>

                        <!-- Basic Usage section -->
                        <section>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Basic Usage</h2>
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <h3 class="text-lg font-medium text-gray-900 mb-4">Solar Loader Sizes</h3>
                                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" id="sizes-container">
                                        <!-- Sizes will be added here via JavaScript -->
                                    </div>
                                    <div class="mt-4 bg-gray-50 rounded-md p-4">
                                        <pre class="text-sm text-gray-800 overflow-x-auto">
const loader = SolarLoader.create({
    size: 'md',       // 'sm', 'md', 'lg', 'xl'
    message: 'Loading data...',
    showDots: true
});
document.getElementById('container').appendChild(loader);
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Loading Cards section -->
                        <section>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Loading Cards</h2>
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <div class="grid grid-cols-1 gap-6 md:grid-cols-2" id="cards-container">
                                        <!-- Loading cards will be added here via JavaScript -->
                                    </div>
                                    <div class="mt-4 bg-gray-50 rounded-md p-4">
                                        <pre class="text-sm text-gray-800 overflow-x-auto">
const overlay = SolarLoadingOverlay.create({
    message: 'Calculating your solar potential...'
});
document.getElementById('container').appendChild(overlay);
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;

        this.initializeDemos();
    }

    initializeDemos() {
        // Interactive demo
        const demoContainer = document.getElementById('demo-container');
        const demo = new SolarLoaderDemo();
        demo.render(demoContainer);

        // Sizes demo
        const sizesContainer = document.getElementById('sizes-container');
        const sizes = ['sm', 'md', 'lg', 'xl'];
        sizes.forEach(size => {
            const wrapper = document.createElement('div');
            wrapper.className = 'border border-gray-200 rounded-md p-4 flex flex-col items-center';
            
            const loader = SolarLoader.create({
                size: size,
                message: `${size.toUpperCase()} size`
            });
            
            wrapper.appendChild(loader);
            sizesContainer.appendChild(wrapper);
        });

        // Cards demo
        const cardsContainer = document.getElementById('cards-container');
        
        // Example 1: Standard loading
        const card1 = SolarLoadingOverlay.create({
            message: 'Calculating system size...'
        });
        
        // Example 2: Custom message
        const card2 = SolarLoadingOverlay.create({
            message: 'Analyzing solar potential for your location...'
        });
        
        cardsContainer.appendChild(card1);
        cardsContainer.appendChild(card2);
    }
}

export default LoaderShowcaseVanilla; 