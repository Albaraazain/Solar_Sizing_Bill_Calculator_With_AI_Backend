// src/js/components/QuoteResultPage.js
import { gsap } from "gsap";
import Chart from "chart.js/auto";
import { CountUp } from "countup.js";
import { Api } from "/src/api/index.js";
import { ViewManager } from "./QuoteResultPage/ViewManager.js";

export class QuoteResultPage {
    constructor() {
        console.log('QuoteResultPage constructor called');
        this.charts = {};
        this.progressBars = {};
        this.countUps = {};
        this.quoteData = null;
        this.viewManager = null;
        this.initialized = false;
        this.initializing = false;
        this.timeline = null;
    }

    async initialize() {
        console.log('QuoteResultPage initialize called');
        if (this.initialized) {
            console.log('Already initialized');
            return true;
        }

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
            this.initialized = true;
            
            return true;

        } catch (error) {
            console.error('Failed to initialize QuoteResultPage:', error);
            throw error;
        }
    }

    renderLoading() {
        return `
            <div class="quote-loading fixed inset-0 bg-gray-50 flex items-center justify-center opacity-0">
                <div class="text-center space-y-6 transform -translate-y-8">
                    <div class="relative flex justify-center">
                        <svg class="w-20 h-20 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div class="space-y-2">
                        <p class="text-xl font-semibold text-gray-800">Generating Your Solar Quote</p>
                        <p class="text-sm text-gray-600">Please wait while we analyze your energy consumption...</p>
                    </div>
                    <div class="flex justify-center space-x-2">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0s"></div>
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.2s"></div>
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            </div>
        `;
    }

    async render() {
        console.log('QuoteResultPage render called');
        
        // If already initialized, just render content
        if (this.initialized && this.viewManager) {
            console.log('Already initialized, rendering directly');
            return this.renderContent();
        }

        // If currently initializing, wait
        if (this.initializing) {
            console.log('Already initializing, waiting...');
            return;
        }

        // Show loading state with animation
        const container = document.querySelector('#app');
        if (!container) return;
        
        container.innerHTML = this.renderLoading();
        
        // Animate loading screen
        gsap.to('.quote-loading', {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out'
        });

        // Start initialization
        console.log('Starting initialization');
        this.initializing = true;
        
        try {
            await this.initialize();
            console.log('Initialization successful, rendering content');
            
            // Transition out loading screen
            await gsap.to('.quote-loading', {
                opacity: 0,
                scale: 0.95,
                duration: 0.4,
                ease: 'power2.in'
            });
            
            await this.renderContent();
        } catch (error) {
            console.error('Error during initialization:', error);
            container.innerHTML = this.renderError(error.message || 'An error occurred');
            
            // Fade in error message
            gsap.to('.error-container', {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
            });
        } finally {
            this.initializing = false;
        }
    }

    async renderContent() {
        console.log('QuoteResultPage renderContent called');
        const template = `
            <div class="quote-page min-h-screen bg-gray-50 opacity-0">
                <!-- Navigation -->
                <nav class="nav-bar bg-white shadow-sm transform -translate-y-full">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex">
                                <div class="flex space-x-8">
                                    <a href="#overview" data-view="overview" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                        <span>Overview</span>
                                    </a>
                                    <a href="#system" data-view="system" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                        <span>System Details</span>
                                    </a>
                                    <a href="#financial" data-view="financial" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                        <span>Financial Analysis</span>
                                    </a>
                                    <a href="#components" data-view="components" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                        <span>Components</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Content Container -->
                <div id="view-content" class="view-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 opacity-0 transform translate-y-4">
                    <!-- View content will be rendered here -->
                </div>
            </div>
        `;

        // Render the template
        const container = document.querySelector('#app');
        if (!container) {
            console.error('App container not found');
            return;
        }
        container.innerHTML = template;

        // Create animation timeline
        this.timeline = gsap.timeline({
            defaults: { 
                duration: 0.6,
                ease: 'power2.out'
            }
        });

        // Animate in the quote page
        await this.timeline
            .to('.quote-page', {
                opacity: 1,
                duration: 0.8
            })
            .to('.nav-bar', {
                y: 0,
                duration: 0.5
            }, '-=0.4')
            .to('.nav-link', {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.4
            }, '-=0.2')
            .to('.view-content', {
                opacity: 1,
                y: 0,
                duration: 0.6
            }, '-=0.2');

        // Initialize ViewManager with the content container
        const contentContainer = document.querySelector('#view-content');
        if (this.viewManager && contentContainer) {
            console.log('Initializing ViewManager with content container');
            await this.viewManager.initialize(contentContainer);
        } else {
            console.error('ViewManager or content container not available');
        }
    }

    renderError(message) {
        return `
            <div class="error-container min-h-screen bg-gray-50 flex items-center justify-center opacity-0">
                <div class="text-center space-y-4">
                    <div class="inline-block rounded-full p-4 bg-red-50 text-red-500">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p class="text-xl font-semibold text-gray-800">${message}</p>
                    <button 
                        onclick="window.router.push('/bill-review')"
                        class="mt-4 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        Back to Bill Review
                    </button>
                </div>
            </div>
        `;
    }

    cleanup() {
        if (this.viewManager) {
            this.viewManager.cleanup();
        }
        if (this.timeline) {
            this.timeline.kill();
        }
    }
}

export default QuoteResultPage;
