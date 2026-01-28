import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      include: [/xlsx/, /node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['xlsx'],
    exclude: []
  },
  server: {
    host: true
  },
  css: {
    postcss: './postcss.config.js'
  }
})