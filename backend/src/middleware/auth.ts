import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.ts';
import { findUserById, publicUser, type AuthUser } from '../store/db.ts';
import { fail } from '../utils/response.ts';
import type { User } from '../types/index.ts';
import { requirePermission } from './rbac.ts';

export interface AuthPayload {
  sub: string;
  role: User['role'];
  typ?: 'access' | 'refresh';
}

export interface AuthedRequest extends Request {
  user?: User;
  authUser?: AuthUser;
  guestKey?: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role, typ: 'access' } satisfies AuthPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
}

export function signRefreshToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role, typ: 'refresh' } satisfies AuthPayload, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn
  });
}

export function verifyRefreshToken(token: string): AuthPayload {
  const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
  if (payload.typ && payload.typ !== 'refresh') {
    const err = new Error('Invalid refresh token.');
    (err as { status?: number }).status = 401;
    throw err;
  }
  return payload;
}

export { requirePermission };

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : typeof req.query.token === 'string'
      ? req.query.token
      : undefined;
  req.guestKey = typeof req.headers['x-guest-key'] === 'string' ? req.headers['x-guest-key'] : undefined;

  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    const authUser = findUserById(payload.sub);
    if (authUser) {
      req.authUser = authUser;
      req.user = publicUser(authUser);
    }
  } catch {
    // ignore invalid tokens for optional routes
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      fail(res, 'Authentication required.', 401);
      return;
    }
    next();
  });
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      fail(res, 'Admin privileges required.', 403);
      return;
    }
    next();
  });
}

export function ownerKey(req: AuthedRequest): string {
  return req.user?.id || req.guestKey || 'guest-anon';
}
