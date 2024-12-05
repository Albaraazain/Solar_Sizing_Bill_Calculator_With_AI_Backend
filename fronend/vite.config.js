import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        cssMinify: 'lightningcss',
        outDir: 'dist',
        assetsDir: 'assets',
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            // Proxy API requests to Django backend
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    },
    define: {
        __VUE_PROD_DEVTOOLS__: false,
    }
});