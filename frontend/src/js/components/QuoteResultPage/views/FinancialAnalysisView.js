export class FinancialAnalysisView {
    constructor(quoteData) {
        this.quoteData = quoteData;
        this.charts = {};
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- Cost Breakdown -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <p class="text-sm text-emerald-700 mb-1">System Cost</p>
                            <p class="text-2xl font-semibold text-emerald-900">PKR ${this.formatNumber(this.quoteData?.financial?.systemCost || 0)}</p>
                            <p class="text-xs text-emerald-600 mt-1">Before incentives</p>
                        </div>
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <p class="text-sm text-emerald-700 mb-1">Tax Credit</p>
                            <p class="text-2xl font-semibold text-emerald-900">PKR ${this.formatNumber(this.quoteData?.financial?.taxCredit || 0)}</p>
                            <p class="text-xs text-emerald-600 mt-1">30% federal tax credit</p>
                        </div>
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <p class="text-sm text-emerald-700 mb-1">Net Cost</p>
                            <p class="text-2xl font-semibold text-emerald-900">PKR ${this.formatNumber(this.quoteData?.financial?.netCost || 0)}</p>
                            <p class="text-xs text-emerald-600 mt-1">After incentives</p>
                        </div>
                    </div>
                </div>

                <!-- Savings Analysis -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Savings Analysis</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">Monthly Savings</span>
                                    <span class="text-sm text-emerald-900 font-semibold">PKR ${this.formatNumber(this.quoteData?.financial?.monthlySavings || 0)}</span>
                                </div>
                            </div>
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">Annual Savings</span>
                                    <span class="text-sm text-emerald-900 font-semibold">PKR ${this.formatNumber(this.quoteData?.financial?.annualSavings || 0)}</span>
                                </div>
                            </div>
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">25-Year Savings</span>
                                    <span class="text-sm text-emerald-900 font-semibold">PKR ${this.formatNumber(this.quoteData?.financial?.lifetimeSavings || 0)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="h-64">
                            <canvas id="savings-projection-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- ROI Analysis -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Return on Investment</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-sm font-medium text-emerald-900">Payback Period</span>
                            </div>
                            <p class="text-2xl font-semibold text-emerald-900">${this.quoteData?.financial?.paybackPeriod || 0}<span class="text-sm font-normal text-emerald-700 ml-1">years</span></p>
                        </div>
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm font-medium text-emerald-900">ROI</span>
                            </div>
                            <p class="text-2xl font-semibold text-emerald-900">${this.quoteData?.financial?.roi || 0}<span class="text-sm font-normal text-emerald-700 ml-1">%</span></p>
                        </div>
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span class="text-sm font-medium text-emerald-900">IRR</span>
                            </div>
                            <p class="text-2xl font-semibold text-emerald-900">${this.quoteData?.financial?.irr || 0}<span class="text-sm font-normal text-emerald-700 ml-1">%</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    initializeCharts() {
        const ctx = document.getElementById('savings-projection-chart');
        if (!ctx) return;

        this.charts.savingsProjection = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 25}, (_, i) => `Year ${i + 1}`),
                datasets: [{
                    label: 'Cumulative Savings',
                    data: this.quoteData?.financial?.savingsTimeline || [],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
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
                        ticks: {
                            callback: value => `PKR ${this.formatNumber(value)}`
                        }
                    }
                }
            }
        });
    }

    cleanup() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
    }
} 