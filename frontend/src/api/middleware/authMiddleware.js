// src/api/middleware/authMiddleware.js
import { AppError } from '../../core/utils/ErrorHandler.js';
import { eventBus } from '../../core/events/EventBus.js';

export class AuthMiddleware {
    static TOKEN_KEY = 'token';
    static REFRESH_TOKEN_KEY = 'refreshToken';

    static getToken() {
        try {
            return localStorage.getItem(this.TOKEN_KEY);
        } catch (error) {
            console.warn('localStorage not available:', error);
            return null;
        }
    }

    static setToken(token, refreshToken = null) {
        try {
            localStorage.setItem(this.TOKEN_KEY, token);
            if (refreshToken) {
                localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
            }
        } catch (error) {
            console.error('Error saving token:', error);
            throw new AppError('Failed to save authentication token', 'AUTH_STORAGE_ERROR');
        }
    }

    static clearTokens() {
        try {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            console.warn('Error clearing tokens:', error);
        }
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static getAuthHeader() {
        const token = this.getToken();
        return token ? `Bearer ${token}` : null;
    }

    static handleAuthError(error) {
        if (error.response?.status === 401) {
            this.clearTokens();
            eventBus.publish('auth:unauthorized');
            throw new AppError('Authentication required', 'AUTH_REQUIRED');
        }
        throw error;
    }

    static async refreshTokenIfNeeded() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return false;
        }

        try {
            // Implementation would depend on your refresh token endpoint
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const { token, newRefreshToken } = await response.json();
            this.setToken(token, newRefreshToken);
            return true;
        } catch (error) {
            this.clearTokens();
            eventBus.publish('auth:session-expired');
            return false;
        }
    }

    static getRefreshToken() {
        try {
            return localStorage.getItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            console.warn('localStorage not available:', error);
            return null;
        }
    }
}
