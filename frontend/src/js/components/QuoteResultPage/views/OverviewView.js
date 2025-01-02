import { gsap } from "gsap";
import Chart from "chart.js/auto";

export class OverviewView {
    constructor(quoteData) {
        console.log('OverviewView constructor called with quoteData:', quoteData);
        this.quoteData = quoteData;
        this.charts = {};
    }

    render() {
        console.log('OverviewView render called');
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                <!-- System Size Card -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-1">System Size</h3>
                            <p class="text-4xl font-bold text-gray-900">${this.quoteData?.systemDetails?.systemSize || '0'}<span class="text-2xl ml-1">kW</span></p>
                            <p class="text-sm text-gray-500 mt-2">DC System Size</p>
                        </div>
                        <div class="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                            <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Environmental Impact Card -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-1">CO₂ Reduction</h3>
                            <p class="text-4xl font-bold text-gray-900">${this.quoteData?.environmental?.co2Offset || '0'}<span class="text-2xl ml-1">tons</span></p>
                            <p class="text-sm text-gray-500 mt-2">Annual Carbon Offset</p>
                        </div>
                        <div class="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
                            <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats Card -->
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Efficiency</span>
                            <span class="text-gray-900 font-semibold">96%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Peak Hours</span>
                            <span class="text-gray-900 font-semibold">5.5 hrs/day</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Panels</span>
                            <span class="text-gray-900 font-semibold">${this.quoteData?.systemDetails?.panelCount || '0'} units</span>
                        </div>
                    </div>
                </div>

                <!-- Production Chart -->
                <div class="bg-white rounded-xl shadow-lg p-6 md:col-span-2 hover:shadow-xl transition-shadow duration-300">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Daily Production</h3>
                    <div class="h-[300px]">
                        <canvas id="production-chart"></canvas>
                    </div>
                </div>

                <!-- Savings Chart -->
                <div class="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-1 hover:shadow-xl transition-shadow duration-300">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Savings Timeline</h3>
                    <div class="h-[300px]">
                        <canvas id="savings-chart"></canvas>
                    </div>
                </div>

                <!-- Monthly Production Chart -->
                <div class="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3 hover:shadow-xl transition-shadow duration-300">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Production</h3>
                    <div class="h-[300px]">
                        <canvas id="monthly-production-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    initialize(container) {
        console.log('OverviewView initialize called with container:', container);
        if (!container) {
            console.error('No container provided to OverviewView initialize');
            return;
        }

        // Store container reference
        this.container = container;

        // Wait for next frame to ensure DOM is ready
        requestAnimationFrame(() => {
            try {
                // Ensure the chart canvases exist
                const productionChart = this.container.querySelector('#production-chart');
                const savingsChart = this.container.querySelector('#savings-chart');
                const monthlyChart = this.container.querySelector('#monthly-production-chart');

                if (!productionChart || !savingsChart || !monthlyChart) {
                    console.error('Chart canvases not found in container');
                    return;
                }

                this.initializeCharts();
            } catch (error) {
                console.error('Error initializing charts:', error);
            }
        });
    }

    initializeCharts() {
        console.log('Initializing charts');
        
        // Daily Production Chart
        const productionCtx = document.getElementById('production-chart');
        if (!productionCtx) {
            console.error('Production chart canvas not found');
            return;
        }

        try {
            if (this.charts.production) {
                this.charts.production.destroy();
            }

            this.charts.production = new Chart(productionCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm'],
                    datasets: [{
                        label: 'kWh Production',
                        data: [0.2, 0.8, 1.5, 1.8, 1.5, 0.8, 0.2],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            console.log('Production chart initialized');
        } catch (error) {
            console.error('Error creating production chart:', error);
        }

        // Savings Timeline Chart
        const savingsCtx = document.getElementById('savings-chart');
        if (!savingsCtx) {
            console.error('Savings chart canvas not found');
            return;
        }

        try {
            if (this.charts.savings) {
                this.charts.savings.destroy();
            }

            this.charts.savings = new Chart(savingsCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25'],
                    datasets: [{
                        label: 'Cumulative Savings (PKR)',
                        data: [
                            this.quoteData?.financial?.annualSavings || 0,
                            (this.quoteData?.financial?.annualSavings || 0) * 5,
                            (this.quoteData?.financial?.annualSavings || 0) * 10,
                            (this.quoteData?.financial?.annualSavings || 0) * 15,
                            (this.quoteData?.financial?.annualSavings || 0) * 20,
                            (this.quoteData?.financial?.annualSavings || 0) * 25
                        ],
                        backgroundColor: '#10B981',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return 'PKR ' + (value / 1000000).toFixed(1) + 'M';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            console.log('Savings chart initialized');
        } catch (error) {
            console.error('Error creating savings chart:', error);
        }

        // Monthly Production Chart
        const monthlyCtx = document.getElementById('monthly-production-chart');
        if (!monthlyCtx) {
            console.error('Monthly production chart canvas not found');
            return;
        }

        try {
            if (this.charts.monthly) {
                this.charts.monthly.destroy();
            }

            this.charts.monthly = new Chart(monthlyCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Expected Production (kWh)',
                        data: this.quoteData?.production?.monthly || Array(12).fill(0),
                        backgroundColor: '#10B981',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            console.log('Monthly production chart initialized');
        } catch (error) {
            console.error('Error creating monthly production chart:', error);
        }
    }

    cleanup() {
        console.log('Cleaning up charts');
        Object.values(this.charts).forEach(chart => {
            try {
                if (chart) {
                    chart.destroy();
                }
            } catch (error) {
                console.error('Error destroying chart:', error);
            }
        });
        this.charts = {};
    }
} 