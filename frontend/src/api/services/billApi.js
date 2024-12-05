// path: frontend/src/api/services/billApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class BillApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.BILL.BASE);
    }

    async getBillDetails(referenceNumber) {
        try {
            const url = `${API_CONFIG.ENDPOINTS.BILL.GET}${referenceNumber}/`;
            console.log('Fetching bill details from URL:', url);
            const response = await this.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching bill details:', error);
            throw error;
        }
    }
    
    async validateReferenceNumber(referenceNumber) {
        try {
            console.log('Validating reference number:', referenceNumber);
            // Combine the validate endpoint with the base URL
            const url = API_CONFIG.ENDPOINTS.BILL.VALIDATE;
            console.log('Using endpoint:', url);
            
            const response = await this.post(url, {
                reference_number: referenceNumber
            });
            
            console.log('Validation response:', response);
            return response;
        } catch (error) {
            console.error('Error validating reference number:', error);
            throw error;
        }
        
    }
    
    async analyzeBill(referenceNumber) {
        try {
            const payload = { reference_number: referenceNumber };
            console.log('Analyzing bill:', referenceNumber);
            const response = await this.post(API_CONFIG.ENDPOINTS.BILL.ANALYZE, payload);
            return response;
        } catch (error) {
            console.error('Error analyzing bill:', error);
            throw error;
        }
    }

    async getBillHistory(referenceNumber) {
        try {
            const url = `${API_CONFIG.ENDPOINTS.BILL.HISTORY}${referenceNumber}/`;
            console.log('Fetching bill history:', url);
            const response = await this.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching bill history:', error);
            throw error;
        }
    }


}

export const billApi = new BillApi();