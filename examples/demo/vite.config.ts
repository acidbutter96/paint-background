/// <reference types="node" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // consume the compiled bundle from dist for the demo
      '@devbutter/paint-background': resolve(__dirname, '../../dist/index.mjs'),
    },
  },
  server: { port: 5173 }
})
