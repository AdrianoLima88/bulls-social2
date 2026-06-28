import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Supabase — separado pois é grande
          if (id.includes('@supabase')) return 'vendor-supabase';
          // Recharts — separado pois é muito grande
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          // Lucide icons
          if (id.includes('lucide-react')) return 'vendor-icons';
          // MUI
          if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui';
          // Radix UI
          if (id.includes('@radix-ui')) return 'vendor-radix';
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
          // Motion
          if (id.includes('node_modules/motion') || id.includes('framer-motion')) return 'vendor-motion';
          // Router
          if (id.includes('react-router')) return 'vendor-router';
          // DnD
          if (id.includes('react-dnd')) return 'vendor-dnd';
          // Forms
          if (id.includes('react-hook-form')) return 'vendor-forms';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    force: true,
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
})
