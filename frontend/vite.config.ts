import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react'
          }

          if (id.includes('recharts')) {
            return 'vendor-recharts'
          }

          if (id.includes('framer-motion')) {
            return 'vendor-motion'
          }

          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query'
          }

          if (id.includes('react-router') || id.includes('history')) {
            return 'vendor-router'
          }

          if (id.includes('lucide-react') || id.includes('axios') || id.includes('react-hot-toast')) {
            return 'vendor-ui'
          }

          return 'vendor'
        },
      },
    },
  },
})
