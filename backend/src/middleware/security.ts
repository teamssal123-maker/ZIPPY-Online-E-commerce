import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/index.ts';
import { fail } from '../utils/response.ts';

const hits = new Map<string, { count: number; resetAt: number }>();

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/health' || req.path === '/api/v1/health') {
    next();
    return;
  }
  const key = `${req.ip || 'local'}:${req.path.split('/').slice(0, 4).join('/')}`;
  const now = Date.now();
  const current = hits.get(key);
  if (!current || current.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs });
    next();
    return;
  }
  current.count += 1;
  if (current.count > config.rateLimitMax) {
    fail(res, 'Too many requests. Please retry shortly.', 429);
    return;
  }
  next();
}
