// src/api/services/billApi.js
import axios from 'axios';
import { BaseApiService } from '../base/BaseApiService.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class BillApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.BILL.BASE);
    }

    async getQuoteDetails(systemSize) {
        try {
            const payload = { systemSize };
            console.log('Sending payload for quote:', payload);  // Log the payload
            const response = await axios.post('http://localhost:8000/api/quote/get/', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Quote response:', response.data);  // Log the response data
            return response.data;
        } catch (error) {
            console.error('Error fetching quote:', error);
            throw error;
        }
    }

    async getBillDetails(referenceNumber) {
        try {
            const url = `${API_CONFIG.ENDPOINTS.BILL.GET}/${referenceNumber}`;
            console.log('Fetching bill details from URL:', url);  // Log the full URL
            const response = await this.get(url);
            console.log('Full response:', response);  // Log the full response object
            console.log('Bill details:', response.data);  // Log the response data
            return response;
        } catch (error) {
            console.error('Error fetching bill details:', error);
            throw error;
        }
    }

//    async getConsumptionHistory(referenceNumber) {
//        return this.get(`${API_CONFIG.ENDPOINTS.BILL.GET}/${referenceNumber}/history`);
//}

    async validateReferenceNumber(referenceNumber) {
        try {
            const payload = { referenceNumber };
            console.log('Sending payload:', payload);  // Log the payload
            const response = await axios.post('http://localhost:8000/api/bill/validate/', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.isValid) {
                console.log('Reference number is valid');
                console.log(response.data);
            } else {
                console.error('Reference number is invalid:', response.data.error);
            }
            return response.data;
        } catch (error) {
            console.error('Error validating reference number:', error);
            throw error;
        }
    }
    
}

export const billApi = new BillApi();