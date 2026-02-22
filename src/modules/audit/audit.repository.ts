import { AuditLog } from '../../types/domain.js';

export class AuditRepository {
  private readonly logs: AuditLog[] = [];

  add(log: AuditLog): AuditLog {
    this.logs.push(log);
    return log;
  }

  all(): AuditLog[] {
    return this.logs;
  }
}
