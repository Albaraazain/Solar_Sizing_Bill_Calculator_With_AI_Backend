// src/js/utils/QuoteUtils.js

export class QuoteValidator {
    static validateBillData(data) {
        const required = [
            'reference_number',
            'units_consumed',
            'amount',
            'total_yearly_units'
        ];
        
        const errors = [];
        
        required.forEach(field => {
            // Check for existence
            if (data[field] === undefined || data[field] === null) {
                errors.push(`${field} is missing`);
                return;
            }

            // Validate number fields
            if (['units_consumed', 'amount', 'total_yearly_units'].includes(field)) {
                const value = Number(data[field]);
                if (isNaN(value) || value <= 0) {
                    errors.push(`${field} must be a positive number`);
                }
            }

            // Validate string fields
            if (field === 'reference_number') {
                const value = String(data[field]).trim();
                if (!value) {
                    errors.push(`${field} cannot be empty`);
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static isValidQuoteResponse(response) {
        return (
            response &&
            response.success &&
            response.data &&
            response.data.quoteId &&
            response.data.systemDetails &&
            response.data.financial &&
            response.data.production
        );
    }
}

export class QuoteDataTransformer {
    static formatBillDataForQuote(billData, referenceNumber) {
        // Format dates to ISO format
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toISOString().split('T')[0];
            } catch (e) {
                console.error('Date parsing error:', e);
                return dateStr;
            }
        };

        return {
            reference_number: String(referenceNumber || '').trim(),
            units_consumed: Number(billData['Units Consumed'] || billData.unitsConsumed || 0),
            amount: Number(billData['Payable Within Due Date'] || billData.amount || 0),
            total_yearly_units: this.calculateYearlyUnits(billData),
            customer_name: String(billData['Name'] || billData.customerName || ''),
            issue_date: formatDate(billData['Issue Date'] || billData.issueDate),
            due_date: formatDate(billData['Due Date'] || billData.dueDate)
        };
    }

    static calculateYearlyUnits(billData) {
        // First try to get total_yearly_units directly
        if (billData.totalYearlyUnits) {
            return Number(billData.totalYearlyUnits);
        }

        // If Monthly Units data is available, sum it up
        if (billData.monthlyUnits && typeof billData.monthlyUnits === 'object') {
            const monthlyTotal = Object.values(billData.monthlyUnits)
                .reduce((sum, value) => sum + Number(value || 0), 0);
            if (monthlyTotal > 0) {
                return monthlyTotal;
            }
        }

        // Fallback: estimate based on current month's consumption
        return Number(billData.unitsConsumed) * 12;
    }
}

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.isValidation = true;
    }
}

export class QuoteError extends Error {
    constructor(message, type = 'GENERAL') {
        super(message);
        this.name = 'QuoteError';
        this.type = type;
    }
}