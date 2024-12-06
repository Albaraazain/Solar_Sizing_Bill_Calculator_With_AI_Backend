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
            
            if (!referenceNumber) {
                throw new AppError('Please enter a reference number', 'VALIDATION_ERROR');
            }
    
            const response = await this.post(
                API_CONFIG.ENDPOINTS.BILL.VALIDATE,
                { reference_number: referenceNumber }
            );
    
            // Handle explicit error response from server
            if (!response.success && response.error) {
                throw new AppError(
                    response.error.message || 'Invalid reference number',
                    response.error.code || 'VALIDATION_ERROR'
                );
            }
    
            return response;
    
        } catch (error) {
            // Handle axios error response
            if (error.response?.data?.error) {
                throw new AppError(
                    error.response.data.error.message || 'Invalid reference number',
                    error.response.data.error.code || 'VALIDATION_ERROR'
                );
            }
            // Handle other errors
            throw new AppError(
                error.message || 'Failed to validate reference number',
                error.code || 'VALIDATION_ERROR'
            );
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