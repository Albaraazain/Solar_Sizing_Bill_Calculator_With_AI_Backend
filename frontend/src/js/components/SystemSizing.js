import { gsap } from "gsap";
import ProgressBar from "progressbar.js";
import Chart from "chart.js/auto";
import { CountUp } from "countup.js";
import { Api } from "/src/api/index.js";

export class SystemSizing {
    constructor(billData) {
        this.billData = billData;
        this.charts = {};
        this.progressBar = null;
        this.countUps = {};
    }

    render(container) {
        container.innerHTML = `
            <div id="system-sizing" class="w-full h-full overflow-y-auto px-4 py-6 space-y-4">
                <h2 class="text-2xl font-bold text-gray-800">Solar System Dashboard</h2>
                
                <!-- Top Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${this.renderSystemSizeCard()}
                    ${this.renderEstimatedCostCard()}
                    ${this.renderPaybackPeriodCard()}
                </div>

                <!-- Energy Production Section -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">Energy Production</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        ${this.renderEnergyProductionStat("Daily", "daily-production-value", "kWh")}
                        ${this.renderEnergyProductionStat("Monthly", "monthly-production-value", "kWh")}
                        ${this.renderEnergyProductionStat("Annual", "annual-production-value", "kWh")}
                        ${this.renderEnergyProductionStat("Coverage", "coverage-percentage-value", "%")}
                    </div>
                    <div class="h-64 md:h-80">
                        <canvas id="energy-production-chart"></canvas>
                    </div>
                </div>

                <!-- System Details Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    ${this.renderSystemDetailsCards()}
                </div>
            </div>
        `;

        this.attachStyles();
        this.initializeComponents();
    }

    renderSystemSizeCard() {
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="text-lg font-semibold mb-3 text-gray-800">System Size</h3>
                <div class="flex items-center justify-between">
                    <div class="w-16 h-16" id="system-size-progress"></div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-gray-900">
                            <span id="system-size-value">0</span>
                        </p>
                        <p class="text-sm text-gray-500">kW</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderEstimatedCostCard() {
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="text-lg font-semibold mb-3 text-gray-800">Estimated Cost</h3>
                <div class="flex justify-between items-start mb-4">
                    <p class="text-2xl font-bold text-gray-900">PKR <span id="estimated-cost-value">0</span></p>
                    <div class="text-sm">
                        <p class="text-gray-600">Before incentives</p>
                        <p class="text-green-600 font-medium">-PKR ${this.calculateIncentives()} in incentives</p>
                    </div>
                </div>
                <div class="h-32">
                    <canvas id="cost-breakdown-chart"></canvas>
                </div>
            </div>
        `;
    }

    renderPaybackPeriodCard() {
        return `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="text-lg font-semibold mb-3 text-gray-800">Payback Period</h3>
                <div class="flex justify-between items-start mb-4">
                    <p class="text-2xl font-bold text-gray-900"><span id="payback-period-value">0</span> years</p>
                    <div class="text-sm">
                        <p class="text-gray-600">Annual Savings</p>
                        <p class="text-green-600 font-medium">PKR <span id="annual-savings-value">0</span></p>
                    </div>
                </div>
                <div class="h-32">
                    <canvas id="payback-period-chart"></canvas>
                </div>
            </div>
        `;
    }

    renderEnergyProductionStat(label, id, unit) {
        return `
            <div class="bg-gray-50 rounded p-3">
                <p class="text-sm text-gray-600">${label}</p>
                <p class="text-lg font-semibold text-gray-900">
                    <span id="${id}">0</span> ${unit}
                </p>
            </div>
        `;
    }

    renderSystemDetailsCards() {
        const cards = [
            { title: "Number of Panels", id: "number-of-panels-value", unit: "", icon: "solar-panel" },
            { title: "Panel Wattage", id: "panel-wattage-value", unit: "W", icon: "lightning-bolt" },
            { title: "CO2 Offset", id: "co2-offset-value", unit: "tons/year", icon: "leaf" },
            { title: "Roof Area", id: "roof-area-value", unit: "sq ft", icon: "home" },
            { title: "Total Savings", id: "total-savings-value", unit: "$/25yr", icon: "piggy-bank" },
            { title: "Warranty", id: "warranty-period", unit: "years", icon: "shield-check", value: "25" }
        ];

        return cards.map(card => this.renderDetailCard(card)).join('');
    }

    renderDetailCard({ title, id, unit, icon, value }) {
        return `
            <div class="bg-white rounded-lg p-3 shadow-sm">
                <div class="flex items-start gap-3">
                    ${this.getIcon(icon)}
                    <div>
                        <p class="text-sm text-gray-600">${title}</p>
                        <p class="text-lg font-semibold text-gray-900">
                            <span id="${id}">${value || '0'}</span> ${unit}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    initializeComponents() {
        requestAnimationFrame(() => {
            this.initCharts();
            this.initProgressBars();
            this.initCounters();
            this.startAnimations();
        });
    }

    initCharts() {
        this.initEnergyProductionChart();
        this.initCostBreakdownChart();
        this.initPaybackPeriodChart();
    }

    initEnergyProductionChart() {
        const ctx = document.getElementById('energy-production-chart');
        if (!ctx) return;

        const monthlyData = this.generateMonthlyData();
        const isMobile = window.innerWidth < 768;

        this.charts.energyProduction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Production',
                        data: monthlyData.production,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: isMobile ? 2 : 4,
                        pointHoverRadius: isMobile ? 4 : 6,
                        borderWidth: isMobile ? 1.5 : 2,
                    },
                    {
                        label: 'Consumption',
                        data: monthlyData.consumption,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: isMobile ? 2 : 4,
                        pointHoverRadius: isMobile ? 4 : 6,
                        borderWidth: isMobile ? 1.5 : 2,
                    }
                ]
            },
            options: this.getChartOptions()
        });
    }

    initCostBreakdownChart() {
        const ctx = document.getElementById('cost-breakdown-chart');
        if (!ctx) return;

        const data = this.prepareCostBreakdownData();

        this.charts.costBreakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    initPaybackPeriodChart() {
        const ctx = document.getElementById('payback-period-chart');
        if (!ctx) return;

        const data = this.preparePaybackData();

        this.charts.paybackPeriod = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.years,
                datasets: [
                    {
                        label: 'Cumulative Savings',
                        data: data.savings,
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    },
                    {
                        label: 'System Cost',
                        data: data.cost,
                        borderColor: 'rgb(239, 68, 68)',
                        borderDash: [5, 5]
                    }
                ]
            },
            options: this.getChartOptions('currency')
        });
    }

    initProgressBars() {
        const systemSizeProgress = document.getElementById('system-size-progress');
        if (!systemSizeProgress) return;

        this.progressBar = new ProgressBar.Circle(systemSizeProgress, {
            color: '#3B82F6',
            trailColor: '#E5E7EB',
            trailWidth: 4,
            duration: 2000,
            strokeWidth: 8,
            easing: 'easeInOut'
        });

        this.progressBar.animate(0.75);
    }

    initCounters() {
        const countUpOptions = {
            duration: 2,
            useEasing: true,
            useGrouping: true,
            separator: ','
        };

        this.countUps = {
            systemSize: new CountUp('system-size-value', this.billData.recommendedSystemSize, {
                ...countUpOptions,
                decimals: 2
            }),
            estimatedCost: new CountUp('estimated-cost-value', this.billData.estimatedSystemCost, {
                ...countUpOptions,
                prefix: 'PKR '
            }),
            // ... more counters
        };
    }

    startAnimations() {
        const cards = document.querySelectorAll('#system-sizing > div');

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
                    this.startCounters();
                }
            }
        );
    }

    // Utility methods
    getChartOptions(type = 'default') {
        const isMobile = window.innerWidth < 768;

        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: isMobile ? 10 : 12
                        }
                    }
                }
            }
        };

        if (type === 'currency') {
            return {
                ...baseOptions,
                scales: {
                    y: {
                        ticks: {
                            callback: value => `PKR ${value.toLocaleString()}`
                        }
                    }
                }
            };
        }

        return baseOptions;
    }

    generateMonthlyData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
            labels: months,
            production: months.map(() => Math.round(Math.random() * 1000)),
            consumption: months.map(() => Math.round(Math.random() * 800))
        };
    }

    prepareCostBreakdownData() {
        return {
            labels: ['Equipment', 'Installation', 'Other'],
            values: [60, 30, 10].map(percent =>
                (this.billData.estimatedSystemCost * (percent / 100))
            )
        };
    }

    preparePaybackData() {
        const years = Array.from({ length: 25 }, (_, i) => `Year ${i + 1}`);
        const annualSavings = this.billData.estimatedAnnualSavings;

        return {
            years,
            savings: years.map((_, i) => annualSavings * (i + 1)),
            cost: Array(25).fill(this.billData.estimatedSystemCost)
        };
    }

    calculateIncentives() {
        return Math.round(this.billData.estimatedSystemCost * 0.3);
    }

    cleanup() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        if (this.progressBar) {
            this.progressBar.destroy();
        }

        Object.values(this.countUps).forEach(counter => {
            if (counter) counter.reset();
        });

        gsap.killTweensOf("*");
    }

    attachStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #system-sizing {
                scrollbar-width: thin;
                scrollbar-color: rgba(0,0,0,0.2) transparent;
            }

            #system-sizing::-webkit-scrollbar {
                width: 6px;
            }

            #system-sizing::-webkit-scrollbar-track {
                background: transparent;
            }

            #system-sizing::-webkit-scrollbar-thumb {
                background-color: rgba(0,0,0,0.2);
                border-radius: 3px;
            }

            @media (max-width: 640px) {
                #system-sizing .text-2xl {
                    font-size: 1.25rem;
                }
                #system-sizing .text-lg {
                    font-size: 1rem;
                }
                #system-sizing .p-4 {
                    padding: 0.75rem;
                }
                #system-sizing .gap-4 {
                    gap: 0.75rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
