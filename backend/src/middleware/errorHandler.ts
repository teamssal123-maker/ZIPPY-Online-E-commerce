import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { fail } from '../utils/response.ts';

export function notFound(_req: Request, res: Response) {
  fail(res, 'Route not found.', 404);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    fail(
      res,
      'Validation failed.',
      422,
      err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    );
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error.';
  const status = (err as { status?: number }).status || 500;
  fail(res, message, status);
}
