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
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }

            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }

            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }

            return 'vendor-libs';
          }
        }
      },

      onwarn(warning, warn) {
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          String(warning.message).includes('node_modules/framer-motion')
        ) {
          return;
        }

        warn(warning);
      }
    }
  }
});