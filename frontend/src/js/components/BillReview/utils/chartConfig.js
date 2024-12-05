export function initializeConsumptionChart(ctx, data, isMobile) {
    const isTablet = window.innerWidth < 1024;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Consumption (kWh)',
                data: data.values,
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: isMobile ? 2 : isTablet ? 3 : 4,
                pointHoverRadius: isMobile ? 4 : isTablet ? 5 : 6,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#059669',
                pointBorderWidth: isMobile ? 1 : 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'white',
                    titleColor: '#1f2937',
                    bodyColor: '#4b5563',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: isMobile ? 8 : 12,
                    titleFont: {
                        size: isMobile ? 12 : 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: isMobile ? 11 : 13
                    },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toLocaleString()} kWh`;
                        }
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
                            size: isMobile ? 10 : isTablet ? 11 : 12
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
                            size: isMobile ? 10 : isTablet ? 11 : 12
                        },
                        callback: function(value) {
                            return `${value} kWh`;
                        }
                    }
                }
            }
        }
    });
}
