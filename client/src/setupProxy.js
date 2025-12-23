const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      // By default, createProxyMiddleware strips the /api when proxying
      // We need to keep it, so we don't rewrite
      pathRewrite: {
        '^/api': '/api'
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] Forwarding:', req.method, req.url, '->', `http://localhost:5000${proxyReq.path}`);
      }
    })
  );
};
