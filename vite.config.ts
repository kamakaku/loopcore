// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      watch: {
        usePolling: true
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    define: {
      // Explicitly define environment variables
      'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
      'process.env.VITE_STRIPE_PRICE_FREE': JSON.stringify(env.VITE_STRIPE_PRICE_FREE),
      'process.env.VITE_STRIPE_PRICE_BASIC': JSON.stringify(env.VITE_STRIPE_PRICE_BASIC),
      'process.env.VITE_STRIPE_PRICE_PRO': JSON.stringify(env.VITE_STRIPE_PRICE_PRO),
      'process.env.VITE_STRIPE_PRICE_TEAM': JSON.stringify(env.VITE_STRIPE_PRICE_TEAM),
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    }
  };
});
