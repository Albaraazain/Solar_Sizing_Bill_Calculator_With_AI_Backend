export const formatters = {
    currency: (value, currency = 'PKR', locale = 'en-PK') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    number: (value, decimals = 0) => {
        return new Intl.NumberFormat('en', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    percentage: (value, decimals = 1) => {
        return new Intl.NumberFormat('en', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },

    date: (date, options = {}) => {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('en-PK', { ...defaultOptions, ...options });
    },

    phoneNumber: (number) => {
        if (!number) return '';

        // Remove all non-digits
        const cleaned = number.toString().replace(/\D/g, '');

        // Format for Pakistani numbers
        if (cleaned.startsWith('92')) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{7})/, '+$1 $2 $3');
        }

        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
};
