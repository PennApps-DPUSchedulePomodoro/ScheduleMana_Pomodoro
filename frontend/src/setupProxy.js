const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/auth/google',
        createProxyMiddleware({
            target: process.env.PROXY_URL || 'http://localhost:8000/auth/google',
        })
    );
};
