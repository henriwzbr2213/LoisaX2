import { UserService } from '../users/user.service.js';
import { ServerService } from '../servers/server.service.js';
import { AuditService } from '../audit/audit.service.js';

export class ProvisioningService {
  constructor(
    private readonly userService: UserService,
    private readonly serverService: ServerService,
    private readonly auditService: AuditService
  ) {}

  async onPlanPurchased(input: {
    actorId: string;
    customer: {
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      externalId: string;
    };
    plan: {
      name: string;
      eggId: number;
      dockerImage: string;
      memory: number;
      cpu: number;
      disk: number;
      locationIds: number[];
    };
  }) {
    const user = await this.userService.createClient(input.customer);

    const server = await this.serverService.provision({
      actorId: input.actorId,
      userId: user.id,
      name: input.plan.name,
      eggId: input.plan.eggId,
      dockerImage: input.plan.dockerImage,
      memory: input.plan.memory,
      cpu: input.plan.cpu,
      disk: input.plan.disk,
      locationIds: input.plan.locationIds
    });

    this.auditService.log(input.actorId, 'plan.purchase.provisioned', server.id, {
      externalId: user.externalId,
      featherUserId: user.featherId
    });

    return { user, server };
  }
}
