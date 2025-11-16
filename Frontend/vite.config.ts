import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:44307',
        changeOrigin: true,
        secure: false,
      },
      // Proxy para webservices ASMX
      '/XmlService.asmx': {
        target: 'https://localhost:44307',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

