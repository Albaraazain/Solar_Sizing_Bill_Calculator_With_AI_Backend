// src/core/state/State.js
import { eventBus } from '../events/EventBus.js';

class State {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Map();
    }

    setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        eventBus.publish('state:change', {
            key,
            oldValue,
            newValue: value
        });

        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(listener => {
                listener(value, oldValue);
            });
        }
    }

    getState(key) {
        return this.state[key];
    }

    watch(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        return () => {
            if (this.listeners.has(key)) {
                this.listeners.get(key).delete(callback);
            }
        };
    }

    clearState() {
        this.state = {};
        this.listeners.clear();
    }
}

// Create initial application state
const initialState = {
    user: null,
    billData: null,
    quoteData: null,
    ui: {
        loading: false,
        error: null,
        currentRoute: '/'
    }
};

export const appState = new State(initialState);
