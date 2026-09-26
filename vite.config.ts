import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      logLevel: 'silent',
      build: {
        target: 'esnext',
        minify: false,
        sourcemap: false,
        cssCodeSplit: true,
        rollupOptions: {
          maxParallelFileOps: 1,
          cache: false,
        }
      },
      define: {
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
          'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
          'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
        },
        dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom']
      }
    };
});
