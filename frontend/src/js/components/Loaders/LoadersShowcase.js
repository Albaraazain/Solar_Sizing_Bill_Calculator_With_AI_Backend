import { LoadingUI } from '/src/core/loading/LoadingUI.js';

export class LoadersShowcase {
    constructor() {
        this.modalVisible = false;
    }

    render() {
        const app = document.getElementById("app");
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div class="max-w-4xl mx-auto">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Loading Indicators
                        </h1>
                        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                            Standardized loading indicators for consistent user experience
                        </p>
                    </div>

                    <div class="mt-12 space-y-12">
                        <!-- Page Loading Templates -->
                        <section>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Page Loading Templates</h2>
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <h3 class="text-lg font-medium text-gray-900 mb-4">Standard Page Loading</h3>
                                    <div class="border border-gray-200 rounded-md h-64 flex items-center justify-center">
                                        <div class="text-center">
                                            ${LoadingUI.createSpinner('xl', 'primary').outerHTML}
                                            <p class="mt-4 text-emerald-600 font-medium">Loading page...</p>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <p class="text-sm text-gray-500">
                                            This is the standard loading template used when a page is being loaded.
                                            Use <code class="bg-gray-100 px-1 py-0.5 rounded">LoadingUI.createPageLoadingTemplate('Loading message', 'bg-white')</code>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Spinner Variations -->
                        <section>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Spinner Variations</h2>
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <h3 class="text-lg font-medium text-gray-900 mb-4">Sizes and Colors</h3>
                                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('sm', 'primary').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">Small Primary</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('md', 'primary').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">Medium Primary</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('lg', 'primary').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">Large Primary</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('xl', 'primary').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">XL Primary</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center bg-emerald-600">
                                            ${LoadingUI.createSpinner('sm', 'white').outerHTML}
                                            <p class="mt-2 text-xs text-white">Small White</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center bg-emerald-600">
                                            ${LoadingUI.createSpinner('md', 'white').outerHTML}
                                            <p class="mt-2 text-xs text-white">Medium White</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center bg-emerald-600">
                                            ${LoadingUI.createSpinner('lg', 'white').outerHTML}
                                            <p class="mt-2 text-xs text-white">Large White</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center bg-emerald-600">
                                            ${LoadingUI.createSpinner('xl', 'white').outerHTML}
                                            <p class="mt-2 text-xs text-white">XL White</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('sm', 'green').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">Small Green</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('md', 'green').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">Medium Green</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('lg', 'green').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">Large Green</p>
                                        </div>
                                        <div class="border border-gray-200 rounded-md p-4 flex flex-col items-center">
                                            ${LoadingUI.createSpinner('xl', 'green').outerHTML}
                                            <p class="mt-2 text-xs text-gray-500">XL Green</p>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <p class="text-sm text-gray-500">
                                            Use <code class="bg-gray-100 px-1 py-0.5 rounded">LoadingUI.createSpinner(size, color)</code> 
                                            where size is 'sm', 'md', 'lg', or 'xl' and color is 'primary', 'white', or 'green'.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Global Loading Overlay -->
                        <section>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Global Loading Overlay</h2>
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <h3 class="text-lg font-medium text-gray-900 mb-4">Fullscreen Loading Overlay</h3>
                                    <div class="mb-4">
                                        <button id="showOverlayBtn" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                            Show Loading Overlay
                                        </button>
                                    </div>
                                    <div class="border border-gray-200 rounded-md h-64 flex items-center justify-center bg-gray-50">
                                        <p class="text-gray-500">Click the button above to see the overlay in action</p>
                                    </div>
                                    <div class="mt-3">
                                        <p class="text-sm text-gray-500">
                                            Use <code class="bg-gray-100 px-1 py-0.5 rounded">LoadingUI.showGlobalLoading('Your message')</code> 
                                            to show a fullscreen loading overlay. Hide it with <code class="bg-gray-100 px-1 py-0.5 rounded">LoadingUI.hideGlobalLoading()</code>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Button Loading States -->
                        <section>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Button Loading States</h2>
                            <div class="bg-white overflow-hidden shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <h3 class="text-lg font-medium text-gray-900 mb-4">Button with Loading State</h3>
                                    <div class="space-y-4">
                                        <div class="relative inline-block">
                                            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none">
                                                Process
                                            </button>
                                        </div>
                                        <div class="relative inline-block">
                                            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none opacity-75 cursor-not-allowed">
                                                <span class="opacity-0">Process</span>
                                                <div class="absolute inset-0 flex items-center justify-center">
                                                    <span class="text-white mr-2">Processing</span>
                                                    ${LoadingUI.createSpinner('sm', 'white').outerHTML}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <p class="text-sm text-gray-500">
                                            For button loading states, use a combination of positioning and opacity to overlay a spinner.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const showOverlayBtn = document.getElementById('showOverlayBtn');
        if (showOverlayBtn) {
            showOverlayBtn.addEventListener('click', () => {
                if (!this.modalVisible) {
                    this.modalVisible = true;
                    LoadingUI.showGlobalLoading('Processing your request...');
                    
                    // Auto hide after 3 seconds for demo
                    setTimeout(() => {
                        LoadingUI.hideGlobalLoading();
                        this.modalVisible = false;
                    }, 3000);
                }
            });
        }
    }
}

export default LoadersShowcase; 