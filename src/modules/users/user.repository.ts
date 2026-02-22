import { User } from '../../types/domain.js';

export class UserRepository {
  private readonly users = new Map<string, User>();

  save(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findByExternalId(externalId: string): User | undefined {
    return [...this.users.values()].find((user) => user.externalId === externalId);
  }

  all(): User[] {
    return [...this.users.values()];
  }
}
