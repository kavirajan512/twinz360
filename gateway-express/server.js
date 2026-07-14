const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

console.log('🚀 AeroTwin API Gateway initializing...');

// Proxy AI and Feasibility requests to Python FastAPI (Port 8000)
app.use(
  createProxyMiddleware({
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    logLevel: 'debug',
    pathFilter: '/api'
  })
);

app.use(
  createProxyMiddleware({
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    pathFilter: '/media'
  })
);

// Fallback/Health route
app.get('/', (req, res) => {
  res.send({ status: 'Gateway is running', target: 'http://127.0.0.1:8000' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ API Gateway proxying traffic on http://127.0.0.1:${PORT}`);
});
