// src/config/environment.js
const environments = {
    development: {
        API_URL: 'http://localhost:8000/api',
        DEBUG: true,
        VERSION: '1.0.0'
    },
    production: {
        API_URL: 'http://localhost:8000/api',
        DEBUG: false,
        VERSION: '1.0.0'
    },
    test: {
        API_URL: 'http://localhost:8000/api',
        DEBUG: true,
        VERSION: 'test'
    }
};

export const ENV = {
    DEBUG: import.meta.env.MODE !== 'production',
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    VERSION: '1.0.0',
    USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true' || false,
    MOCK_CONFIG: {
        DELAY: 800,
        ERROR_RATE: 0.05,
        LATENCY_SPIKE_RATE: 0.1,
        VALIDATION_ERROR_RATE: 0.1
    }
};

// Freeze to prevent modifications
Object.freeze(ENV);
Object.freeze(ENV.MOCK_CONFIG);
