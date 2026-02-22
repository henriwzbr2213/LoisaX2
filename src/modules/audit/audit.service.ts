import { randomUUID } from 'node:crypto';
import { AuditRepository } from './audit.repository.js';

export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  log(actorId: string, action: string, targetId: string, metadata: Record<string, unknown> = {}) {
    return this.auditRepository.add({
      id: randomUUID(),
      actorId,
      action,
      targetId,
      metadata,
      createdAt: new Date()
    });
  }

  list() {
    return this.auditRepository.all();
  }
}
