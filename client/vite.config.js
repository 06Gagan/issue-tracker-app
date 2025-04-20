import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // Use the React plugin
})