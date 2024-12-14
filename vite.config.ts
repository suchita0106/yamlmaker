import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: process.env.VITE_SERVER_IP || 'localhost', // Listen on all interfaces
    port: 5173,      // Optional: set a specific port
  },
  plugins: [react()],
})
