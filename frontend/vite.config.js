// frontend/vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        cssMinify: 'lightningcss',
        outDir: 'dist',
        assetsDir: 'assets',
        // Add manifest for Django
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://95.217.113.101',
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