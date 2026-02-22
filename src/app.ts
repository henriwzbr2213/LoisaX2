import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
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
import { SessionService } from './modules/auth/session.service.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { AuthService } from './modules/auth/auth.service.js';

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
  const sessionService = new SessionService();
  const authService = new AuthService(userRepository, sessionService);

  const frontendDist = path.resolve(process.cwd(), 'frontend/dist');
  const staticDir = existsSync(frontendDist) ? frontendDist : path.resolve(process.cwd(), 'src/public');

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/', express.static(staticDir));
  app.use('/auth', createAuthRoutes(authService));
  app.use(createAuthMiddleware(userRepository, sessionService));

  app.use('/admin', createAdminRoutes(provisioningService, serverService, auditService));
  app.use('/client', createClientRoutes(serverService));

  app.get(['/login', '/register', '/panel', '/console/:identifier'], (_req, res) => {
    const indexPath = path.join(staticDir, 'index.html');
    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return res.status(404).json({ error: 'FRONTEND_NOT_BUILT', message: 'Build do frontend TSX não encontrado.' });
  });

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
