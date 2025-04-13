// src/js/components/Equipment/PanelCarousel.js

export class PanelCarousel {
    constructor() {
        this.panels = [];
        this.selectedPanelId = null;
    }

    render() {
        return `
            <div class="relative w-full">
                <!-- Navigation Buttons -->
                <button class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md" id="panel-prev">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <button class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md" id="panel-next">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>

                <!-- Carousel Container -->
                <div class="overflow-hidden" id="panel-carousel">
                    <div class="flex gap-4 transition-transform duration-300 ease-out" id="panel-container">
                        ${this.renderPanelCards()}
                    </div>
                </div>
            </div>
        `;
    }

    renderPanelCards() {
        return this.panels.map(panel => `
            <div class="flex-none w-[280px]">
                <div class="bg-white rounded-lg shadow-sm p-4 border-2 transition-colors ${
                    panel.id === this.selectedPanelId ? 'border-blue-500' : 'border-transparent'
                } hover:border-blue-200 cursor-pointer" 
                data-panel-id="${panel.id}">
                    <!-- Panel Icon -->
                    <div class="w-12 h-12 mb-3 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
                            </path>
                        </svg>
                    </div>

                    <!-- Panel Details -->
                    <div class="space-y-2">
                        <div class="font-semibold">${panel.brand}</div>
                        <div class="text-sm text-gray-500">${panel.power}W</div>
                        <div class="text-sm font-medium text-blue-600">PKR ${parseFloat(panel.price).toLocaleString()}</div>
                        
                        <!-- Selection Status -->
                        <div class="mt-3 flex items-center justify-between">
                            ${panel.id === this.selectedPanelId ? `
                                <span class="text-xs font-medium text-blue-600">Selected</span>
                                <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
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
        const container = document.getElementById('panel-carousel');
        if (!container) return;

        // Navigation buttons
        const prevBtn = document.getElementById('panel-prev');
        const nextBtn = document.getElementById('panel-next');
        const cardsContainer = document.getElementById('panel-container');

        if (prevBtn && nextBtn && cardsContainer) {
            prevBtn.addEventListener('click', () => this.scroll('left'));
            nextBtn.addEventListener('click', () => this.scroll('right'));
        }

        // Panel selection
        container.addEventListener('click', (e) => {
            const panelCard = e.target.closest('[data-panel-id]');
            if (panelCard) {
                const panelId = panelCard.dataset.panelId;
                this.handlePanelSelect(panelId);
            }
        });
    }

    scroll(direction) {
        const container = document.getElementById('panel-container');
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

    handlePanelSelect(panelId) {
        this.selectedPanelId = panelId;
        // Re-render cards to update selection state
        const container = document.getElementById('panel-container');
        if (container) {
            container.innerHTML = this.renderPanelCards();
        }
        // Emit selection event
        const event = new CustomEvent('panel-selected', { 
            detail: { panelId: panelId }
        });
        document.dispatchEvent(event);
    }

    setPanels(panels) {
        this.panels = panels;
        const container = document.getElementById('panel-container');
        if (container) {
            container.innerHTML = this.renderPanelCards();
        }
    }

    setSelectedPanel(panelId) {
        this.selectedPanelId = panelId;
        const container = document.getElementById('panel-container');
        if (container) {
            container.innerHTML = this.renderPanelCards();
        }
    }

    cleanup() {
        const prevBtn = document.getElementById('panel-prev');
        const nextBtn = document.getElementById('panel-next');
        if (prevBtn) prevBtn.removeEventListener('click', () => this.scroll('left'));
        if (nextBtn) nextBtn.removeEventListener('click', () => this.scroll('right'));
    }
}