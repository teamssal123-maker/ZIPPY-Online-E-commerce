import { Router } from 'express';
import { z } from 'zod';
import {
  confirmVerification,
  forgotPassword,
  login,
  logout,
  refreshSession,
  register,
  requestVerification,
  resetPassword,
  updateProfile
} from '../services/authService.ts';
import { optionalAuth, requireAuth, type AuthedRequest } from '../middleware/auth.ts';
import { fail, ok } from '../utils/response.ts';

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await register(body);
    ok(res, result, 201);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    ok(res, await login(body.email, body.password));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
    ok(res, await logout(refreshToken, req.user?.id));
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(req.body);
    ok(res, await refreshSession(body.refreshToken));
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    ok(res, await forgotPassword(body.email));
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const body = z.object({ token: z.string().min(8), password: z.string().min(6) }).parse(req.body);
    ok(res, await resetPassword(body.token, body.password));
  } catch (err) {
    next(err);
  }
});

router.post('/verify/request', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ type: z.enum(['email', 'phone']) }).parse(req.body);
    ok(res, await requestVerification(req.user!.id, body.type));
  } catch (err) {
    next(err);
  }
});

router.post('/verify/confirm', async (req, res, next) => {
  try {
    const body = z.object({ token: z.string(), type: z.enum(['email', 'phone']) }).parse(req.body);
    ok(res, await confirmVerification(body.token, body.type));
  } catch (err) {
    next(err);
  }
});

router.get('/me', optionalAuth, (req: AuthedRequest, res) => {
  if (!req.user) {
    fail(res, 'Not authenticated.', 401);
    return;
  }
  ok(res, req.user);
});

router.patch('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      fullName: z.string().min(2).optional(),
      phone: z.string().min(8).optional(),
      savedAddresses: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            address: z.string(),
            division: z.string(),
            district: z.string(),
            phone: z.string(),
            isDefault: z.boolean()
          })
        )
        .optional()
    });
    const body = schema.parse(req.body);
    const user = await updateProfile(req.user!.id, body);
    ok(res, user);
  } catch (err) {
    next(err);
  }
});

export default router;
