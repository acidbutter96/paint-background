import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
  // load the package directly from source during demo development
  '@devbutter/paint-background': resolve(__dirname, '../../src/index.tsx')
    }
  },
  server: { port: 5173 }
})
