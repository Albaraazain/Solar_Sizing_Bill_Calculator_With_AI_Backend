// path: frontend/src/api/services/billApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { API_CONFIG } from '../client/apiConfig.js';
import { AppError } from '../../core/utils/ErrorHandler.js';

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
            const response = await this.post(
                API_CONFIG.ENDPOINTS.BILL.VALIDATE,
                { reference_number: referenceNumber }
            );
            return response;
        } catch (error) {
            // Handle specific error cases
            if (error.code === 'NOT_FOUND') {
                throw new AppError(
                    'Invalid reference number. Please check and try again.',
                    'VALIDATION_ERROR'
                );
            } else if (error.code === 'VALIDATION_ERROR') {
                throw new AppError(
                    'Please enter a valid 9-digit reference number.',
                    'VALIDATION_ERROR'
                );
            }
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