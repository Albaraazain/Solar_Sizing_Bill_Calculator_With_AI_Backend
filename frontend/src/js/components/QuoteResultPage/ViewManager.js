import { SystemDetailsView } from './views/SystemDetailsView.js';
import { FinancialAnalysisView } from './views/FinancialAnalysisView.js';
import { ComponentsView } from './views/ComponentsView.js';

export class ViewManager {
    constructor(quoteData) {
        this.quoteData = quoteData;
        this.currentView = null;
        this.contentContainer = null;
        this.views = {
            system: new SystemDetailsView(quoteData),
            financial: new FinancialAnalysisView(quoteData),
            components: new ComponentsView(quoteData)
        };
    }

    initialize(contentContainer) {
        this.contentContainer = contentContainer;
        this.setupEventListeners();
        
        // Set initial view based on hash or default to overview
        const hash = window.location.hash.slice(1) || 'overview';
        this.navigateToView(hash);
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.querySelectorAll('[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.dataset.view;
                this.navigateToView(view);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const view = window.location.hash.slice(1) || 'overview';
            this.navigateToView(view, false);
        });
    }

    navigateToView(viewName, updateHistory = true) {
        // Clean up current view if exists
        if (this.currentView?.cleanup) {
            this.currentView.cleanup();
        }

        // Update active states
        document.querySelectorAll('[data-view]').forEach(link => {
            const isActive = link.dataset.view === viewName;
            link.classList.toggle('bg-gradient-to-r', isActive);
            link.classList.toggle('from-emerald-50', isActive);
            link.classList.toggle('to-emerald-50/50', isActive);
            link.classList.toggle('text-emerald-700', isActive);
            link.classList.toggle('border', isActive);
            link.classList.toggle('border-emerald-100/50', isActive);
            link.classList.toggle('text-gray-700', !isActive);
            link.classList.toggle('hover:bg-gray-50', !isActive);
            link.classList.toggle('hover:text-gray-900', !isActive);

            // Update icon background
            const iconContainer = link.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.classList.toggle('bg-emerald-600/10', isActive);
                iconContainer.classList.toggle('bg-gray-100', !isActive);
                iconContainer.classList.toggle('text-emerald-600', isActive);
                iconContainer.classList.toggle('text-gray-500', !isActive);
                iconContainer.classList.toggle('group-hover:bg-gray-200/70', !isActive);
                iconContainer.classList.toggle('group-hover:text-gray-900', !isActive);
            }
        });

        // Update URL if needed
        if (updateHistory) {
            window.history.pushState(null, '', `#${viewName}`);
        }

        // Render new view
        let view;
        switch (viewName) {
            case 'system':
                view = this.views.system;
                break;
            case 'financial':
                view = this.views.financial;
                break;
            case 'components':
                view = this.views.components;
                break;
            default:
                view = this.views.system; // Default to system view
        }

        this.currentView = view;
        this.contentContainer.innerHTML = view.render();

        // Initialize any components in the new view
        if (view.initializeCharts) {
            requestAnimationFrame(() => {
                view.initializeCharts();
            });
        }
    }

    cleanup() {
        if (this.currentView?.cleanup) {
            this.currentView.cleanup();
        }
        document.querySelectorAll('[data-view]').forEach(link => {
            link.removeEventListener('click', this.navigateToView);
        });
        window.removeEventListener('popstate', this.navigateToView);
    }
} 