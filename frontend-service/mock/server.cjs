const http = require('node:http');
const { handleMockRequest } = require('./mock-handler.cjs');

const PORT = process.env.MOCK_PORT || 8000;
const HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
  handleMockRequest(req, res).catch((err) => {
    console.error('Mock server internal error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'MOCK_INTERNAL_ERROR', message: String(err) }));
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [Mock API Service] running on http://${HOST}:${PORT}`);
  console.log(`👉 All /api/* endpoints are ready for frontend-service`);
  console.log(`======================================================\n`);
});

