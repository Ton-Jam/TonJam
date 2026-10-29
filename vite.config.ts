import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
      },
      plugins: [
        react(), 
        tailwindcss(),
      ],
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
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          'react-router',
          'react-router-dom',
          '@tonconnect/ui-react',
          '@tanstack/react-query',
          'lucide-react',
          'motion/react',
          'canvas-confetti',
          'sonner',
        ],
      },
      resolve: {
        alias: [
          { find: '@', replacement: path.resolve(__dirname, './src') },
          { find: /^react$/, replacement: path.resolve(__dirname, './node_modules/react') },
          { find: /^react-dom$/, replacement: path.resolve(__dirname, './node_modules/react-dom') },
          { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, './node_modules/react/jsx-runtime.js') },
          { find: /^react\/jsx-dev-runtime$/, replacement: path.resolve(__dirname, './node_modules/react/jsx-dev-runtime.js') },
        ],
        dedupe: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          'react-router',
          'react-router-dom',
          '@tonconnect/ui-react',
          '@tanstack/react-query'
        ]
      }
    };
});
