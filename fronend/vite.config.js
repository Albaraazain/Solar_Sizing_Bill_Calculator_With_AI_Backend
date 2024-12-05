// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        cssMinify: 'lightningcss',
    },
    server: {
        port: 3000,
        open: true
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    },
    define: {
        // Add any global constants here
        __VUE_PROD_DEVTOOLS__: false,
    }
});
