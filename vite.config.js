import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Vite Mode:', mode);
  console.log('API URL from env:', env.VITE_API_URL || 'Not set');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      open: true,
      port: 5173,
      // Add proxy if needed for API requests
      proxy: !env.VITE_API_URL ? {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      } : undefined,
    },
    define: {
      // Make environment variables available in the app
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
  }
})
