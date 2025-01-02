// src/js/components/BillPreview.js
import { gsap } from "gsap";

export class BillPreview {
    constructor(billData) {
        // Log the bill data to see what we're getting
        console.log('BillPreview constructor - received bill data:', billData);

        // The billData might be nested inside a data property
        this.billData = billData.data || billData;

        // Normalize the data structure
        this.billData = this.normalizeBillData(this.billData);
    }

    normalizeBillData(data) {
        return {
            referenceNumber: data.reference_number || data.referenceNumber || '',
            customerName: data.Name || data.customerName || '',
            address: data.Address || data.address || '',
            phoneNumber: data.Phone || data.phoneNumber || '',
            unitsConsumed: Number(data['Units Consumed'] || data.unitsConsumed || 0),
            amount: Number(data['Payable Within Due Date'] || data.amount || 0),
            issueDate: data['Issue Date'] || data.issueDate || '',
            dueDate: data['Due Date'] || data.dueDate || '',
            taxRate: 17.5, // Standard tax rate for electricity bills in Pakistan
            ratePerUnit: Number(data.ratePerUnit || (data.amount / (data['Units Consumed'] || data.unitsConsumed)) || 0)
        };
    }

    calculateTaxAmount() {
        return (this.billData.amount * this.billData.taxRate) / 100;
    }

    calculateTotalAmount() {
        const taxAmount = this.calculateTaxAmount();
        return this.billData.amount + taxAmount;
    }

    formatCurrency(value = 0) {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    formatNumber(value = 0, decimals = 0) {
        return Number(value).toLocaleString('en-PK', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    render(container) {
        // Add a loading state class to the container
        container.classList.add('loading');
        
        container.innerHTML = `
            <div class="bill-preview flex h-full w-full items-center justify-center p-4">
                <div class="bill-container w-full max-w-4xl min-h-[900px] bg-white rounded-lg shadow-md p-6 flex flex-col opacity-0 transform translate-y-4">
                    <!-- Header -->
                    <div class="bill-header flex justify-between items-center mb-4">
                        <div class="text-2xl font-bold text-gray-800">MEPCO</div>
                        <div class="text-sm text-gray-600">Bill #${this.billData.referenceNumber}</div>
                    </div>
                    
                    <!-- Customer Info -->
                    <div class="bill-customer-info grid grid-cols-2 gap-8 opacity-0">
                        <div>
                            <h3 class="text-sm font-semibold uppercase text-gray-700 mb-1">Bill To</h3>
                            <p class="text-sm text-gray-600">${this.billData.customerName}</p>
                            <p class="text-sm text-gray-600">${this.billData.address}</p>
                            <p class="text-sm text-gray-600">${this.billData.phoneNumber}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold uppercase text-gray-700 mb-1">From</h3>
                            <p class="text-sm text-gray-600">Multan Electric Power Company</p>
                            <p class="text-sm text-gray-600">MEPCO Headquarters, Khanewal Road</p>
                            <p class="text-sm text-gray-600">Multan, Pakistan</p>
                        </div>
                    </div>

                    <!-- Dates -->
                    <div class="bill-dates grid grid-cols-2 gap-4 text-sm mt-6 opacity-0">
                        <p class="text-gray-600"><span class="font-medium">Issue Date:</span> ${this.billData.issueDate}</p>
                        <p class="text-gray-600"><span class="font-medium">Due Date:</span> ${this.billData.dueDate}</p>
                    </div>

                    <!-- Bill Table -->
                    <div class="bill-table overflow-x-auto mt-6 opacity-0">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th class="py-3 px-4">Description</th>
                                    <th class="py-3 px-4">Units</th>
                                    <th class="py-3 px-4">Rate</th>
                                    <th class="py-3 px-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr class="text-sm text-gray-600">
                                    <td class="py-4 px-4">Electricity Consumption</td>
                                    <td class="py-4 px-4">${this.formatNumber(this.billData.unitsConsumed)}</td>
                                    <td class="py-4 px-4">${this.formatNumber(this.billData.ratePerUnit, 2)}</td>
                                    <td class="py-4 px-4">${this.formatCurrency(this.billData.amount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Summary -->
                    <div class="bill-summary space-y-2 pt-4 border-t border-gray-200 mt-6 opacity-0">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Subtotal</span>
                            <span class="text-gray-800">${this.formatCurrency(this.billData.amount)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Tax (${this.formatNumber(this.billData.taxRate, 1)}%)</span>
                            <span class="text-gray-800">${this.formatCurrency(this.calculateTaxAmount())}</span>
                        </div>
                        <div class="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                            <span>Total Due</span>
                            <span>${this.formatCurrency(this.calculateTotalAmount())}</span>
                        </div>
                    </div>

                    <!-- Additional Notes -->
                    <div class="bill-notes mt-6 pt-4 border-t border-gray-200 opacity-0">
                        <p class="text-xs text-gray-500">
                            Please ensure payment is made before the due date to avoid any late payment charges.
                            For questions about this bill, please contact MEPCO customer service.
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Create a timeline for the animations
        const tl = gsap.timeline({
            onComplete: () => {
                container.classList.remove('loading');
                // Dispatch an event when animations are complete
                container.dispatchEvent(new CustomEvent('billPreviewReady'));
            }
        });

        // Animate each section with a staggered effect
        tl.to('.bill-container', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        })
        .to('.bill-header', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        })
        .to('.bill-customer-info', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        })
        .to('.bill-dates', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        })
        .to('.bill-table', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        })
        .to('.bill-summary', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        })
        .to('.bill-notes', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
    }

    // Method to handle transition out animation
    transitionOut(container) {
        return new Promise((resolve) => {
            const tl = gsap.timeline({
                onComplete: resolve
            });

            tl.to('.bill-notes, .bill-summary, .bill-table, .bill-dates, .bill-customer-info, .bill-header', {
                opacity: 0,
                y: -20,
                duration: 0.3,
                stagger: 0.1,
                ease: 'power2.in'
            })
            .to('.bill-container', {
                opacity: 0,
                y: -30,
                duration: 0.4,
                ease: 'power2.in'
            });
        });
    }
}
