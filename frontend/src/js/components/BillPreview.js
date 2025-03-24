// src/js/components/BillPreview.js
import { gsap } from "gsap";

export class BillPreview {
    constructor(billData) {
        // Log the bill data to see what we're getting
        console.log('BillPreview constructor - received bill data:', billData);

        // The billData might be nested inside a data property
        this.billData = billData.data || billData;
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
        // Log the actual data being used
        console.log('BillPreview render - using bill data:', this.billData);

        // Access the nested data structure properly
        const billData = this.billData;

        container.innerHTML = `
            <div class="flex h-full w-full items-center justify-center p-2 sm:p-4">
                <div class="w-full max-w-4xl min-h-[900px] bg-white rounded-lg shadow-md p-3 sm:p-6 flex flex-col">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-3 sm:mb-4">
                        <div class="text-xl sm:text-2xl font-bold text-gray-800">MEPCO</div>
                        <div class="text-xs sm:text-sm text-gray-600">Bill #${billData.referenceNumber}</div>
                    </div>
                    
                    <!-- Bill Details -->
                    <div class="space-y-4 sm:space-y-6">
                        <!-- Customer Info -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                            <div>
                                <h3 class="text-sm font-semibold uppercase text-gray-700 mb-1">Bill To</h3>
                                <p class="text-sm text-gray-600">${billData.customerName}</p>
                                <p class="text-sm text-gray-600">${billData.address}</p>
                                <p class="text-sm text-gray-600">${billData.phoneNumber}</p>
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold uppercase text-gray-700 mb-1">From</h3>
                                <p class="text-sm text-gray-600">Multan Electric Power Company</p>
                                <p class="text-sm text-gray-600">MEPCO Headquarters, Khanewal Road</p>
                                <p class="text-sm text-gray-600">Multan, Pakistan</p>
                            </div>
                        </div>

                        <!-- Dates -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <p class="text-gray-600"><span class="font-medium">Issue Date:</span> ${billData.issueDate}</p>
                            <p class="text-gray-600"><span class="font-medium">Due Date:</span> ${billData.dueDate}</p>
                        </div>

                        <!-- Bill Table -->
                        <div class="overflow-x-auto -mx-3 sm:mx-0">
                            <div class="inline-block min-w-full align-middle">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <th class="py-2 sm:py-3 px-2 sm:px-4">Description</th>
                                            <th class="py-2 sm:py-3 px-2 sm:px-4">Units</th>
                                            <th class="py-2 sm:py-3 px-2 sm:px-4">Rate</th>
                                            <th class="py-2 sm:py-3 px-2 sm:px-4">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr class="text-xs sm:text-sm text-gray-600">
                                            <td class="py-3 sm:py-4 px-2 sm:px-4">Electricity Consumption</td>
                                            <td class="py-3 sm:py-4 px-2 sm:px-4">${this.formatNumber(billData.unitsConsumed)}</td>
                                            <td class="py-3 sm:py-4 px-2 sm:px-4">${this.formatNumber(billData.ratePerUnit, 2)}</td>
                                            <td class="py-3 sm:py-4 px-2 sm:px-4">${this.formatCurrency(billData.amount)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Summary -->
                        <div class="space-y-2 pt-4 border-t border-gray-200">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Subtotal</span>
                                <span class="text-gray-800">${this.formatCurrency(billData.amount)}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Tax (${this.formatNumber(billData.taxRate, 1)}%)</span>
                                <span class="text-gray-800">${this.formatCurrency(billData.taxAmount)}</span>
                            </div>
                            <div class="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                                <span>Total Due</span>
                                <span>${this.formatCurrency(billData.totalAmount)}</span>
                            </div>

                            <!-- Additional Notes -->
                            <div class="mt-6 pt-4 border-t border-gray-200">
                                <p class="text-xs text-gray-500">
                                    Please ensure payment is made before the due date to avoid any late payment charges.
                                    For questions about this bill, please contact MEPCO customer service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            const billPreview = container.querySelector('.bill-preview');
            if (billPreview) {
                gsap.from(billPreview, {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        });
    }
}
