import { randomUUID } from 'node:crypto';

export type Session = {
  token: string;
  userId: string;
  role: 'admin' | 'client';
  createdAt: Date;
};

export class SessionService {
  private readonly sessions = new Map<string, Session>();

  issue(userId: string, role: 'admin' | 'client') {
    const token = randomUUID();
    const session: Session = { token, userId, role, createdAt: new Date() };
    this.sessions.set(token, session);
    return session;
  }

  resolve(token: string) {
    return this.sessions.get(token);
  }
}
