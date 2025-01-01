export const validators = {
    required: (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return true;
        return false;
    },

    minLength: (value, min) => {
        if (!value) return false;
        return value.toString().length >= min;
    },

    maxLength: (value, max) => {
        if (!value) return true;
        return value.toString().length <= max;
    },

    email: (value) => {
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    phone: (value) => {
        if (!value) return false;
        // Pakistani phone number format
        const phoneRegex = /^\+92\s?3\d{2}[-\s]?\d{7}$/;
        return phoneRegex.test(value);
    },

    referenceNumber: (value, minDigits=6) => {
        if (!value) return false;
        const digitRegex = new RegExp(`^\\d{${minDigits},}$`);
        return digitRegex.test(value);
    },

    number: (value) => {
        if (value === null || value === undefined) return false;
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    range: (value, min, max) => {
        if (!validators.number(value)) return false;
        const num = parseFloat(value);
        return num >= min && num <= max;
    }
};
