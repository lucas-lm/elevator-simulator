import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the build works under GitHub Pages' /elevator-simulator/ subpath
  base: './',
  plugins: [react()],
})
