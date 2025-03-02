// path: frontend/src/api/client/apiConfig.js
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    TIMEOUT: 60000,
    ENDPOINTS: {
        BILL: {
            BASE: '/bill',
            ANALYZE: '/analyze/',          // Added trailing slash
            GET: '/details/',              // Added trailing slash
            VALIDATE: '/validate/',        // Added trailing slash
            HISTORY: '/history/'           // Added trailing slash
        },
        QUOTE: {
            BASE: '/quote',
            GENERATE: '/generate/',
            GET: '/details/',
            SAVE: '/save/'
        },
        AUTH: {
            LOGIN: '/auth/login/',              // Added auth endpoints
            REFRESH: '/auth/refresh/'
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
