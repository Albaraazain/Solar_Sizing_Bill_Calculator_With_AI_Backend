// src/api/mock/mockData.js
export const MOCK_DATA = {
    bills: {
        "123456789": {
            referenceNumber: "123456789",
            customerName: "John Doe",
            address: "123 Solar Street, Sunny City",
            phoneNumber: "+92 300 1234567",
            issueDate: "2024-03-01",
            dueDate: "2024-03-15",
            unitsConsumed: 500,
            ratePerUnit: 21.0,
            amount: 10500,    // This is the subtotal
            taxRate: 17.5,
            taxAmount: 1837.50,
            totalAmount: 12337.50,
            monthlyAverage: 450,
            previousMonthlyAverage: 430,
            peakUsage: 600,
            previousPeakUsage: 580,
            efficiency: 85,
            previousEfficiency: 82,
            consumptionHistory: [
                {month: "Oct", usage: 430},
                {month: "Nov", usage: 450},
                {month: "Dec", usage: 480},
                {month: "Jan", usage: 500},
                {month: "Feb", usage: 520},
                {month: "Mar", usage: 500}
            ]
        },
        "987654321": {
            referenceNumber: "987654321",
            customerName: "Jane Smith",
            address: "456 Energy Lane, Solar City",
            phoneNumber: "+92 300 9876543",
            issueDate: "2024-03-01",
            dueDate: "2024-03-15",
            unitsConsumed: 750,
            ratePerUnit: 21.0,
            amount: 15750,
            taxRate: 17.5,
            taxAmount: 2756.25,
            totalAmount: 18506.25,
            monthlyAverage: 700,
            previousMonthlyAverage: 680,
            peakUsage: 800,
            previousPeakUsage: 780,
            efficiency: 82,
            previousEfficiency: 80,
            consumptionHistory: [
                {month: "Oct", usage: 680},
                {month: "Nov", usage: 700},
                {month: "Dec", usage: 720},
                {month: "Jan", usage: 740},
                {month: "Feb", usage: 760},
                {month: "Mar", usage: 750}
            ]
        }
        // Add more mock bills as needed
    },

    // Add response templates for different scenarios
    responses: {
        validation: {
            success: {
                isValid: true,
                message: "Reference number is valid"
            },
            error: {
                isValid: false,
                message: "Invalid reference number format",
                errors: ["Reference number must be 9 digits"]
            }
        },
        errors: {
            network: {
                code: "NETWORK_ERROR",
                message: "Network error occurred"
            },
            validation: {
                code: "VALIDATION_ERROR",
                message: "Validation failed"
            },
            notFound: {
                code: "NOT_FOUND",
                message: "Resource not found"
            }
        },
        quote: {
            success: {
                message: "Quote generated successfully"
            },
            error: {
                message: "Failed to generate quote",
                errors: ["Invalid bill data"]
            }
        }
    },
    quotes: {
        "Q123456": {
            quoteId: "Q123456",
            referenceNumber: "123456789",
            systemSize: 5.0,
            panelCount: 14,
            estimatedProduction: 7300,
            estimatedSavings: 180000,
            cost: 850000,
            paybackPeriod: 4.7,
            roofArea: 280,
            co2Offset: 5.2,
            createdAt: "2024-03-20T10:00:00Z",
            status: "PENDING",
            details: {
                panelType: "Mono-crystalline",
                inverterType: "String Inverter",
                warranty: "25 years",
                installationTime: "3-5 days"
            }
        }
    },
}

// Helper function to generate realistic mock data
export function generateMockQuote(billData) {
    const monthlyConsumption = billData.unitsConsumed;
    const systemSize = (monthlyConsumption * 12) / (365 * 4.5);
    const panelCount = Math.ceil(systemSize * 1000 / 400);

    return {
        quoteId: `Q${Date.now().toString().slice(-6)}`,
        referenceNumber: billData.referenceNumber,
        systemSize: Math.round(systemSize * 10) / 10,
        panelCount,
        estimatedProduction: Math.round(systemSize * 1600),
        estimatedSavings: Math.round(billData.amount * 12 * 0.8),
        cost: Math.round(systemSize * 170000),
        paybackPeriod: 4.7,
        roofArea: panelCount * 20,
        co2Offset: Math.round(systemSize * 1.2 * 10) / 10,
        createdAt: new Date().toISOString(),
        status: "PENDING",
        details: {
            panelType: "Mono-crystalline",
            inverterType: "String Inverter",
            warranty: "25 years",
            installationTime: "3-5 days"
        }
    };
}
