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
            const billResponse = await Api.bill.getBillDetails(referenceNumber);
            if (!billResponse || !billResponse.data || !billResponse.data.data) {
                throw new Error('Failed to get bill details');
            }

            // Generate quote using bill details
            const quoteResponse = await Api.quote.generateQuote(billResponse.data.data);
            if (!quoteResponse || !quoteResponse.data) {
                throw new Error('Failed to generate quote');
            }

            this.quoteData = quoteResponse.data;
            console.log('Quote generated:', this.quoteData);

            return true;
        } catch (error) {
            console.error('Failed to initialize QuoteResultPage:', error);
            window.toasts?.show('Failed to generate quote', 'error');
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
                <div class="h-full w-full flex flex-col p-2 sm:p-4 lg:p-8">
                    <!-- Header -->
                    <div class="flex-none mb-3 sm:mb-4 lg:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div>
                            <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Solar System Quote</h1>
                            <p class="text-xs sm:text-sm lg:text-base text-gray-500">Based on your consumption analysis</p>
                        </div>
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

                    <!-- Main Content Area -->
                    <div class="flex-1 min-h-0 relative">
                        <div class="absolute inset-0 overflow-auto hide-scrollbar">
                            <div class="h-full max-w-[1136px] mx-auto pb-4 sm:pb-6">
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

    renderEnvironmentalImpact() {
        return `
            <div class="bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 text-white">
                <h3 class="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Environmental Impact</h3>
                <div class="flex-1 flex flex-col justify-center">
                    <div class="mb-4 sm:mb-6">
                        <div class="text-xs sm:text-sm opacity-80 mb-1">CO₂ Offset</div>
                        <div class="text-xl sm:text-3xl font-bold" id="co2-value">0</div>
                        <div class="w-full bg-white/20 h-1.5 sm:h-2 rounded-full mt-2">
                            <div class="bg-white h-full rounded-full" style="width: 75%"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <div class="text-xs sm:text-sm opacity-80">Trees Equivalent</div>
                            <div class="text-lg sm:text-2xl font-bold" id="trees-value">0</div>
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm opacity-80">Energy for Homes</div>
                            <div class="text-lg sm:text-2xl font-bold" id="homes-value">0</div>
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
        };

        const configs = [
            {
                id: "system-size-value",
                value: this.quoteData.systemDetails.systemSize,
                decimals: 2
            },
            {
                id: "daily-production",
                value: this.quoteData.production.daily,
                decimals: 1
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
                id: "co2-value",
                value: this.quoteData.environmental.co2Offset,
                decimals: 1,
                suffix: " tons/year"
            },
            {
                id: "trees-value",
                value: this.quoteData.environmental.treesEquivalent,
                decimals: 0
            },
            {
                id: "homes-value",
                value: this.quoteData.environmental.homesEquivalent,
                decimals: 0
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
