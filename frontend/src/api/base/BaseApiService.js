// src/api/base/BaseApiService.js
import axiosClient from '../client/axiosClient.js';
import { AppError } from '../../core/utils/ErrorHandler.js';
import { API_CONFIG } from '../client/apiConfig.js';

export class BaseApiService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async get(endpoint, config = {}) {
        try {
            const response = await axiosClient.get(`${this.baseURL}${endpoint}`, config);
            return this._formatResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async post(endpoint, data = {}, config = {}) {
        try {
            // Make sure there's no double slash when constructing the URL
            const url = `${this.baseURL}${endpoint}`.replace(/\/+/g, '/');
            console.log('Making POST request to:', url);
            console.log('Full URL:', `${API_CONFIG.BASE_URL}${url}`);
            console.log('Request data:', data);
            
            const response = await axiosClient.post(url, data, config);
            return this._formatResponse(response);
        } catch (error) {
            console.error('POST request failed:', error);
            throw this.handleError(error);
        }
    }


    async put(endpoint, data = {}, config = {}) {
        try {
            const response = await axiosClient.put(`${this.baseURL}${endpoint}`, data, config);
            return this._formatResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(endpoint, config = {}) {
        try {
            const response = await axiosClient.delete(`${this.baseURL}${endpoint}`, config);
            return this._formatResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    _formatResponse(response) {
        // Ensure consistent response structure
        return {
            success: true,
            data: response.data,
            status: response.status,
            headers: response.headers
        };
    }


    handleError(error) {
        const { response } = error;
        if (response) {
            const { status, data } = response;
            switch (status) {
                case 400:
                    return new AppError(data.message || 'Invalid request', 'BAD_REQUEST', data);
                case 401:
                    return new AppError('Unauthorized access', 'UNAUTHORIZED');
                case 404:
                    return new AppError('Resource not found', 'NOT_FOUND');
                case 500:
                    return new AppError('Server error', 'SERVER_ERROR');
                default:
                    return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', { originalError: error });
            }
        }
        return new AppError('Network error', 'NETWORK_ERROR', { originalError: error });
    }

}
