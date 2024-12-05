// src/api/mock/quoteCalculator.js
export function calculateQuoteDetails(billDetails) {
    if (!billDetails || !billDetails.unitsConsumed || !billDetails.amount) {
        console.error('Invalid bill details for calculation:', billDetails);
        throw new Error('Missing required bill data for calculations');
    }

    // System sizing calculations
    const monthlyConsumption = billDetails.unitsConsumed;
    const systemSize = (monthlyConsumption * 12) / (365 * 4.5); // kW
    const panelCount = Math.ceil(systemSize * 1000 / 400); // Assuming 400W panels

    // Financial calculations
    const estimatedSystemCost = Math.round(systemSize * 170000); // PKR 170,000 per kW
    const estimatedAnnualSavings = Math.round(billDetails.amount * 12 * 0.8);
    const estimatedDailyProduction = Math.round(systemSize * 4.5); // 4.5 kWh per kW per day
    const estimatedMonthlyProduction = estimatedDailyProduction * 30;
    const estimatedAnnualProduction = estimatedDailyProduction * 365;

    // Calculate monthly patterns
    const monthlyData = calculateMonthlyPatterns(estimatedMonthlyProduction, monthlyConsumption);

    // Calculate savings timeline
    const savingsTimeline = calculateSavingsTimeline(estimatedAnnualSavings, estimatedSystemCost);

    // Round systemSize to 2 decimal places
    const roundedSystemSize = Number(systemSize.toFixed(2));

    return {
        referenceNumber: billDetails.referenceNumber,
        systemDetails: {
            systemSize: roundedSystemSize,
            panelCount,
            panelType: "Mono-crystalline",
            inverterType: "String Inverter",
            roofArea: panelCount * 20, // sq ft
            installationTime: "3-5 days",
            warranty: "25 years"
        },
        production: {
            daily: estimatedDailyProduction,
            monthly: monthlyData,
            annual: estimatedAnnualProduction,
            peakHours: 4.5,
            performanceRatio: 0.75
        },
        financial: {
            systemCost: estimatedSystemCost,
            annualSavings: estimatedAnnualSavings,
            monthlySavings: Math.round(estimatedAnnualSavings / 12),
            paybackPeriod: Number((estimatedSystemCost / estimatedAnnualSavings).toFixed(1)),
            roi: Number(((estimatedAnnualSavings / estimatedSystemCost) * 100).toFixed(1)),
            savingsTimeline
        },
        environmental: {
            co2Offset: Number((systemSize * 1.2).toFixed(1)), // tons per year
            treesEquivalent: Math.round(systemSize * 20), // trees
            homesEquivalent: Math.round(estimatedAnnualProduction / 12000), // Assuming average home uses 12000 kWh/year
            carbonFootprintReduction: Math.round(systemSize * 1000) // kg per year
        }
    };
}

function calculateMonthlyPatterns(baseProduction, baseConsumption) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seasonalFactors = {
        winter: 0.7,  // Nov-Feb
        spring: 0.9,  // Mar-Apr
        summer: 1.2,  // May-Aug
        fall: 0.8     // Sep-Oct
    };

    return months.map((month, index) => {
        let factor;
        if (index < 2 || index === 11) factor = seasonalFactors.winter;
        else if (index < 5) factor = seasonalFactors.spring;
        else if (index < 8) factor = seasonalFactors.summer;
        else factor = seasonalFactors.fall;

        return {
            month,
            production: Math.round(baseProduction * factor),
            consumption: Math.round(baseConsumption * (0.9 + Math.random() * 0.2))
        };
    });
}

function calculateSavingsTimeline(annualSavings, systemCost) {
    return Array.from({ length: 25 }, (_, i) => ({
        year: i + 1,
        annualSavings: Math.round(annualSavings * (1 + (i * 0.05))), // 5% annual increase
        cumulativeSavings: Math.round(annualSavings * (i + 1) * (1 + (i * 0.025))) // Accounting for inflation
    }));
}
