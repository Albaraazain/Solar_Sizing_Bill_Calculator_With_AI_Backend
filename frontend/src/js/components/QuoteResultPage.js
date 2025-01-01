// src/js/components/QuoteResultPage.js
import { gsap } from "gsap";
import Chart from "chart.js/auto";
import { CountUp } from "countup.js";
import { Api } from "/src/api/index.js";

export class QuoteResultPage {
    constructor() {
        this.charts = {};
        this.progressBars = {};
        this.countUps = {};
        this.quoteData = null;
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
            reference_number: referenceNumber  // Explicitly include the reference number
        };

        // Generate quote using bill data
        const quoteResponse = await Api.quote.generateQuote(billData);
        console.log('Quote response:', quoteResponse);

        if (!quoteResponse?.success || !quoteResponse?.data) {
            throw new Error('Failed to generate quote');
        }

        this.quoteData = quoteResponse.data;
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
                                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
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
                                <a href="#overview" class="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 border border-blue-100/50">
                                    <span class="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center mr-3">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </span>
                                    <span>Overview</span>
                                </a>

                                <a href="#system" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </span>
                                    <span>System Details</span>
                                </a>

                                <a href="#financial" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    <span>Financial Analysis</span>
                                </a>

                                <a href="#components" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
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
                                    <span class="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <span>Calculator</span>
                                </a>

                                <a href="#export" class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150">
                                    <span class="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 group-hover:text-gray-900 flex items-center justify-center mr-3 transition-all duration-150">
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
                                <button class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-150">
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
                        <div class="flex-1 overflow-auto bg-gray-50/50 p-6 lg:p-8">
                            <div class="max-w-[1136px] mx-auto">
                                <div class="grid grid-cols-1 xl:grid-cols-[1fr,324px] gap-3 sm:gap-4 lg:gap-6">
                                    <!-- Left Column -->
                                    <div class="space-y-3 sm:space-y-4 lg:space-y-6">
                                        <!-- Top Row -->
                                        <div class="grid grid-cols-1 lg:grid-cols-[325px,1fr] gap-3 sm:gap-4 lg:gap-6">
                                            <!-- System Size & Stats Cards -->
                                            <div class="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                                                ${this.renderSystemSizeCard()}
                                                ${this.renderQuickStats()}
                                            </div>
                                            
                                            <!-- Production Chart -->
                                            <div class="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                                                <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Energy Production</h3>
                                                <div class="h-[200px] sm:h-[250px] lg:h-[300px]">
                                                    <canvas id="production-chart"></canvas>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Bottom Row -->
                                        <div class="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-3 sm:gap-4 lg:gap-6">
                                            <div class="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                                                <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Savings Timeline</h3>
                                                <div class="h-[200px] sm:h-[250px] lg:h-[300px]">
                                                    <canvas id="savings-chart"></canvas>
                                                </div>
                                            </div>
                                            ${this.renderEnvironmentalImpact()}
                                        </div>
                                    </div>

                                    <!-- Right Column -->
                                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                                        ${this.renderMonthlyProduction()}
                                        ${this.renderCostAnalysis()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachStyles();
        this.initializeComponents();
    }


    renderSystemSizeCard() {
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <div class="flex flex-col h-full">
                    <div class="flex items-center justify-between mb-2 sm:mb-4">
                        <h3 class="text-base sm:text-lg font-semibold">System Size</h3>
                        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col justify-center">
                        <div class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                            <div class="flex items-baseline">
                                <span id="system-size-value">0</span>
                                <span class="text-base sm:text-lg text-gray-500 ml-1">kW</span>
                            </div>
                        </div>
                        <div class="text-xs sm:text-sm text-gray-500">Recommended capacity</div>
                    </div>
                    <div id="system-size-progress" class="h-2 mt-2 sm:mt-4"></div>
                </div>
            </div>
        `;
    }


    renderQuickStats() {
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <div class="grid grid-cols-2 gap-3 sm:gap-4">
                    <div class="text-center">
                        <div class="text-xl sm:text-3xl font-bold text-emerald-600">
                            <div class="flex items-baseline justify-center">
                                <span id="daily-production">0</span>
                                <span class="text-sm sm:text-base ml-1">kWh</span>
                            </div>
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600">Daily Production</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl sm:text-3xl font-bold text-blue-600" id="monthly-savings">0</div>
                        <div class="text-xs sm:text-sm text-gray-600">Monthly Savings</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEnvironmentalImpact() {
        return `
            <div class="bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 text-white">
                <h3 class="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Environmental Impact</h3>
                <div class="flex-1 flex flex-col justify-center">
                    <div class="mb-4 sm:mb-6">
                        <div class="text-xs sm:text-sm opacity-80 mb-1">CO₂ Offset</div>
                        <div class="text-xl sm:text-3xl font-bold">
                            <div class="flex items-baseline">
                                <span id="co2-value">0</span>
                                <span class="text-base sm:text-lg ml-1">tons/year</span>
                            </div>
                        </div>
                        <div class="w-full bg-white/20 h-1.5 sm:h-2 rounded-full mt-2">
                            <div class="bg-white h-full rounded-full" style="width: 75%"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <div class="text-xs sm:text-sm opacity-80">Trees Equivalent</div>
                            <div class="text-lg sm:text-2xl font-bold">
                                <span id="trees-value">0</span>
                            </div>
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm opacity-80">Energy for Homes</div>
                            <div class="text-lg sm:text-2xl font-bold">
                                <span id="homes-value">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    renderMonthlyProduction() {
        return `
            <div class="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Monthly Production</h3>
                <div class="h-[200px] sm:h-[250px]">
                    <canvas id="monthly-production-chart"></canvas>
                </div>
            </div>
        `;
    }

    renderCostAnalysis() {
        return `
            <div class="bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 text-white">
                <h3 class="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Cost Analysis</h3>
                <div class="flex-1 flex flex-col justify-center">
                    <div class="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2" id="total-cost">0</div>
                    <div class="text-xs sm:text-sm opacity-80">Total Investment</div>
                    <div class="mt-3 sm:mt-4 text-xs sm:text-sm bg-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 inline-flex items-center">
                        <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        30% Tax Credit Available
                    </div>
                </div>
            </div>
        `;
    }

    initializeComponents() {
        if (!this.quoteData) {
            console.error("No quote data available");
            window.router.push("/bill-review");
            return;
        }

        requestAnimationFrame(() => {
            try {
                this.initCharts();
                this.initCounters();
                this.startAnimations();
            } catch (error) {
                console.error("Error initializing components:", error);
            }
        });
    }

    initCounters() {
        const countUpOptions = {
            duration: 2,
            useEasing: true,
            useGrouping: true,
            separator: ',',
            decimal: '.'
        };

        const configs = [
            {
                id: "system-size-value",
                endVal: parseFloat(this.quoteData?.systemDetails?.systemSize || 0),
                options: {
                    ...countUpOptions,
                    decimalPlaces: 2,
                    suffix: ''
                }
            },
            {
                id: "daily-production",
                endVal: parseFloat(this.quoteData?.production?.daily || 0),
                options: {
                    ...countUpOptions,
                    decimalPlaces: 1,
                    suffix: ''
                }
            },
            {
                id: "monthly-savings",
                endVal: parseFloat(this.quoteData?.financial?.monthlySavings || 0),
                options: {
                    ...countUpOptions,
                    decimalPlaces: 0,
                    prefix: 'PKR ',
                    suffix: ''
                }
            },
            {
                id: "total-cost",
                endVal: parseFloat(this.quoteData?.financial?.systemCost || 0),
                options: {
                    ...countUpOptions,
                    decimalPlaces: 0,
                    prefix: 'PKR ',
                    suffix: ''
                }
            },
            {
                id: "co2-value",
                endVal: parseFloat(this.quoteData?.environmental?.co2Offset || 0),
                options: {
                    ...countUpOptions,
                    decimalPlaces: 1,
                    suffix: ''
                }
            },
            {
                id: "trees-value",
                endVal: parseFloat(this.quoteData?.environmental?.treesEquivalent || 0),
                options: {
                    ...countUpOptions,
                    decimalPlaces: 0,
                    suffix: ''
                }
            },
            {
                id: "homes-value",
                endVal: parseFloat(this.quoteData?.environmental?.homesEquivalent || 0),
                options: {
                    ...countUpOptions,
                    decimalPlaces: 0,
                    suffix: ''
                }
            }
        ];

        configs.forEach(config => {
            const element = document.getElementById(config.id);
            if (!element) return;

            try {
                // Make sure we have a valid number
                const endVal = Number.isFinite(config.endVal) ? config.endVal : 0;
                
                // Create new instance with explicit parameters
                const countUp = new CountUp(element, endVal, {
                    ...config.options,
                    startVal: 0
                });

                if (!countUp.error) {
                    this.countUps[config.id] = countUp;
                } else {
                    console.error(`Error initializing counter for ${config.id}:`, countUp.error);
                }
            } catch (error) {
                console.error(`Failed to initialize counter for ${config.id}:`, error);
            }
        });
    }



    startAnimations() {
        const cards = document.querySelectorAll('.bg-white, .bg-gradient-to-br');

        gsap.fromTo(cards,
            {
                opacity: 0,
                y: 20
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                onComplete: () => {
                    this.startCountUps();
                }
            }
        );
    }

    startCountUps() {
        Object.values(this.countUps).forEach(counter => {
            if (counter && !counter.error) {
                counter.start();
            }
        });
    }

    initCharts() {
        this.initProductionChart();
        this.initSavingsChart();
        this.initMonthlyProductionChart();
    }

    initProductionChart() {
        const ctx = document.getElementById("production-chart");
        if (!ctx) {
            return;
        }

        const isMobile = window.innerWidth < 768;

        this.charts.production = new Chart(ctx, {
            type: "line",
            data: {
                labels: this.quoteData.production.monthly.map(m => m.month),
                datasets: [
                    {
                        label: "Solar Production",
                        data: this.quoteData.production.monthly.map(m => m.production),
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: isMobile ? 2 : 4,
                        pointHoverRadius: isMobile ? 4 : 6,
                    },
                    {
                        label: "Energy Consumption",
                        data: this.quoteData.production.monthly.map(m => m.consumption),
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: isMobile ? 2 : 4,
                        pointHoverRadius: isMobile ? 4 : 6,
                    }
                ]
            },
            options: this.getChartOptions()
        });
    }

    initSavingsChart() {
        const ctx = document.getElementById("savings-chart");
        if (!ctx) {
            return;
        }

        this.charts.savings = new Chart(ctx, {
            type: "line",
            data: {
                labels: this.quoteData.financial.savingsTimeline.map(y => `Year ${y.year}`),
                datasets: [
                    {
                        label: "Cumulative Savings",
                        data: this.quoteData.financial.savingsTimeline.map(y => y.cumulativeSavings),
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: "Initial Investment",
                        data: this.quoteData.financial.savingsTimeline.map(() =>
                            this.quoteData.financial.systemCost),
                        borderColor: "#ef4444",
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: this.getChartOptions('currency')
        });
    }

    initMonthlyProductionChart() {
        const ctx = document.getElementById("monthly-production-chart");
        if (!ctx) {
            return;
        }

        this.charts.monthlyProduction = new Chart(ctx, {
            type: "bar",
            data: {
                labels: this.quoteData.production.monthly.map(m => m.month),
                datasets: [{
                    label: "Monthly Production",
                    data: this.quoteData.production.monthly.map(m => m.production),
                    backgroundColor: "#10b981"
                }]
            },
            options: {
                ...this.getChartOptions(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `${value} kWh`
                        }
                    }
                }
            }
        });
    }

    getChartOptions() {
        const isMobile = window.innerWidth < 768;

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: isMobile ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#111827',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: isMobile ? 6 : 8,
                    bodyFont: {
                        size: isMobile ? 11 : 13
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: isMobile ? 10 : 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: isMobile ? 10 : 12
                        }
                    }
                }
            }
        };
    }

    generateMonthlyData() {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const baseProduction = this.billData.estimatedMonthlyProduction;
        const seasonalFactors = {
            winter: 0.7,
            spring: 0.9,
            summer: 1.2,
            fall: 0.8
        };

        const production = months.map((_, index) => {
            let factor;
            if (index < 2 || index === 11) factor = seasonalFactors.winter;
            else if (index < 5) factor = seasonalFactors.spring;
            else if (index < 8) factor = seasonalFactors.summer;
            else factor = seasonalFactors.fall;

            return Math.round(baseProduction * factor);
        });

        const consumption = months.map(() =>
            Math.round(this.billData.unitsConsumed * (0.9 + Math.random() * 0.2))
        );

        return { months, production, consumption };
    }

    calculateCO2Offset() {
        return this.billData.estimatedAnnualProduction * 0.0007; // Convert to tons
    }

    attachStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
            
            .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            
            @media (max-width: 640px) {
                .text-2xl { font-size: 1.25rem; }
                .text-lg { font-size: 1rem; }
                .p-4 { padding: 0.75rem; }
                .gap-4 { gap: 0.75rem; }
            }
        `;
        document.head.appendChild(style);
    }

    cleanup() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });

        Object.values(this.progressBars).forEach(bar => {
            if (bar) {
                bar.destroy();
            }
        });

        Object.values(this.countUps).forEach(counter => {
            if (counter) {
                counter.reset();
            }
        });

        gsap.killTweensOf("*");
        window.removeEventListener("resize", this.handleResize);
    }

    handleResize = () => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            Object.values(this.charts).forEach(chart => {
                if (chart) {
                    chart.resize();
                }
            });
        }, 250);
    };
}

export default QuoteResultPage;
