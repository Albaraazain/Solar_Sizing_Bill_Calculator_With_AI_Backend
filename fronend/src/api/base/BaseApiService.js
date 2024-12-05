// src/api/base/BaseApiService.js
import axiosClient from '../client/axiosClient.js';
import { ErrorHandler } from '../../core/utils/ErrorHandler.js';
import { AppError } from '../../core/utils/ErrorHandler.js';

export class BaseApiService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async get(endpoint, config = {}) {
        try {
            return await axiosClient.get(`${this.baseURL}${endpoint}`, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async post(endpoint, data = {}, config = {}) {
        try {
            return await axiosClient.post(`${this.baseURL}${endpoint}`, data, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async put(endpoint, data = {}, config = {}) {
        try {
            return await axiosClient.put(`${this.baseURL}${endpoint}`, data, config);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(endpoint, config = {}) {
        try {
            return await axiosClient.delete(`${this.baseURL}${endpoint}`, config);
        } catch (error) {
            throw this.handleError(error);
        }
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
