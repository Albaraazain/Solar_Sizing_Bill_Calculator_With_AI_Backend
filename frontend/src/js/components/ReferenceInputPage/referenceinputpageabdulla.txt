// src/js/components/ReferenceInputPage/ReferenceInputPage.js
import { Api } from "/src/api/index.js";

export class ReferenceInputPage {
    constructor() {
        this.state = {
            provider: '',
            referenceNumber: '',
            whatsapp: '',
            isLoading: false,
            error: null
        };

        this.injectBaseStyles();
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="main-content">
                <!-- Logo Section -->
                <div class="logo-section">
                    <img src="/src/assets/logo.svg" alt="Logo" class="logo-icon -ml-8 -mt-8" style="width: 13rem; height: 13rem;" />
                </div>

                <!-- Main Layout -->
                <div class="layout-grid">
                    <!-- Form Section -->
                    <div class="form-section">
                        <div class="form-container">
                            <h2 class="form-title">Get your quote</h2>
                            ${this.getFormTemplate()}
                        </div>
                    </div>

                    <!-- Right Content Section -->
                    <div class="right-section">
                        ${this.getRightContentTemplate()}
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    getFormTemplate() {
        return `
            <form id="quote-form" class="space-y-6">
                <!-- Provider Field -->
                <div class="form-group">
                    <label class="form-label" for="provider">
                        Choose your electricity Provider
                    </label>
                    <input 
                        type="text" 
                        id="provider"
                        class="form-input"
                        placeholder="e.g., MEPCO"
                        value="${this.state.provider}"
                        ${this.state.isLoading ? "disabled" : ""}
                    >
                </div>

                <!-- Reference Number Field -->
                <div class="form-group">
                    <label class="form-label" for="referenceNumber">
                        Enter your bill reference number
                    </label>
                    <input 
                        type="text" 
                        id="referenceNumber"
                        class="form-input"
                        placeholder="Enter reference number"
                        value="${this.state.referenceNumber}"
                        ${this.state.isLoading ? "disabled" : ""}
                    >
                </div>

                <!-- WhatsApp Field -->
                <div class="form-group">
                    <label class="form-label" for="whatsapp">
                        Enter your WhatsApp phone Number
                    </label>
                    <input 
                        type="tel" 
                        id="whatsapp"
                        class="form-input"
                        placeholder="+92 XXX XXXXXXX"
                        value="${this.state.whatsapp}"
                        ${this.state.isLoading ? "disabled" : ""}
                    >
                </div>

                <!-- Submit Button -->
                <button 
                    type="submit" 
                    class="submit-button"
                    ${this.state.isLoading ? "disabled" : ""}
                >
                    ${this.state.isLoading ?
            `<span>Processing</span>
                         <div class="spinner"></div>` :
            'Generate Quote'
        }
                </button>

                ${this.state.error ? `
                    <div class="error-message">
                        ${this.state.error}
                    </div>
                ` : ''}
            </form>
        `;
    }

    getRightContentTemplate() {
        return `
            <div class="right-content">
                <p>
                    Our AI tool quickly provides
                    <br>the ideal system size and
                    <br>savings estimate—no
                    <br>in-person consultation
                    <br>needed. Get the fastest
                    <br>solar quote in Pakistan!
                </p>
            </div>
            <div class="powered-by">
                POWERED BY AI
            </div>
        `;
    }

    injectBaseStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --color-bg: #ffffff;
                --color-fg: #1f2937;
                --color-bg-secondary: #f9fafb;
                --color-primary: #10b981;
                --color-primary-dark: #059669;
                --color-primary-light: rgba(16, 185, 129, 0.1);
            }

            .main-content {
                min-height: 100vh;
                background-color: var(--color-bg);
                position: relative;
                overflow: hidden;
            }

            .layout-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                min-height: 100vh;
            }

            .form-section {
                padding: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .form-container {
                max-width: 28rem;
                width: 100%;
            }

            .logo-section {
                position: absolute;
                top: 2rem;
                left: 3rem;
                z-index: 10;
            }

            .form-title {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--color-primary);
                margin-bottom: 1.5rem;
            }

            .form-group {
                margin-bottom: 1.5rem;
            }

            .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--color-fg);
                margin-bottom: 0.5rem;
            }

            .form-input {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                transition: border-color 0.2s;
            }

            .form-input:focus {
                border-color: var(--color-primary);
                outline: none;
                box-shadow: 0 0 0 3px var(--color-primary-light);
            }

            .submit-button {
                width: 100%;
                padding: 0.75rem 1.5rem;
                background-color: var(--color-primary);
                color: white;
                border: none;
                border-radius: 0.375rem;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .submit-button:hover:not(:disabled) {
                background-color: var(--color-primary-dark);
            }

            .submit-button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .right-section {
                background-color: var(--color-primary);
                color: white;
                padding: 2rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            .right-content {
                font-size: 1.5rem;
                line-height: 1.4;
            }

            .powered-by {
                margin-top: 2rem;
                font-size: 0.875rem;
                opacity: 0.8;
            }

            .error-message {
                margin-top: 1rem;
                padding: 0.75rem;
                background-color: #fee2e2;
                border: 1px solid #ef4444;
                border-radius: 0.375rem;
                color: #dc2626;
                font-size: 0.875rem;
            }

            .spinner {
                width: 1.25rem;
                height: 1.25rem;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .layout-grid {
                    grid-template-columns: 1fr;
                }

                .right-section {
                    display: none;
                }

                .logo-section {
                    position: relative;
                    top: 0;
                    left: 0;
                    padding: 1rem;
                }

                .form-section {
                    padding: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        const form = document.getElementById('quote-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('input', this.handleInput.bind(this));
        });

        const whatsappInput = document.getElementById('whatsapp');
        if (whatsappInput) {
            whatsappInput.addEventListener('input', this.formatPhoneNumber.bind(this));
        }
    }

    handleInput(event) {
        const { id, value } = event.target;
        this.state[id] = value;

        if (this.state.error) {
            this.setState({ error: null });
        }
    }

    formatPhoneNumber(event) {
        let input = event.target;
        let value = input.value.replace(/[^\d+]/g, '');

        if (value.startsWith('+92')) {
            if (value.length > 3) {
                value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 13);
            }
        }

        input.value = value;
        this.state.whatsapp = value;
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.state.isLoading) return;

        console.log('Api object:', Api);
        console.log('Api.bill:', Api.bill);
        console.log('MockBillApi methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(Api.bill)));

        try {
            this.setState({ isLoading: true, error: null });
            console.log('Submitting reference number:', this.state.referenceNumber);

            const response = await Api.bill.validateReferenceNumber(this.state.referenceNumber);
            console.log('Validation response:', response);

            // Check the nested data structure
            if (!response?.data?.isValid) {
                throw new Error('Invalid reference number');
            }

            // Store the reference number
            sessionStorage.setItem('currentReferenceNumber', this.state.referenceNumber);

            // Navigate to bill review
            window.router.push('/bill-review');
        } catch (error) {
            console.error('Validation error:', error);
            this.setState({
                error: error.message || 'Failed to validate reference number',
                isLoading: false
            });
        }
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateFormState();
    }

    updateFormState() {
        const form = document.getElementById('quote-form');
        if (!form) return;

        form.innerHTML = this.getFormTemplate();
        this.attachEventListeners();
    }
}





