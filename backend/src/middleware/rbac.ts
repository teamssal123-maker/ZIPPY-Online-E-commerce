import type { NextFunction, Response } from 'express';
import { loadDb } from '../store/db.ts';
import { fail } from '../utils/response.ts';
import type { AuthedRequest } from './auth.ts';

export function userPermissions(userId?: string): string[] {
  if (!userId) return [];
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return [];
  if (user.role === 'ADMIN' && (!user.roleId || user.adminRole === 'super_admin')) {
    return ['*'];
  }
  const role = db.roles.find((r) => r.id === user.roleId || r.name === user.adminRole);
  return role?.permissions || (user.role === 'ADMIN' ? ['*'] : []);
}

export function hasPermission(userId: string | undefined, permission: string): boolean {
  const perms = userPermissions(userId);
  return perms.includes('*') || perms.includes(permission);
}

export function requirePermission(...permissions: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      fail(res, 'Admin privileges required.', 403);
      return;
    }
    if (permissions.length === 0 || permissions.some((p) => hasPermission(req.user?.id, p))) {
      next();
      return;
    }
    fail(res, 'Insufficient permissions.', 403);
  };
}
