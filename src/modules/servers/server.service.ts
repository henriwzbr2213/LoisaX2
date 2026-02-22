import { randomUUID } from 'node:crypto';
import { OwnershipError } from '../../core/errors.js';
import { ServerRepository } from './server.repository.js';
import { FeatherPanelService } from '../featherpanel/featherpanel.service.js';
import { UserRepository } from '../users/user.repository.js';
import { AuditService } from '../audit/audit.service.js';

export class ServerService {
  constructor(
    private readonly serverRepository: ServerRepository,
    private readonly userRepository: UserRepository,
    private readonly featherPanelService: FeatherPanelService,
    private readonly auditService: AuditService
  ) {}

  async provision(input: {
    actorId: string;
    userId: string;
    name: string;
    eggId: number;
    dockerImage: string;
    memory: number;
    cpu: number;
    disk: number;
    locationIds: number[];
  }) {
    const user = this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('Target user not found');
    }

    const created = await this.featherPanelService.createServer({
      name: input.name,
      user: user.featherId,
      egg: input.eggId,
      docker_image: input.dockerImage,
      limits: { memory: input.memory, swap: 0, disk: input.disk, io: 500, cpu: input.cpu },
      feature_limits: { databases: 1, allocations: 1, backups: 1 },
      environment: { SERVER_JARFILE: 'server.jar' },
      deploy: { locations: input.locationIds, dedicated_ip: false, port_range: [] }
    });

    const saved = this.serverRepository.save({
      id: randomUUID(),
      userId: user.id,
      featherId: created.attributes.id,
      featherIdentifier: created.attributes.identifier,
      nodeId: created.attributes.node,
      locationId: input.locationIds[0],
      eggId: input.eggId,
      memory: input.memory,
      cpu: input.cpu,
      disk: input.disk,
      status: 'installing',
      createdAt: new Date()
    });

    this.auditService.log(input.actorId, 'server.provisioned', saved.id, { featherId: saved.featherId });
    return saved;
  }

  listForUser(actorId: string, role: 'admin' | 'client') {
    return role === 'admin' ? this.serverRepository.all() : this.serverRepository.findByUserId(actorId);
  }

  private assertOwnership(actorId: string, role: 'admin' | 'client', featherIdentifier: string) {
    const server = this.serverRepository.findByFeatherIdentifier(featherIdentifier);
    if (!server) {
      throw new Error('Server not found');
    }

    if (role !== 'admin' && server.userId !== actorId) {
      throw new OwnershipError();
    }

    return server;
  }

  async power(actorId: string, role: 'admin' | 'client', featherIdentifier: string, signal: 'start' | 'stop' | 'restart') {
    const server = this.assertOwnership(actorId, role, featherIdentifier);
    await this.featherPanelService.power(featherIdentifier, signal);
    this.auditService.log(actorId, `server.power.${signal}`, server.id, { featherIdentifier });
  }

  async resize(actorId: string, role: 'admin' | 'client', serverId: string, limits: { memory: number; cpu: number; disk: number }) {
    const server = this.serverRepository.findById(serverId);
    if (!server) {
      throw new Error('Server not found');
    }

    if (role !== 'admin' && server.userId !== actorId) {
      throw new OwnershipError('Only admins can resize or owner can request');
    }

    await this.featherPanelService.updateBuild(server.featherId, limits);
    this.serverRepository.save({ ...server, ...limits });
    this.auditService.log(actorId, 'server.resized', server.id, limits);
  }

  async consoleCredentials(actorId: string, role: 'admin' | 'client', featherIdentifier: string) {
    this.assertOwnership(actorId, role, featherIdentifier);
    return this.featherPanelService.getConsoleCredentials(featherIdentifier);
  }
}
