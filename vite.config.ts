import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@body-background': '#f3f3f3',
          '@font-size-base': '15px',
          '@border-radius-base': '5px',
          '@font-family': 'Barlow, sans-serif',
          '@form-vertical-label-padding': '0',
        },
      },
    },
  },
  plugins: [react()],
});
