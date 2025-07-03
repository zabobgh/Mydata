import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This is the official Vite way to access environment variables in the config file.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // This makes the VITE_GEMINI_API_KEY from your .env file available as process.env.API_KEY in your client-side code.
    // This is required to align with the Gemini SDK coding guidelines while using Vite's standard environment variable system.
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    },
    build: {
      // This is to prevent a build error related to a large vendor chunk.
      // It's a common issue in Vite projects with many dependencies like 'xlsx'.
      chunkSizeWarningLimit: 1000,
    }
  }
})
