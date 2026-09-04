import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

import { mockApiPlugin } from './mock/vite-plugin-mock';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const enableMock = env.VITE_MOCK !== 'false';

  return {
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
      ...(enableMock ? [mockApiPlugin()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: '/',
    test: {
      setupFiles: ['./src/test/setup.ts'],
      environmentOptions: {
        jsdom: {
          url: 'http://localhost/',
        },
      },
    },
    server: {
      port: 5173,
      ...(!enableMock
        ? {
            proxy: {
              '/api': {
                target: env.VITE_PROXY_TARGET || 'http://localhost:8000',
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
  };
});
