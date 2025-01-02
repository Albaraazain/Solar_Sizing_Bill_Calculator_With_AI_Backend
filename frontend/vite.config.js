// frontend/vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        cssMinify: 'lightningcss',
        outDir: 'dist',
        assetsDir: 'static',
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: undefined,
                assetFileNames: 'static/[name]-[hash][extname]',
                chunkFileNames: 'static/[name]-[hash].js',
                entryFileNames: 'static/[name]-[hash].js',
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
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