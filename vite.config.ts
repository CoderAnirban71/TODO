import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works on Vercel, Netlify and GitHub Pages alike.
export default defineConfig({
  plugins: [react()],
  base: './',
})
