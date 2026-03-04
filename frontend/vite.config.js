import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    sourcemap: true,
    // Divide el bundle en chunks cacheables independientemente
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React + router en su propio chunk — cambia raramente, se cachea largo tiempo
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
          // El resto de node_modules en un chunk vendor genérico
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
