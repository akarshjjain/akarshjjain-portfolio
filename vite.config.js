import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/akarshjjain-portfolio/',

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