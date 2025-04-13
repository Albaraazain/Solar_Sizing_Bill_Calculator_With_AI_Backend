// src/api/services/equipmentApi.js
import { BaseApiService } from '../base/BaseApiService.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class EquipmentApi extends BaseApiService {
    constructor() {
        super(API_CONFIG.ENDPOINTS.EQUIPMENT.BASE);
    }

    async getPanels(filters = {}) {
        try {
            console.log('Fetching available panels');
            const queryParams = new URLSearchParams();
            if (filters.brand) queryParams.append('brand', filters.brand);
            if (filters.powerMin) queryParams.append('power_min', filters.powerMin);
            if (filters.powerMax) queryParams.append('power_max', filters.powerMax);

            // Get response and log it
            const url = `${API_CONFIG.ENDPOINTS.EQUIPMENT.PANELS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('Making panels request to:', url);
            
            const response = await this.get(url);
            console.log('Raw panels API response:', response);
            
            // Ensure we have array data
            let panelData;
            if (Array.isArray(response)) {
                console.log('Panels: Direct array response');
                panelData = response;
            } else if (response?.data && Array.isArray(response.data)) {
                console.log('Panels: Array in data property');
                panelData = response.data;
            } else if (response?.success && Array.isArray(response?.data)) {
                console.log('Panels: Array in success wrapper');
                panelData = response.data;
            } else {
                console.log('Panels: No valid array found, using empty array');
                panelData = [];
            }
            
            console.log('Final panels data:', panelData);
            return {
                success: true,
                data: panelData
            };
        } catch (error) {
            console.error('Error fetching panels:', error);
            throw error;
        }
    }

    async getInverters(filters = {}) {
        try {
            console.log('Fetching available inverters');
            const queryParams = new URLSearchParams();
            if (filters.brand) queryParams.append('brand', filters.brand);
            if (filters.powerMin) queryParams.append('power_min', filters.powerMin);
            if (filters.available !== undefined) queryParams.append('available', filters.available);

            // Get response and log it
            const url = `${API_CONFIG.ENDPOINTS.EQUIPMENT.INVERTERS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log('Making inverters request to:', url);
            
            const response = await this.get(url);
            console.log('Raw inverters API response:', response);
            
            // Ensure we have array data
            let inverterData;
            if (Array.isArray(response)) {
                console.log('Inverters: Direct array response');
                inverterData = response;
            } else if (response?.data && Array.isArray(response.data)) {
                console.log('Inverters: Array in data property');
                inverterData = response.data;
            } else if (response?.success && Array.isArray(response?.data)) {
                console.log('Inverters: Array in success wrapper');
                inverterData = response.data;
            } else {
                console.log('Inverters: No valid array found, using empty array');
                inverterData = [];
            }
            
            console.log('Final inverters data:', inverterData);
            return {
                success: true,
                data: inverterData
            };
        } catch (error) {
            console.error('Error fetching inverters:', error);
            throw error;
        }
    }
}

export const equipmentApi = new EquipmentApi();