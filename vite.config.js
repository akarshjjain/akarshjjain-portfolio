import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// TOGGLE THIS CONFIGURATION ACCORDING TO YOUR CURRENT DOMAIN:
// - Set to 'true' if deploying to your custom domain: https://akarshjjain.com/
// - Set to 'false' if deploying to default GitHub subdirectory: https://akarshjjain.github.io/akarshjjain-portfolio/
const isCustomDomain = true; 

export default defineConfig({
  base: isCustomDomain ? '/' : '/akarshjjain-portfolio/',

  plugins: [react()],

  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    minify: 'esbuild',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Bundle core dependencies into a single cached vendor chunk
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('@emailjs')
            ) {
              return 'vendor-core';
            }
            return 'vendor-helpers';
          }
        }
      }
    }
  },
  
  esbuild: {
    // Strip console statements and debugger calls in production for maximum script evaluation savings
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    legalComments: 'none'
  }
});