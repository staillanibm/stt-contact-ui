import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_USE_LOCAL_HTTPS === 'true' ? 'contact.local' : '0.0.0.0',
    port: 5173,
    // HTTPS only for local development
    ...(process.env.NODE_ENV === 'development' && process.env.VITE_USE_LOCAL_HTTPS === 'true' && {
      https: {
        key: fs.readFileSync('contact.local-key.pem'),
        cert: fs.readFileSync('contact.local.pem'),
      },
      origin: 'https://contact.local:5173',
    }),
  }
})