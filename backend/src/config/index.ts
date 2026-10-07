import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'richman-atelier-dev-secret',
  jwtExpiresIn: '7d',
  jwtRefreshExpiresIn: '30d',
  dataFile: process.env.DATA_FILE || path.resolve(__dirname, '../../data/store.json'),
  bcryptRounds: 10,
  freeShippingThreshold: 3000,
  shippingInsideDhaka: 80,
  shippingOutsideDhaka: 150,
  corsOrigin: process.env.CORS_ORIGIN || true,
  maxUploadBytes: 8 * 1024 * 1024,
  rateLimitWindowMs: 60_000,
  rateLimitMax: 180,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  aiProvider: (process.env.AI_PROVIDER as 'gemini' | 'openai' | 'mock') || 'gemini',
  aiModel: process.env.AI_MODEL || 'gemini-3.1-pro'
} as const;
