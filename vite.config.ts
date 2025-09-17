import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use Vite's `define` feature to make the API_KEY environment variable
  // available in the client-side code as `process.env.API_KEY`.
  // Vite will perform a string replacement at build time.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
