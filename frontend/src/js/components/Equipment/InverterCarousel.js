// src/js/components/Equipment/InverterCarousel.js

export class InverterCarousel {
    constructor() {
        this.inverters = [];
        this.selectedInverterId = null;
    }

    render() {
        return `
            <div class="relative w-full">
                <!-- Navigation Buttons -->
                <button class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md" id="inverter-prev">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <button class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md" id="inverter-next">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>

                <!-- Carousel Container -->
                <div class="overflow-hidden" id="inverter-carousel">
                    <div class="flex gap-4 transition-transform duration-300 ease-out" id="inverter-container">
                        ${this.renderInverterCards()}
                    </div>
                </div>
            </div>
        `;
    }

    renderInverterCards() {
        return this.inverters.map(inverter => `
            <div class="flex-none w-[280px]">
                <div class="bg-white rounded-lg shadow-sm p-4 border-2 transition-colors ${
                    inverter.id === this.selectedInverterId ? 'border-green-500' : 'border-transparent'
                } hover:border-green-200 cursor-pointer" 
                data-inverter-id="${inverter.id}">
                    <!-- Inverter Icon -->
                    <div class="w-12 h-12 mb-3 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M13 10V3L4 14h7v7l9-11h-7z">
                            </path>
                        </svg>
                    </div>

                    <!-- Inverter Details -->
                    <div class="space-y-2">
                        <div class="font-semibold">${inverter.brand}</div>
                        <div class="text-sm text-gray-500">${inverter.power}kW</div>
                        <div class="text-sm font-medium text-green-600">PKR ${parseFloat(inverter.price).toLocaleString()}</div>
                        
                        <!-- Selection Status -->
                        <div class="mt-3 flex items-center justify-between">
                            ${inverter.id === this.selectedInverterId ? `
                                <span class="text-xs font-medium text-green-600">Selected</span>
                                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                            ` : `
                                <span class="text-xs text-gray-500">Click to select</span>
                                <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd"></path>
                                </svg>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        const container = document.getElementById('inverter-carousel');
        if (!container) return;

        // Navigation buttons
        const prevBtn = document.getElementById('inverter-prev');
        const nextBtn = document.getElementById('inverter-next');
        const cardsContainer = document.getElementById('inverter-container');

        if (prevBtn && nextBtn && cardsContainer) {
            prevBtn.addEventListener('click', () => this.scroll('left'));
            nextBtn.addEventListener('click', () => this.scroll('right'));
        }

        // Inverter selection
        container.addEventListener('click', (e) => {
            const inverterCard = e.target.closest('[data-inverter-id]');
            if (inverterCard) {
                const inverterId = inverterCard.dataset.inverterId;
                this.handleInverterSelect(inverterId);
            }
        });
    }

    scroll(direction) {
        const container = document.getElementById('inverter-container');
        if (!container) return;

        const scrollAmount = 300;
        const currentScroll = container.scrollLeft;
        const targetScroll = direction === 'left' 
            ? currentScroll - scrollAmount 
            : currentScroll + scrollAmount;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    handleInverterSelect(inverterId) {
        this.selectedInverterId = inverterId;
        // Re-render cards to update selection state
        const container = document.getElementById('inverter-container');
        if (container) {
            container.innerHTML = this.renderInverterCards();
        }
        // Emit selection event
        const event = new CustomEvent('inverter-selected', { 
            detail: { inverterId: inverterId }
        });
        document.dispatchEvent(event);
    }

    setInverters(inverters) {
        this.inverters = inverters;
        const container = document.getElementById('inverter-container');
        if (container) {
            container.innerHTML = this.renderInverterCards();
        }
    }

    setSelectedInverter(inverterId) {
        this.selectedInverterId = inverterId;
        const container = document.getElementById('inverter-container');
        if (container) {
            container.innerHTML = this.renderInverterCards();
        }
    }

    cleanup() {
        const prevBtn = document.getElementById('inverter-prev');
        const nextBtn = document.getElementById('inverter-next');
        if (prevBtn) prevBtn.removeEventListener('click', () => this.scroll('left'));
        if (nextBtn) nextBtn.removeEventListener('click', () => this.scroll('right'));
    }
}