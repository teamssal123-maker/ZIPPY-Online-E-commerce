import { createId } from '../utils/ids.ts';
import { mutateDb, type DbShape } from '../store/db.ts';
import type { AuditLog } from '../types/cms.ts';

export function appendAudit(db: DbShape, input: Omit<AuditLog, 'id' | 'createdAt'> & { createdAt?: string }) {
  const entry: AuditLog = {
    id: createId('aud'),
    createdAt: input.createdAt || new Date().toISOString(),
    userId: input.userId,
    action: input.action,
    module: input.module,
    recordId: input.recordId,
    oldValue: input.oldValue,
    newValue: input.newValue,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 2000) db.auditLogs.length = 2000;
  return entry;
}

export async function writeAudit(input: Omit<AuditLog, 'id' | 'createdAt'> & { createdAt?: string }) {
  return mutateDb((db) => appendAudit(db, input));
}
