// src/js/router.js
import { gsap } from "gsap";
import { ReferenceInputPage } from "./components/ReferenceInputPage/ReferenceInputPage.js";
import { BillReviewPage } from "./components/BillReview/BillReviewPage.js";
import { QuoteResultPage } from "./components/QuoteResultPage.js";
import { LoadersShowcase } from "./components/Loaders/LoadersShowcase.js";
import { loadingManager } from "../core/loading/LoadingManager.js";
import { LoadingUI } from "../core/loading/LoadingUI.js";
import { LoaderShowcaseVanilla } from "./pages/LoaderShowcaseVanilla.js";
import { SolarLoaderDemo } from "./pages/SolarLoaderDemo.js";

export class Router {
    constructor() {
        this.TRANSITION_DURATION = 300; // milliseconds
        this.routes = [
            {
                path: "/",
                component: () => {
                    const page = new ReferenceInputPage();
                    page.render();
                }
            },
            {
                path: "/bill-review",
                component: () => {
                    const page = new BillReviewPage();
                    page.render();
                }
            },
            {
                path: "/quote",
                component: () => {
                    const page = new QuoteResultPage();
                    page.render();
                }
            },
            {
                path: "/loaders",
                component: () => {
                    const page = new LoadersShowcase();
                    page.render();
                }
            },
            {
                path: "/solar-loaders",
                component: () => {
                    const page = new LoaderShowcaseVanilla();
                    page.render();
                }
            },
            {
                path: "/solar-loader-test",
                component: () => {
                    const page = new SolarLoaderDemo();
                    page.render();
                }
            }
        ];

        this.currentComponent = null;

        // Bind methods
        this.navigate = this.navigate.bind(this);

        // Add event listeners
        window.addEventListener('popstate', this.navigate);
        window.addEventListener('DOMContentLoaded', this.navigate);
    }

    async navigate() {
        const path = window.location.pathname;
        console.log('Current path:', path);

        const route = this.routes.find(route => route.path === path) || this.routes[0];
        const loadingKey = `page_transition_${path}`;

        if (route) {
            console.log('Rendering route:', route.path);
            try {
                try {
                    // Start loading state
                    await loadingManager.startLoading(loadingKey, {
                        message: 'Loading page...',
                        isGlobal: true,
                        type: 'page'
                    });

                    // Fade out current content
                    const app = document.getElementById('app');
                    if (!app) throw new Error('App container not found');

                    await this.fadeOut(app);

                    // Cleanup previous component
                    if (this.currentComponent && this.currentComponent.cleanup) {
                        this.currentComponent.cleanup();
                    }

                    // Clear any existing GSAP animations
                    gsap.killTweensOf("*");

                    // Show loading UI
                    app.innerHTML = this.getLoadingTemplate();

                    // Simulate minimum transition time for better UX
                    await this.wait(Math.max(0, this.TRANSITION_DURATION - 100));

                    // Render new component
                    route.component();

                    // Fade in new content
                    await this.fadeIn(app);

                } catch (error) {
                    console.error('Error rendering route:', error);
                    this.handleRouteError();
                } finally {
                    // Stop loading state
                    try {
                        await loadingManager.stopLoading(loadingKey);
                    } catch (error) {
                        console.error('Error stopping loading state:', error);
                    }
                }
            } catch (error) {
                console.error('Navigation error:', error);
                this.handleRouteError();
            }
        } else {
            console.error('Route not found for path:', path);
            this.handleRouteError();
        }
    }

    getLoadingTemplate() {
        return LoadingUI.createPageLoadingTemplate('Loading...', 'bg-white');
    }

    fadeOut(element) {
        return new Promise(resolve => {
            gsap.to(element, {
                opacity: 0,
                duration: this.TRANSITION_DURATION / 1000,
                onComplete: resolve
            });
        });
    }

    fadeIn(element) {
        return new Promise(resolve => {
            gsap.fromTo(element,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: this.TRANSITION_DURATION / 1000,
                    onComplete: resolve
                }
            );
        });
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    push(path) {
        console.log('Pushing new path:', path);
        window.history.pushState(null, '', path);
        this.navigate();
    }

    handleRouteError() {
        const app = document.getElementById("app");
        if (app) {
            app.innerHTML = `
                <div class="flex items-center justify-center h-screen">
                    <div class="text-center">
                        <h2 class="text-xl font-semibold text-gray-800 mb-2">Error</h2>
                        <p class="text-gray-600">Something went wrong. Please try again.</p>
                        <button onclick="window.router.push('/')" 
                                class="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                            Go Back Home
                        </button>
                    </div>
                </div>
            `;
        }
    }
}
