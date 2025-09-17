import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 'define' block for process.env.API_KEY has been removed.
  // We now use Vite's standard environment variable handling.
  // Environment variables prefixed with VITE_ (e.g., VITE_API_KEY)
  // are automatically exposed to the client-side code by Vite.
  // Make sure to rename API_KEY to VITE_API_KEY in your Vercel settings.
})
