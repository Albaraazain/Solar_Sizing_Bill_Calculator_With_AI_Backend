export class Toasts {
    constructor() {
        this.container = this.createContainer();
        document.body.appendChild(this.container);
        this.addStyles();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        return container;
    }

    show(message, type = 'info') {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });

        // Auto-remove after delay
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `
            min-w-[300px] max-w-[500px] p-4 rounded-lg shadow-lg 
            transform transition-all duration-300 ease-out
            translate-x-full opacity-0 flex items-center gap-3
            ${this.getTypeStyles(type)}
        `;

        toast.innerHTML = `
            ${this.getIcon(type)}
            <p class="text-sm font-medium flex-1">${message}</p>
            <button class="text-current opacity-70 hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;

        // Add click handler to close button
        const closeButton = toast.querySelector('button');
        closeButton.addEventListener('click', () => this.removeToast(toast));

        return toast;
    }

    removeToast(toast) {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
        }, 300);
    }

    getTypeStyles(type) {
        const styles = {
            success: 'bg-emerald-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-amber-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        return styles[type] || styles.info;
    }

    getIcon(type) {
        const icons = {
            success: `
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            `,
            error: `
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            `,
            warning: `
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            `,
            info: `
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            `
        };
        return icons[type] || icons.info;
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toast-enter {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes toast-leave {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            .toast-enter {
                animation: toast-enter 0.3s ease-out;
            }

            .toast-leave {
                animation: toast-leave 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
}
