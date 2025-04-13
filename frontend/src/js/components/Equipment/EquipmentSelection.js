// src/js/components/Equipment/EquipmentSelection.js
import { PanelCarousel } from './PanelCarousel.js';
import { InverterCarousel } from './InverterCarousel.js';

export class EquipmentSelection {
    constructor() {
        this.panelCarousel = new PanelCarousel();
        this.inverterCarousel = new InverterCarousel();
        this.selectedPanelId = null;
        this.selectedInverterId = null;
    }

    async initialize(panels = [], inverters = []) {
        try {
            // Validate panel data
            if (!Array.isArray(panels)) {
                console.error('Invalid panels data:', panels);
                throw new Error('Invalid panels data format');
            }

            // Validate inverter data
            if (!Array.isArray(inverters)) {
                console.error('Invalid inverters data:', inverters);
                throw new Error('Invalid inverters data format');
            }

            // Validate required fields for panels
            const validPanels = panels.filter(p => {
                const isValid = p?.id && p?.brand && p?.power && p?.price !== undefined;
                if (!isValid) {
                    console.warn('Invalid panel data:', p);
                }
                return isValid;
            });

            // Validate required fields for inverters
            const validInverters = inverters.filter(i => {
                const isValid = i?.id && i?.brand && i?.power && i?.price !== undefined;
                if (!isValid) {
                    console.warn('Invalid inverter data:', i);
                }
                return isValid;
            });

            // Initialize panels if valid data exists
            if (validPanels.length > 0) {
                this.panelCarousel.setPanels(validPanels);
                const defaultPanel = validPanels.find(p => p.default_choice) || validPanels[0];
                if (defaultPanel) {
                    this.selectedPanelId = defaultPanel.id;
                    this.panelCarousel.setSelectedPanel(defaultPanel.id);
                }
            } else {
                console.warn('No valid panel data available');
            }

            // Initialize inverters if valid data exists
            if (validInverters.length > 0) {
                this.inverterCarousel.setInverters(validInverters);
                const firstInverter = validInverters[0];
                if (firstInverter) {
                    this.selectedInverterId = firstInverter.id;
                    this.inverterCarousel.setSelectedInverter(firstInverter.id);
                }
            } else {
                console.warn('No valid inverter data available');
            }

            return true;
        } catch (error) {
            console.error('Error initializing equipment selection:', error);
            window.toasts?.show('Failed to load equipment options', 'error');
            return false;
        }
    }

    render() {
        return `
            <div class="col-span-full mb-4">
                <div class="space-y-4">
                    <div class="bg-white rounded-lg shadow-sm p-4">
                        <h3 class="text-base sm:text-lg font-semibold mb-4">Select Solar Panel</h3>
                        ${this.panelCarousel.render()}
                    </div>
                    <div class="bg-white rounded-lg shadow-sm p-4">
                        <h3 class="text-base sm:text-lg font-semibold mb-4">Select Inverter</h3>
                        ${this.inverterCarousel.render()}
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Panel selection
        document.addEventListener('panel-selected', (e) => {
            this.selectedPanelId = e.detail.panelId;
            console.log('Selected panel:', this.selectedPanelId);
        });

        // Inverter selection
        document.addEventListener('inverter-selected', (e) => {
            this.selectedInverterId = e.detail.inverterId;
            console.log('Selected inverter:', this.selectedInverterId);
        });

        // Initialize carousel event listeners
        this.panelCarousel.attachEventListeners();
        this.inverterCarousel.attachEventListeners();
    }

    cleanup() {
        if (this.panelCarousel) this.panelCarousel.cleanup();
        if (this.inverterCarousel) this.inverterCarousel.cleanup();
        document.removeEventListener('panel-selected', () => {});
        document.removeEventListener('inverter-selected', () => {});
    }
}