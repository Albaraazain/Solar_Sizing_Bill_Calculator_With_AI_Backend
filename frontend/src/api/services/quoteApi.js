// src/api/services/quoteApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class QuoteApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.QUOTE.BASE);
    }
    
    async generateQuote(billData) {
        try {
            console.log('Raw bill data received:', billData);
            
            // Format bill data
            const formattedData = this.formatBillData(billData);
            console.log('Formatted data before API call:', formattedData);
            
            // Log the exact request configuration
            console.log('Quote generation request config:', {
                url: `${API_CONFIG.ENDPOINTS.QUOTE.GENERATE}`,
                method: 'POST',
                data: formattedData
            });
    
            const response = await this.post(
                API_CONFIG.ENDPOINTS.QUOTE.GENERATE,
                formattedData
            );
            
            return response;
        } catch (error) {
            console.error('Error generating quote:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                fullError: error
            });
            throw error;
        }
    }

    async generatePDF(quoteData, customerInfo = {}) {
        try {
            console.log('Generating PDF for quote:', quoteData);
            
            const payload = {
                quote_data: quoteData,
                customer_info: customerInfo
            };
            
            const response = await this.post(
                API_CONFIG.ENDPOINTS.QUOTE.GENERATE_PDF,
                payload
            );
            
            return response;
        } catch (error) {
            console.error('Error generating PDF:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }
    
    async getQuoteById(quoteId) {
        try {
            const url = `${API_CONFIG.ENDPOINTS.QUOTE.GET}${quoteId}/`;
            console.log('Fetching quote:', url);
            const response = await this.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching quote:', error);
            throw error;
        }
    }

    async updateQuote(quoteId, updates) {
        try {
            const url = `${API_CONFIG.ENDPOINTS.QUOTE.BASE}${quoteId}/`;
            console.log('Updating quote:', { quoteId, updates });
            const response = await this.put(url, updates);
            return response;
        } catch (error) {
            console.error('Error updating quote:', error);
            throw error;
        }
    }

    async saveQuote(quote) {
        try {
            console.log('Saving quote:', quote);
            const response = await this.post(API_CONFIG.ENDPOINTS.QUOTE.SAVE, quote);
            return response;
        } catch (error) {
            console.error('Error saving quote:', error);
            throw error;
        }
    }

    formatBillData(billData) {
        // Handle nested data structure
        const data = billData.data || billData;
    
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
    
        // Format the bill data
        const formatted = {
            reference_number: String(data.reference_number || data.referenceNumber || '').trim(),
            units_consumed: Number(data['Units Consumed'] || data.unitsConsumed || 0),
            amount: Number(data['Payable Within Due Date'] || data.amount || 0),
            total_yearly_units: Number(data['Total Yearly Units'] || data.totalYearlyUnits || 0),
            customer_name: String(data['Name'] || data.customerName || ''),
            issue_date: formatDate(data['Issue Date'] || data.issueDate),
            due_date: formatDate(data['Due Date'] || data.dueDate)
        };
    
        // Add debug logging
        console.log('Formatted data for quote generation:', formatted);
    
        // Validate required fields
        const requiredFields = ['reference_number', 'units_consumed', 'amount', 'total_yearly_units'];
        const missingFields = requiredFields.filter(field => 
            !formatted[field] || 
            (typeof formatted[field] === 'number' && 
            (isNaN(formatted[field]) || formatted[field] <= 0))
        );
    
        if (missingFields.length > 0) {
            throw new Error(`Missing or invalid required fields: ${missingFields.join(', ')}`);
        }
    
        return formatted;
    }

}

export const quoteApi = new QuoteApi();
