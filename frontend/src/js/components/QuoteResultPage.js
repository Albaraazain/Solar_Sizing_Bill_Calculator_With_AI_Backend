// src/js/components/QuoteResultPage.js
import { gsap } from "gsap";
import Chart from "chart.js/auto";
import { CountUp } from "countup.js";
import { Api } from "/src/api/index.js";
import { LoadingUI } from "/src/core/loading/LoadingUI.js";
import { SolarLoadingOverlay } from "/src/js/components/Loaders/SolarLoader.js";

export class QuoteResultPage {
    constructor() {
        this.charts = {};
        this.progressBars = {};
        this.countUps = {};
        this.quoteData = null;
        this.isPdfGenerating = false;
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

    getLoadingTemplate() {
        return LoadingUI.createPageLoadingTemplate('Generating your quote...', 'bg-gray-50');
    }

    async render() {
        const app = document.getElementById("app");
        app.innerHTML = this.getLoadingTemplate();
        
        const initialized = await this.initialize();
        if (!initialized) return;

        app.innerHTML = `
            <div class="h-screen w-full overflow-hidden bg-gray-50">
                <div class="h-full w-full flex flex-col p-2 sm:p-4 lg:p-8">
                    <!-- Header -->
                    <div class="flex-none mb-3 sm:mb-4 lg:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div>
                            <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Solar System Quote</h1>
                            <p class="text-xs sm:text-sm lg:text-base text-gray-500">Based on your consumption analysis</p>
                        </div>
                        <div class="flex gap-2 sm:gap-3">
                            <button 
                                id="generatePdfBtn"
                                class="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg bg-green-600 text-white border border-green-700 shadow-sm hover:bg-green-700 transition-colors text-xs sm:text-sm lg:text-base"
                            >
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Generate PDF Report
                            </button>
                            <button 
                                onclick="window.router.push('/bill-review')"
                                class="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-xs sm:text-sm lg:text-base"
                            >
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        </div>
                    </div>

                    <!-- Main Content Area -->
                    <div class="flex-1 min-h-0 relative">
                        <div class="absolute inset-0 overflow-auto hide-scrollbar">
                            <div class="h-full max-w-[1136px] mx-auto pb-4 sm:pb-6">
                                <div class="grid grid-cols-1 lg:grid-cols-[325px,1fr,325px] gap-3 sm:gap-4 lg:gap-6">
                                    <!-- Left Column -->
                                    <div class="space-y-3 sm:space-y-4 lg:space-y-6">
                                        ${this.renderSystemSizeCard()}
                                        ${this.renderEquipmentDetails()}
                                        ${this.renderPerformanceStats()}
                                    </div>
                                    
                                    <!-- Main Column -->
                                    <div class="space-y-3 sm:space-y-4 lg:space-y-6">
                                        <div class="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                                            <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Energy Production</h3>
                                            <div class="h-[200px] sm:h-[250px] lg:h-[300px]">
                                                <canvas id="production-chart"></canvas>
                                            </div>
                                        </div>
                                        <div class="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                                            <h3 class="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Savings Timeline</h3>
                                            <div class="h-[200px] sm:h-[250px] lg:h-[300px]">
                                                <canvas id="savings-chart"></canvas>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Right Column -->
                                    <div class="space-y-3 sm:space-y-4 lg:space-y-6">
                                        ${this.renderFinancialStats()}
                                        ${this.renderInstallationDetails()}
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
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const generatePdfBtn = document.getElementById('generatePdfBtn');
        if (generatePdfBtn) {
            generatePdfBtn.addEventListener('click', this.handleGeneratePdf.bind(this));
        }
    }
    
    async handleGeneratePdf() {
        if (this.isPdfGenerating || !this.quoteData) return;
        
        try {
            this.isPdfGenerating = true;
            
            // Use the solar loading overlay's show method
            SolarLoadingOverlay.show('Generating your PDF report...');
            
            // Get customer info - in a real app, you might want to prompt for this
            const customerInfo = {
                name: this.quoteData.systemDetails.customer_name || 'Customer',
                address: 'Not specified',
                phone: '034512152266'
            };
            
            // Call the API to generate the PDF
            const response = await Api.quote.generatePDF(this.quoteData, customerInfo);
            
            // Hide the overlay
            SolarLoadingOverlay.hide();
            this.isPdfGenerating = false;
            
            if (response?.success && response?.data) {
                window.toasts?.show('PDF report generated and sent successfully!', 'success');
            } else {
                throw new Error(response?.error?.message || 'Failed to generate PDF');
            }
        } catch (error) {
            // Hide the overlay
            SolarLoadingOverlay.hide();
            
            this.isPdfGenerating = false;
            console.error('Error generating PDF:', error);
            window.toasts?.show(error.message || 'Failed to generate PDF report', 'error');
        }
    }

    renderEquipmentDetails() {
        const { panelType, inverterType, warranty } = this.quoteData.systemDetails;
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="text-base sm:text-lg font-semibold mb-3">Equipment Details</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-gray-600">Solar Panels</span>
                            <span class="text-xs text-emerald-600 font-medium">${warranty.panels}</span>
                        </div>
                        <div class="text-sm font-semibold">${panelType.brand}</div>
                        <div class="text-xs text-gray-500">${panelType.power}W × ${this.quoteData.systemDetails.panelCount} panels</div>
                    </div>
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-gray-600">Inverter</span>
                            <span class="text-xs text-emerald-600 font-medium">${warranty.inverter}</span>
                        </div>
                        <div class="text-sm font-semibold">${inverterType.brand}</div>
                        <div class="text-xs text-gray-500">${inverterType.power}kW capacity</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceStats() {
        const { peakHours, performanceRatio } = this.quoteData.production;
        return `
            <div class="bg-gradient-to-br from-teal-700 to-teal-500 rounded-lg p-4 shadow-sm text-white">
                <h3 class="text-base sm:text-lg font-semibold mb-3">Performance Stats</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="text-sm opacity-80 mb-1">Daily Production</div>
                        <div class="text-2xl font-bold" id="daily-production">0</div>
                        <div class="text-xs opacity-80">kilowatt hours</div>
                    </div>
                    <div>
                        <div class="text-sm opacity-80 mb-1">Peak Hours</div>
                        <div class="text-2xl font-bold">${peakHours}</div>
                        <div class="text-xs opacity-80">hours/day</div>
                    </div>
                    <div>
                        <div class="text-sm opacity-80 mb-1">Performance</div>
                        <div class="text-2xl font-bold">${(performanceRatio * 100).toFixed(0)}%</div>
                        <div class="text-xs opacity-80">ratio</div>
                    </div>
                    <div>
                        <div class="text-sm opacity-80 mb-1">Efficiency</div>
                        <div class="text-2xl font-bold">${(this.quoteData.production.yearlyDegradation).toFixed(1)}%</div>
                        <div class="text-xs opacity-80">annual loss</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFinancialStats() {
        return `
            <div class="bg-gradient-to-br from-cyan-700 to-cyan-500 rounded-lg p-4 shadow-sm text-white">
                <h3 class="text-base sm:text-lg font-semibold mb-3">Financial Overview</h3>
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <div class="text-sm opacity-80 mb-1">Monthly Savings</div>
                        <div class="text-2xl font-bold" id="monthly-savings">0</div>
                        <div class="text-xs opacity-80">PKR per month</div>
                    </div>
                    <div>
                        <div class="text-sm opacity-80 mb-1">Return on Investment</div>
                        <div class="text-2xl font-bold" id="roi-value">0</div>
                        <div class="text-xs opacity-80">% annual return</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderInstallationDetails() {
        const { installationTime, warranty } = this.quoteData.systemDetails;
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="text-base sm:text-lg font-semibold mb-3">Installation</h3>
                <div class="space-y-4">
                    <div>
                        <div class="text-sm text-gray-600 mb-1">Estimated Time</div>
                        <div class="text-xl font-semibold">${installationTime}</div>
                        <div class="text-xs text-gray-500">standard installation</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600 mb-1">Warranty</div>
                        <div class="text-xl font-semibold">${warranty.installation}</div>
                        <div class="text-xs text-gray-500">workmanship coverage</div>
                    </div>
                </div>
            </div>
        `;
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
                            <span id="system-size-value">0</span>
                            <span class="text-base sm:text-lg text-gray-500">kW</span>
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
                        <div class="text-xl sm:text-3xl font-bold text-emerald-600" id="daily-production">0</div>
                        <div class="text-xs sm:text-sm text-gray-600">Daily kWh</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl sm:text-3xl font-bold text-blue-600" id="monthly-savings">0</div>
                        <div class="text-xs sm:text-sm text-gray-600">Monthly PKR</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSystemDetails() {
        const {panelType, inverterType, warranty} = this.quoteData.systemDetails;
        const {peakHours, performanceRatio} = this.quoteData.production;
        
        return `
            <div class="bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 text-white">
                <h3 class="text-base sm:text-lg font-semibold mb-2 sm:mb-4">System Details</h3>
                <div class="flex-1 flex flex-col justify-center">
                    <!-- Financial Metrics -->
                    <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                        <div>
                            <div class="text-xs sm:text-sm opacity-80">ROI</div>
                            <div class="text-lg sm:text-2xl font-bold" id="roi-value">0</div>
                            <div class="text-xs opacity-80">% annual return</div>
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm opacity-80">Payback Period</div>
                            <div class="text-lg sm:text-2xl font-bold" id="payback-value">0</div>
                            <div class="text-xs opacity-80">years</div>
                        </div>
                    </div>
                    
                    <!-- Equipment Details -->
                    <div class="border-t border-white/20 pt-4 mb-4">
                        <div class="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <div class="text-xs sm:text-sm opacity-80">Panels</div>
                                <div class="text-sm font-semibold">${panelType.brand}</div>
                                <div class="text-xs opacity-80">${panelType.power}W • ${warranty.panels}</div>
                            </div>
                            <div>
                                <div class="text-xs sm:text-sm opacity-80">Inverter</div>
                                <div class="text-sm font-semibold">${inverterType.brand}</div>
                                <div class="text-xs opacity-80">${inverterType.power}kW • ${warranty.inverter}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Performance Details -->
                    <div class="border-t border-white/20 pt-4">
                        <div class="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <div class="text-xs sm:text-sm opacity-80">Performance</div>
                                <div class="text-sm font-semibold">${(performanceRatio * 100).toFixed(0)}% Ratio</div>
                                <div class="text-xs opacity-80">${peakHours} peak sun hrs/day</div>
                            </div>
                            <div>
                                <div class="text-xs sm:text-sm opacity-80">Installation</div>
                                <div class="text-sm font-semibold">${this.quoteData.systemDetails.installationTime}</div>
                                <div class="text-xs opacity-80">${warranty.installation} warranty</div>
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
        const { costs } = this.quoteData;
        return `
            <div class="bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg p-4 shadow-sm text-white">
                <h3 class="text-base sm:text-lg font-semibold mb-3">Cost Breakdown</h3>
                <div class="space-y-4">
                    <div>
                        <div class="text-sm opacity-80 mb-1">Total Investment</div>
                        <div class="text-2xl font-bold" id="total-cost">0</div>
                        <div class="text-xs opacity-80">all inclusive price</div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
                        <div>
                            <div class="text-sm opacity-80">Equipment</div>
                            <div class="text-lg font-semibold">PKR ${Math.round(costs.summary.equipment).toLocaleString()}</div>
                            <div class="text-xs opacity-80">${Math.round(costs.details.accessories.percentage)}% of total</div>
                        </div>
                        <div>
                            <div class="text-sm opacity-80">Installation</div>
                            <div class="text-lg font-semibold">PKR ${Math.round(costs.summary.installation).toLocaleString()}</div>
                            <div class="text-xs opacity-80">${Math.round(costs.details.installation.percentage)}% of total</div>
                        </div>
                    </div>
                    <div class="text-xs bg-white/20 rounded-lg px-3 py-2 inline-flex items-center mt-2">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        };

        const configs = [
            {
                id: "system-size-value",
                value: this.quoteData.systemDetails.systemSize,
                decimals: 2,
                suffix: " kW"
            },
            {
                id: "daily-production",
                value: this.quoteData.production.daily,
                decimals: 1,
                suffix: " kWh"
            },
            {
                id: "monthly-savings",
                value: this.quoteData.financial.monthlySavings,
                formatter: value => `PKR ${Math.round(value).toLocaleString()}`
            },
            {
                id: "total-cost",
                value: this.quoteData.financial.systemCost,
                formatter: value => `PKR ${Math.round(value).toLocaleString()}`
            },
            {
                id: "roi-value",
                value: this.quoteData.financial.roi,
                decimals: 1,
                suffix: "%"
            },
            {
                id: "payback-value",
                value: this.quoteData.financial.paybackPeriod,
                decimals: 1,
                suffix: " years"
            }
        ];

        configs.forEach(config => {
            const element = document.getElementById(config.id);
            if (!element) {
                return;
            }

            this.countUps[config.id] = new CountUp(config.id, config.value, {
                ...countUpOptions,
                decimals: config.decimals || 0,
                formattingFn: config.formatter,
                suffix: config.suffix
            });
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
            options: {
                ...this.getChartOptions(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `${value} kWh`
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} kWh`;
                            }
                        }
                    }
                }
            }
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
            options: {
                ...this.getChartOptions(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `PKR ${Math.round(value).toLocaleString()}`
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = Math.round(context.parsed.y).toLocaleString();
                                return `${context.dataset.label}: PKR ${value}`;
                            }
                        }
                    }
                }
            }
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
