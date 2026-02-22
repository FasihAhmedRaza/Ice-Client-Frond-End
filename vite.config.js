import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://web-production-f43cf.up.railway.app/',
        changeOrigin: true,
        secure: false,
      },
      '/static/generated': {
        target: 'https://web-production-f43cf.up.railway.app/',
        changeOrigin: true,
        secure: false,
      },
      '/static/uploads': {
        target: 'https://web-production-f43cf.up.railway.app/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
