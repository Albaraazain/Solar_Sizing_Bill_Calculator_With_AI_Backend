import { gsap } from "gsap";
import { OverviewView } from "./views/OverviewView.js";
import { SystemDetailsView } from "./views/SystemDetailsView.js";
import { FinancialAnalysisView } from "./views/FinancialAnalysisView.js";
import { ComponentsView } from "./views/ComponentsView.js";

export class ViewManager {
    constructor(quoteData) {
        this.quoteData = quoteData;
        this.container = null;
        this.currentView = null;
        this.views = {
            overview: new OverviewView(quoteData),
            system: new SystemDetailsView(quoteData),
            financial: new FinancialAnalysisView(quoteData),
            components: new ComponentsView(quoteData)
        };
        this.timeline = null;
    }

    initialize(container) {
        this.container = container;
        
        // Set up event listeners for navigation
        document.querySelectorAll('[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = e.currentTarget.dataset.view;
                this.switchView(viewName);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', this.handlePopState.bind(this));

        // Get initial view from URL hash or default to overview
        const initialView = window.location.hash.slice(1) || 'overview';
        this.switchView(initialView, true);
    }

    async switchView(viewName, isInitial = false) {
        if (!this.views[viewName]) {
            console.error('Invalid view name:', viewName);
            return;
        }

        // Update navigation state
        this.updateNavigation(viewName);

        // If it's the initial view, render without animation
        if (isInitial) {
            this.renderView(viewName);
            return;
        }

        // Create timeline for view transition
        this.timeline = gsap.timeline({
            defaults: {
                duration: 0.4,
                ease: 'power2.inOut'
            }
        });

        // Fade out current content
        await this.timeline.to(this.container, {
            opacity: 0,
            y: -20,
            duration: 0.3
        });

        // Render new content
        this.renderView(viewName);

        // Fade in new content
        this.timeline.fromTo(this.container, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4 }
        );
    }

    renderView(viewName) {
        // Update current view
        this.currentView = viewName;
        
        // Render the view content
        this.container.innerHTML = this.views[viewName].render();
        
        // Initialize any view-specific functionality
        if (typeof this.views[viewName].initialize === 'function') {
            this.views[viewName].initialize(this.container);
        }
    }

    updateNavigation(viewName) {
        // Update URL hash without triggering popstate
        const newUrl = `${window.location.pathname}#${viewName}`;
        window.history.pushState({ view: viewName }, '', newUrl);

        // Update active state of navigation links
        document.querySelectorAll('[data-view]').forEach(link => {
            const isActive = link.dataset.view === viewName;
            link.classList.toggle('active-nav-link', isActive);
            
            if (isActive) {
                link.classList.add('bg-emerald-50', 'text-emerald-900');
                link.classList.remove('text-gray-700');
            } else {
                link.classList.remove('bg-emerald-50', 'text-emerald-900');
                link.classList.add('text-gray-700');
            }
        });
    }

    handlePopState(event) {
        const viewName = window.location.hash.slice(1) || 'overview';
        this.switchView(viewName);
    }

    cleanup() {
        // Remove event listeners
        document.querySelectorAll('[data-view]').forEach(link => {
            link.removeEventListener('click', this.switchView);
        });
        window.removeEventListener('popstate', this.handlePopState);

        // Kill any active animations
        if (this.timeline) {
            this.timeline.kill();
        }

        // Cleanup view-specific resources
        Object.values(this.views).forEach(view => {
            if (typeof view.cleanup === 'function') {
                view.cleanup();
            }
        });
    }
} 