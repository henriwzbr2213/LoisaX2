import express from 'express';
import { createAuthMiddleware } from './modules/auth/auth.middleware.js';
import { UserRepository } from './modules/users/user.repository.js';
import { ServerRepository } from './modules/servers/server.repository.js';
import { AuditRepository } from './modules/audit/audit.repository.js';
import { FeatherPanelService } from './modules/featherpanel/featherpanel.service.js';
import { UserService } from './modules/users/user.service.js';
import { AuditService } from './modules/audit/audit.service.js';
import { ServerService } from './modules/servers/server.service.js';
import { ProvisioningService } from './modules/billing/provisioning.service.js';
import { createAdminRoutes } from './routes/admin.routes.js';
import { createClientRoutes } from './routes/client.routes.js';
import { AppError } from './core/errors.js';
import { logger } from './core/logger.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  const userRepository = new UserRepository();
  const serverRepository = new ServerRepository();
  const auditRepository = new AuditRepository();

  const featherPanelService = new FeatherPanelService();
  const userService = new UserService(userRepository, featherPanelService);
  const auditService = new AuditService(auditRepository);
  const serverService = new ServerService(serverRepository, userRepository, featherPanelService, auditService);
  const provisioningService = new ProvisioningService(userService, serverService, auditService);

  userService.seedAdmin({
    id: 'admin-1',
    email: 'admin@local',
    username: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    externalId: 'internal-admin',
    featherId: 1,
    role: 'admin'
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use(createAuthMiddleware(userRepository));

  app.use('/admin', createAdminRoutes(provisioningService, serverService, auditService));
  app.use('/client', createClientRoutes(serverService));

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err: error }, 'Unhandled request error');

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
        metadata: error.metadata
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Unexpected server error'
    });
  });

  return app;
}
