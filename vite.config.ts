import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Required for Docker
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true // Required for Docker on some systems
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  envPrefix: 'VITE_' // Ensure Vite recognizes our env variables
});