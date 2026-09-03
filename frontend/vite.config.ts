import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // The browser never talks to Vite directly — it goes through nginx over
    // TLS on 443. Without this the HMR client would try to reach the dev
    // server on ws://localhost:5173 and silently fail to reconnect.
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      clientPort: 443,
    },
  },
})
