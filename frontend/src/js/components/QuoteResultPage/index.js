import { ViewManager } from './ViewManager.js';

export class QuoteResultPage {
    constructor() {
        this.quoteData = null;
        this.viewManager = null;
    }

    async initialize() {
        try {
            // Get reference number from session storage
            const referenceNumber = sessionStorage.getItem('currentReferenceNumber');
            if (!referenceNumber) {
                throw new Error('No reference number available');
            }

            // Get bill details first
            const response = await Api.bill.getBillDetails(referenceNumber);
            console.log('Bill response:', response);

            if (!response?.success || !response?.data) {
                throw new Error('Invalid bill response structure');
            }

            // Ensure reference number is included in the data
            const billData = {
                ...response.data,
                reference_number: referenceNumber
            };

            // Generate quote using bill data
            const quoteResponse = await Api.quote.generateQuote(billData);
            console.log('Quote response:', quoteResponse);

            if (!quoteResponse?.success || !quoteResponse?.data) {
                throw new Error('Failed to generate quote');
            }

            this.quoteData = quoteResponse.data;
            this.viewManager = new ViewManager(this.quoteData);
            return true;

        } catch (error) {
            console.error('Failed to initialize QuoteResultPage:', error);
            window.toasts?.show(error.message || 'Failed to generate quote', 'error');
            window.router.push('/bill-review');
            return false;
        }
    }

    async render() {
        const initialized = await this.initialize();
        if (!initialized) return;

        const app = document.getElementById("app");
        app.innerHTML = `
            <div class="h-screen w-full overflow-hidden bg-gray-50">
                <!-- Main Layout with Sidebar -->
                <div class="h-full w-full flex">
                    <!-- Sidebar -->
                    <div class="hidden lg:flex w-72 bg-white shadow-xl flex-col relative z-10">
                        <!-- Logo/Brand Area -->
                        <div class="flex-none h-16 flex items-center px-6 border-b border-gray-100">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h1 class="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Solar Quote</h1>
                            </div>
                        </div>

                        <!-- Navigation Menu -->
                        <div class="flex-1 overflow-y-auto px-4 py-6">
                            <!-- Section Title -->
                            <div class="px-2 mb-4">
                                <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</h2>
                            </div>
                            
                            <nav class="space-y-1">
                                <a href="#system" data-view="system" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/50 text-emerald-700 border border-emerald-100/50">
                                    <span class="icon-container w-9 h-9 rounded-lg bg-emerald-600/10 flex items-center justify-center mr-3">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </span>
                                    <span>System Details</span>
                                </a>

                                <a href="#financial" data-view="financial" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="icon-container w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    <span>Financial Analysis</span>
                                </a>

                                <a href="#components" data-view="components" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="icon-container w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </span>
                                    <span>Components</span>
                                </a>
                            </nav>

                            <!-- Additional Section -->
                            <div class="px-2 mt-8 mb-4">
                                <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tools</h2>
                            </div>

                            <nav class="space-y-1">
                                <a href="#calculator" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="icon-container w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <span>Calculator</span>
                                </a>

                                <a href="#export" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="icon-container w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        </svg>
                                    </span>
                                    <span>Export Data</span>
                                </a>
                            </nav>
                        </div>

                        <!-- User/Actions Area -->
                        <div class="flex-none border-t border-gray-100 p-6">
                            <div class="space-y-3">
                                <!-- User Info -->
                                <div class="flex items-center">
                                    <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm font-medium text-gray-900">Guest User</p>
                                        <p class="text-xs text-gray-500">Ref: ${this.quoteData?.reference_number || 'N/A'}</p>
                                    </div>
                                </div>

                                <!-- Action Button -->
                                <button class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm transition-all duration-150">
                                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Quote
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Area -->
                    <div class="flex-1 flex flex-col overflow-hidden">
                        <!-- Top Header -->
                        <div class="flex-none h-16 bg-white shadow-sm flex items-center justify-between px-6 relative z-0">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900">Solar System Overview</h2>
                                <p class="text-sm text-gray-500">View your system details and analysis</p>
                            </div>
                            <button 
                                onclick="window.router.push('/bill-review')"
                                class="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-150 text-sm font-medium text-gray-700"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Review
                            </button>
                        </div>

                        <!-- Scrollable Content -->
                        <div id="main-content" class="flex-1 overflow-auto bg-gray-50/50 p-6 lg:p-8">
                            <!-- Content will be rendered here by ViewManager -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize view manager
        const contentContainer = document.getElementById('main-content');
        this.viewManager.initialize(contentContainer);
    }

    cleanup() {
        if (this.viewManager) {
            this.viewManager.cleanup();
        }
    }
}

export default QuoteResultPage; 