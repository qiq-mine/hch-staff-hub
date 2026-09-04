import type { Plugin, ViteDevServer } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { handleMockRequest } = require('./mock-handler.cjs');

export function mockApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-mock-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          return handleMockRequest(req, res).catch((err: unknown) => {
            console.error('[Mock API] Error handling request:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'MOCK_ERROR', message: String(err) }));
          });
        }
        next();
      });
      console.log('✨ [Mock API] Vite dev middleware loaded: mock endpoints ready at /api/*');
    },
  };
}

export default mockApiPlugin;

