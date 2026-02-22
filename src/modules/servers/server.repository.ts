import { Server } from '../../types/domain.js';

export class ServerRepository {
  private readonly servers = new Map<string, Server>();

  save(server: Server): Server {
    this.servers.set(server.id, server);
    return server;
  }

  findById(id: string): Server | undefined {
    return this.servers.get(id);
  }

  findByFeatherIdentifier(featherIdentifier: string): Server | undefined {
    return [...this.servers.values()].find((server) => server.featherIdentifier === featherIdentifier);
  }

  findByUserId(userId: string): Server[] {
    return [...this.servers.values()].filter((server) => server.userId === userId);
  }

  all(): Server[] {
    return [...this.servers.values()];
  }
}
