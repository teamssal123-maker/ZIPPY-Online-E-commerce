import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.ts';
import { optionalAuth } from './middleware/auth.ts';
import { errorHandler, notFound } from './middleware/errorHandler.ts';
import { rateLimit, securityHeaders } from './middleware/security.ts';
import v1Router from './routes/v1.ts';

import { loadDb } from './store/db.ts';

const STOREFRONT_PORT = Number(process.env.STOREFRONT_PORT) || 3000;

function proxyStorefront(req: express.Request, res: express.Response) {
  const headers = { ...req.headers, host: `127.0.0.1:${STOREFRONT_PORT}` };
  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: STOREFRONT_PORT,
      path: req.originalUrl,
      method: req.method,
      headers
    },
    (proxyRes) => {
      res.status(proxyRes.statusCode || 502);
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (!value || key.toLowerCase() === 'x-frame-options') continue;
        res.setHeader(key, value);
      }
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', () => {
    res
      .status(200)
      .type('html')
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zippy | Premium Men's Fashion</title>
  </head>
  <body style="font-family:Georgia,serif;background:#FDFBF7;color:#111;padding:48px;text-align:center">
    <h1>ZIPPY</h1>
    <p>Gentleman's Atelier is starting. Open the storefront on port 3000.</p>
  </body>
</html>`);
  });
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    req.pipe(proxyReq);
    return;
  }
  proxyReq.end();
}

export function createApp() {
  loadDb();
  const app = express();
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(rateLimit);
  app.use(optionalAuth);

  app.get(['/api/health', '/api/v1/health'], (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'zippy-api',
        time: new Date().toISOString()
      }
    });
  });

  app.use('/api/v1', v1Router);
  app.use('/api', v1Router);

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    proxyStorefront(req, res);
  });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
