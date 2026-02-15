import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
