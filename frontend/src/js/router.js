// src/js/router.js
import { gsap } from "gsap";
import { ReferenceInputPage } from "./components/ReferenceInputPage/ReferenceInputPage.js";
import { BillReviewPage } from "./components/BillReview/BillReviewPage.js";
import { QuoteResultPage } from "./components/QuoteResultPage.js";

export class Router {
    constructor() {
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
            }
        ];

        this.currentComponent = null;

        // Bind methods
        this.navigate = this.navigate.bind(this);

        // Add event listeners
        window.addEventListener('popstate', this.navigate);
        window.addEventListener('DOMContentLoaded', this.navigate);
    }

    navigate() {
        const path = window.location.pathname;
        console.log('Current path:', path);

        const route = this.routes.find(route => route.path === path) || this.routes[0];

        if (route) {
            console.log('Rendering route:', route.path);
            try {
                // Cleanup previous component
                if (this.currentComponent && this.currentComponent.cleanup) {
                    this.currentComponent.cleanup();
                }

                // Clear any existing GSAP animations
                gsap.killTweensOf("*");

                // Reset the app container
                const app = document.getElementById('app');
                app.style.opacity = '1';
                app.style.visibility = 'visible';

                // Render new component
                route.component();
            } catch (error) {
                console.error('Error rendering route:', error);
                this.handleRouteError();
            }
        } else {
            console.error('Route not found for path:', path);
            this.handleRouteError();
        }
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
