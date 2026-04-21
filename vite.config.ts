import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:6061',
        changeOrigin: true,
      },
      '/logos': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:6061',
        changeOrigin: true,
      },
    },
  },
})
