import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.ts';
import { findUserByEmail, findUserById, loadDb, mutateDb, publicUser, type AuthUser } from '../store/db.ts';
import type { User } from '../types/index.ts';
import { createId } from '../utils/ids.ts';
import { httpError } from '../utils/errors.ts';
import { signRefreshToken, signToken, verifyRefreshToken } from '../middleware/auth.ts';
import { writeAudit } from './audit.ts';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] || fullName, lastName: parts.slice(1).join(' ') || parts[0] || '' };
}

export function sanitizeUser(user: AuthUser): User {
  return publicUser(user);
}

function tokensFor(user: AuthUser) {
  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);
  return { token: accessToken, accessToken, refreshToken };
}

export async function persistRefreshToken(userId: string, refreshToken: string) {
  const decoded = verifyRefreshToken(refreshToken);
  await mutateDb((db) => {
    db.refreshTokens.push({
      id: createId('rtk'),
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });
    const user = db.users.find((u) => u.id === userId);
    if (user) user.lastLogin = new Date().toISOString();
    void decoded;
  });
}

export async function register(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: User; token: string; accessToken: string; refreshToken: string }> {
  const result = await mutateDb((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      httpError('An account with this email already exists.', 409);
    }
    const names = splitName(input.fullName);
    const now = new Date().toISOString();
    const user: AuthUser = {
      id: createId('usr'),
      fullName: input.fullName,
      firstName: names.firstName,
      lastName: names.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: 'CUSTOMER',
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
      createdAt: now,
      updatedAt: now,
      passwordHash: bcrypt.hashSync(input.password, config.bcryptRounds),
      savedAddresses: []
    };
    db.users.push(user);
    db.notifications.push({
      id: createId('ntf'),
      channel: 'email',
      event: 'new_customer',
      payload: { userId: user.id, email: user.email },
      createdAt: now,
      sent: false
    });
    const issued = tokensFor(user);
    db.refreshTokens.push({
      id: createId('rtk'),
      userId: user.id,
      tokenHash: hashToken(issued.refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now
    });
    return { user: publicUser(user), ...issued };
  });
  return result;
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string; accessToken: string; refreshToken: string }> {
  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    httpError('Invalid email or password.', 401);
  }
  if (user.status === 'blocked' || user.status === 'inactive') {
    httpError('Account is not active.', 403);
  }
  const issued = tokensFor(user);
  await persistRefreshToken(user.id, issued.refreshToken);
  await writeAudit({
    userId: user.id,
    action: 'login',
    module: 'auth',
    recordId: user.id
  });
  return { user: publicUser(user), ...issued };
}

export async function logout(refreshToken?: string, userId?: string) {
  await mutateDb((db) => {
    if (refreshToken) {
      const hash = hashToken(refreshToken);
      const record = db.refreshTokens.find((t) => t.tokenHash === hash && !t.revokedAt);
      if (record) record.revokedAt = new Date().toISOString();
    }
  });
  if (userId) {
    await writeAudit({ userId, action: 'logout', module: 'auth', recordId: userId });
  }
  return { loggedOut: true };
}

export async function refreshSession(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    httpError('Invalid refresh token.', 401);
  }
  const hash = hashToken(refreshToken);
  const db = loadDb();
  const stored = db.refreshTokens.find((t) => t.tokenHash === hash && t.userId === payload.sub);
  if (!stored || stored.revokedAt || Date.parse(stored.expiresAt) < Date.now()) {
    httpError('Refresh token expired or revoked.', 401);
  }
  const user = findUserById(payload.sub);
  if (!user) httpError('User not found.', 401);
  const issued = tokensFor(user);
  await mutateDb((data) => {
    const rec = data.refreshTokens.find((t) => t.tokenHash === hash);
    if (rec) rec.revokedAt = new Date().toISOString();
    data.refreshTokens.push({
      id: createId('rtk'),
      userId: user.id,
      tokenHash: hashToken(issued.refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });
  });
  return { user: publicUser(user), ...issued };
}

export async function forgotPassword(email: string) {
  const user = findUserByEmail(email);
  if (!user) {
    return { accepted: true };
  }
  const token = randomBytes(24).toString('hex');
  await mutateDb((db) => {
    db.passwordResets.push({
      id: createId('pwr'),
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  });
  return { accepted: true, resetToken: token };
}

export async function resetPassword(token: string, password: string) {
  const hash = hashToken(token);
  return mutateDb((db) => {
    const record = db.passwordResets.find((r) => r.tokenHash === hash && !r.usedAt);
    if (!record || Date.parse(record.expiresAt) < Date.now()) {
      httpError('Reset token is invalid or expired.', 400);
    }
    const user = db.users.find((u) => u.id === record.userId);
    if (!user) httpError('User not found.', 404);
    user.passwordHash = bcrypt.hashSync(password, config.bcryptRounds);
    user.updatedAt = new Date().toISOString();
    record.usedAt = new Date().toISOString();
    db.refreshTokens.forEach((t) => {
      if (t.userId === user.id && !t.revokedAt) t.revokedAt = new Date().toISOString();
    });
    return { reset: true };
  });
}

export async function requestVerification(userId: string, type: 'email' | 'phone') {
  const token = randomBytes(16).toString('hex');
  await mutateDb((db) => {
    db.verifications.push({
      id: createId('vrf'),
      userId,
      type,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  });
  return { accepted: true, verificationToken: token, type };
}

export async function confirmVerification(token: string, type: 'email' | 'phone') {
  const hash = hashToken(token);
  return mutateDb((db) => {
    const record = db.verifications.find((r) => r.tokenHash === hash && r.type === type && !r.usedAt);
    if (!record || Date.parse(record.expiresAt) < Date.now()) {
      httpError('Verification token is invalid or expired.', 400);
    }
    const user = db.users.find((u) => u.id === record.userId);
    if (!user) httpError('User not found.', 404);
    if (type === 'email') user.emailVerified = true;
    else user.phoneVerified = true;
    user.updatedAt = new Date().toISOString();
    record.usedAt = new Date().toISOString();
    return publicUser(user);
  });
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'fullName' | 'phone' | 'savedAddresses' | 'profileImage' | 'dateOfBirth' | 'gender'>>
): Promise<User | undefined> {
  return mutateDb((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return undefined;
    if (updates.fullName) {
      user.fullName = updates.fullName;
      const names = splitName(updates.fullName);
      user.firstName = names.firstName;
      user.lastName = names.lastName;
    }
    if (updates.phone) user.phone = updates.phone;
    if (updates.savedAddresses) user.savedAddresses = updates.savedAddresses;
    if (updates.profileImage) user.profileImage = updates.profileImage;
    if (updates.dateOfBirth) user.dateOfBirth = updates.dateOfBirth;
    if (updates.gender) user.gender = updates.gender;
    user.updatedAt = new Date().toISOString();
    return publicUser(user);
  });
}
