const { handleMockRequest } = require('./mock-handler.cjs');

function mockApiPlugin() {
  return {
    name: 'vite-plugin-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          return handleMockRequest(req, res).catch((err) => {
            console.error('[Mock API] Error handling request:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'MOCK_ERROR', message: String(err) }));
          });
        }
        next();
      });
      console.log('✨ [Vite] Mock API Plugin active: intercepting all /api/* calls');
    },
  };
}

module.exports = mockApiPlugin;
