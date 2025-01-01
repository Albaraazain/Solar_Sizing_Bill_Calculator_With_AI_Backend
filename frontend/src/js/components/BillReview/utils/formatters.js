export function formatCurrency(value) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

export function formatChange(value) {
    return Number(value).toFixed(1);
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function calculateDueDays(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = Math.abs(due - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
