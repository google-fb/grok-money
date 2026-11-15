import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs so the built demo can be served from any sub-path.
  base: './',
  plugins: [react(), tailwindcss()],
})
