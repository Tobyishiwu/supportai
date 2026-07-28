import type { Request } from 'express';
import { AuditLog } from '../../models/audit-log.model.js';

interface RecordAuditInput {
  req: Request;
  action: string;
  workspace?: string | null;
  actor?: string | null;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(input: RecordAuditInput): Promise<void> {
  await AuditLog.create({
    workspace: input.workspace ?? null,
    actor: input.actor ?? null,
    action: input.action,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
    ip: input.req.ip ?? null,
    userAgent: input.req.header('user-agent') ?? null,
  });
}
