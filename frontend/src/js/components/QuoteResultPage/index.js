import { ViewManager } from './ViewManager.js';
import { Api } from '../../../api/index.js';

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
            
            // Create ViewManager with quote data
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
        const template = `
            <div class="min-h-screen bg-gray-50">
                <!-- Navigation -->
                <nav class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex">
                                <div class="flex space-x-8">
                                    <a href="#system" data-view="system" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                        <span>System Details</span>
                                    </a>
                                    <a href="#financial" data-view="financial" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                        <span>Financial Analysis</span>
                                    </a>
                                    <a href="#components" data-view="components" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                        <span>Components</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Content Container -->
                <div id="view-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <!-- View content will be rendered here -->
                </div>
            </div>
        `;

        // Render the template
        const container = document.querySelector('#app');
        if (!container) return;
        container.innerHTML = template;

        // Initialize ViewManager with the content container
        const contentContainer = document.querySelector('#view-content');
        if (this.viewManager && contentContainer) {
            this.viewManager.initialize(contentContainer);
        } else {
            console.error('ViewManager or content container not available');
        }
    }

    cleanup() {
        if (this.viewManager) {
            this.viewManager.cleanup();
        }
    }
}

export default QuoteResultPage; 