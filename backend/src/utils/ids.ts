import { randomBytes, randomInt } from 'node:crypto';

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
}

export function createOrderNumber(year = new Date().getFullYear()): string {
  return `RM-${year}-${randomInt(1000, 10000)}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, '');
}
