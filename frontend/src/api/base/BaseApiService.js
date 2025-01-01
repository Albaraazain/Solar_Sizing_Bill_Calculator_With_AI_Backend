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
            const errorMessage = data?.error?.message || data?.message;
            const errorCode = data?.error?.code;
            
            switch (status) {
                case 400:
                    return new AppError(
                        errorMessage || 'Please check the reference number and try again',
                        errorCode || 'VALIDATION_ERROR',
                        data
                    );
                case 401:
                    return new AppError(
                        errorMessage || 'Authentication required',
                        errorCode || 'UNAUTHORIZED'
                    );
                case 404:
                    return new AppError(
                        errorMessage || 'Reference number not found',
                        errorCode || 'NOT_FOUND'
                    );
                case 500:
                    return new AppError(
                        errorMessage || 'Server error, please try again later',
                        errorCode || 'SERVER_ERROR'
                    );
                default:
                    return new AppError(
                        errorMessage || 'An unexpected error occurred',
                        errorCode || 'UNKNOWN_ERROR',
                        { originalError: error }
                    );
            }
        }
        return new AppError(
            'Unable to connect to the server. Please check your connection.',
            'NETWORK_ERROR',
            { originalError: error }
        );
    }

}
