// src/api/client/apiConfig.js
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    TIMEOUT: 10000,
    ENDPOINTS: {
        BILL: {
            BASE: '/bill',
            ANALYZE: '/analyze',
            GET: '',
            VALIDATE: '/validate',
            HISTORY: '/history'
        },
        QUOTE: {
            BASE: '/quote',
            GENERATE: '/generate',
            GET: ''
        }
    },
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
