import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The API_KEY is expected to be available as process.env.API_KEY.
  // The execution environment is responsible for injecting this variable.
})
