import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      // PNG: comprimir manteniendo SIEMPRE la transparencia (alpha)
      png: { quality: 80, compressionLevel: 8 },
      // JPG / JPEG: comprimir y aplanar con fondo blanco (nunca negro)
      jpg:  { quality: 82, progressive: true, background: { r: 255, g: 255, b: 255, alpha: 1 } },
      jpeg: { quality: 82, progressive: true, background: { r: 255, g: 255, b: 255, alpha: 1 } },
      // WebP
      webp: { quality: 82 },
      logStats: true,
    }),
  ],
})
