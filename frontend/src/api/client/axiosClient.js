// src/api/client/axiosClient.js
import axios from 'axios';
import { API_CONFIG } from './apiConfig.js';
import { eventBus } from '../../core/events/EventBus.js';
import { ErrorHandler } from '../../core/utils/ErrorHandler.js';

const getStorageItem = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn('localStorage not available:', error);
        return null;
    }
};

const axiosClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS
});

// // Request interceptor
// axiosClient.interceptors.request.use(
//     config => {
//         const token = getStorageItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     error => {
//         ErrorHandler.handle(error);
//         return Promise.reject(error);
//     }
// );

// // Response interceptor
// axiosClient.interceptors.response.use(
//     response => response.data,
//     error => {
//         const { response } = error;

//         if (response?.status === 401) {
//             eventBus.publish('auth:unauthorized');
//         }

//         ErrorHandler.handle(error);
//         return Promise.reject(error);
//     }
// );


// Add request interceptor for debugging
axiosClient.interceptors.request.use(
    config => {
        console.log('Making request:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosClient.interceptors.response.use(
    response => {
        console.log('Received response:', response);
        return response.data;
    },
    error => {
        console.error('Response error:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
