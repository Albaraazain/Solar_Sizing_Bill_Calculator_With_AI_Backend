export class SystemDetailsView {
    constructor(quoteData) {
        this.quoteData = quoteData;
    }
    
    render() {
        return `
            <div class="space-y-6">
                <!-- System Specifications -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">System Specifications</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">System Size</span>
                                    <span class="text-sm text-emerald-900 font-semibold">${this.quoteData?.systemDetails?.systemSize || 0} kW</span>
                                </div>
                            </div>
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">Panel Type</span>
                                    <span class="text-sm text-emerald-900 font-semibold">${this.quoteData?.systemDetails?.panelType || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">Inverter Type</span>
                                    <span class="text-sm text-emerald-900 font-semibold">${this.quoteData?.systemDetails?.inverterType || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">Number of Panels</span>
                                    <span class="text-sm text-emerald-900 font-semibold">${this.quoteData?.systemDetails?.numberOfPanels || 0}</span>
                                </div>
                            </div>
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">Roof Space Required</span>
                                    <span class="text-sm text-emerald-900 font-semibold">${this.quoteData?.systemDetails?.roofSpace || 0} m²</span>
                                </div>
                            </div>
                            <div class="bg-emerald-50 rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-emerald-700 font-medium">System Efficiency</span>
                                    <span class="text-sm text-emerald-900 font-semibold">${this.quoteData?.systemDetails?.efficiency || 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Technical Details -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
                    <div class="space-y-6">
                        <!-- Panel Details -->
                        <div class="border border-gray-100 rounded-lg p-4">
                            <h4 class="text-sm font-medium text-gray-700 mb-3">Solar Panel Specifications</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-xs text-gray-500">Power Rating</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.panelPowerRating || 0} W</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Warranty</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.panelWarranty || 0} years</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Dimensions</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.panelDimensions || 'N/A'}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Efficiency</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.panelEfficiency || 0}%</p>
                                </div>
                            </div>
                        </div>

                        <!-- Inverter Details -->
                        <div class="border border-gray-100 rounded-lg p-4">
                            <h4 class="text-sm font-medium text-gray-700 mb-3">Inverter Specifications</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-xs text-gray-500">Power Rating</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.inverterPowerRating || 0} kW</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Warranty</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.inverterWarranty || 0} years</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Efficiency</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.inverterEfficiency || 0}%</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Features</p>
                                    <p class="text-sm font-medium text-gray-900">${this.quoteData?.systemDetails?.inverterFeatures || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Installation Details -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Installation Details</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm font-medium text-emerald-900">Installation Time</span>
                            </div>
                            <p class="text-sm text-emerald-700">${this.quoteData?.installation?.estimatedTime || '2-3'} days</p>
                        </div>
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span class="text-sm font-medium text-emerald-900">Warranty</span>
                            </div>
                            <p class="text-sm text-emerald-700">${this.quoteData?.installation?.warranty || '10'} years workmanship</p>
                        </div>
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span class="text-sm font-medium text-emerald-900">Power Output</span>
                            </div>
                            <p class="text-sm text-emerald-700">${this.quoteData?.installation?.guaranteedOutput || '90'}% guaranteed</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
} 