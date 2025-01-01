export class ComponentsView {
    constructor(quoteData) {
        this.quoteData = quoteData;
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- Solar Panels -->
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Solar Panels</h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Panel Image -->
                            <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <img 
                                    src="${this.quoteData?.components?.panel?.image || 'placeholder.jpg'}" 
                                    alt="Solar Panel"
                                    class="object-cover w-full h-full rounded-lg"
                                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' class=\\'h-12 w-12 text-gray-400\\' fill=\\'none\\' viewBox=\\'0 0 24 24\\' stroke=\\'currentColor\\'%3E%3Cpath stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\' /%3E%3C/svg%3E'"
                                />
                            </div>
                            <!-- Panel Details -->
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <span class="text-xl font-semibold text-gray-900">${this.quoteData?.components?.panel?.name || 'High Efficiency Solar Panel'}</span>
                                    <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        Premium
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600">${this.quoteData?.components?.panel?.description || 'High-performance solar panel with advanced technology for maximum energy conversion.'}</p>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Efficiency</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.panel?.efficiency || '21.7'}%</p>
                                    </div>
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Power Output</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.panel?.power || '400'} W</p>
                                    </div>
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Warranty</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.panel?.warranty || '25'} Years</p>
                                    </div>
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Degradation</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.panel?.degradation || '0.25'}%/year</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Inverter -->
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Inverter System</h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Inverter Image -->
                            <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <img 
                                    src="${this.quoteData?.components?.inverter?.image || 'placeholder.jpg'}" 
                                    alt="Inverter"
                                    class="object-cover w-full h-full rounded-lg"
                                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' class=\\'h-12 w-12 text-gray-400\\' fill=\\'none\\' viewBox=\\'0 0 24 24\\' stroke=\\'currentColor\\'%3E%3Cpath stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\' /%3E%3C/svg%3E'"
                                />
                            </div>
                            <!-- Inverter Details -->
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <span class="text-xl font-semibold text-gray-900">${this.quoteData?.components?.inverter?.name || 'Smart Grid Inverter'}</span>
                                    <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        Smart
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600">${this.quoteData?.components?.inverter?.description || 'Advanced inverter with smart monitoring capabilities and high efficiency conversion.'}</p>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Efficiency</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.inverter?.efficiency || '98.2'}%</p>
                                    </div>
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Power Rating</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.inverter?.power || '7.6'} kW</p>
                                    </div>
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Warranty</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.inverter?.warranty || '12'} Years</p>
                                    </div>
                                    <div class="bg-emerald-50 rounded-lg p-3">
                                        <p class="text-xs text-emerald-700 mb-1">Monitoring</p>
                                        <p class="text-sm font-semibold text-emerald-900">${this.quoteData?.components?.inverter?.monitoring || 'WiFi + App'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Components -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Components</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Mounting System -->
                        <div class="border border-gray-100 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h4 class="text-sm font-medium text-gray-900">Mounting System</h4>
                            </div>
                            <p class="text-sm text-gray-600">${this.quoteData?.components?.mounting?.description || 'Heavy-duty aluminum rails with adjustable roof attachments'}</p>
                        </div>

                        <!-- Monitoring System -->
                        <div class="border border-gray-100 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h4 class="text-sm font-medium text-gray-900">Monitoring System</h4>
                            </div>
                            <p class="text-sm text-gray-600">${this.quoteData?.components?.monitoring?.description || 'Real-time performance monitoring with mobile app integration'}</p>
                        </div>

                        <!-- Safety Equipment -->
                        <div class="border border-gray-100 rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h4 class="text-sm font-medium text-gray-900">Safety Equipment</h4>
                            </div>
                            <p class="text-sm text-gray-600">${this.quoteData?.components?.safety?.description || 'DC/AC disconnects, surge protection, and grounding equipment'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
} 