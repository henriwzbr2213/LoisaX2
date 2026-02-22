import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../modules/auth/auth.middleware.js';
import { ProvisioningService } from '../modules/billing/provisioning.service.js';
import { ServerService } from '../modules/servers/server.service.js';
import { AuditService } from '../modules/audit/audit.service.js';
import { AuthenticatedRequest } from '../modules/auth/auth.middleware.js';

export function createAdminRoutes(provisioningService: ProvisioningService, serverService: ServerService, auditService: AuditService) {
  const router = Router();
  router.use(requireRole('admin'));

  router.post('/provision', async (req: AuthenticatedRequest, res, next) => {
    try {
      const schema = z.object({
        customer: z.object({
          email: z.string().email(),
          username: z.string().min(3),
          firstName: z.string(),
          lastName: z.string(),
          externalId: z.string()
        }),
        plan: z.object({
          name: z.string(),
          eggId: z.number(),
          dockerImage: z.string(),
          memory: z.number(),
          cpu: z.number(),
          disk: z.number(),
          locationIds: z.array(z.number()).min(1)
        })
      });

      const input = schema.parse(req.body);
      const result = await provisioningService.onPlanPurchased({ actorId: req.actor!.id, ...input });
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.patch('/servers/:id/build', async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = z.object({ memory: z.number(), cpu: z.number(), disk: z.number() }).parse(req.body);
      await serverService.resize(req.actor!.id, 'admin', req.params.id, body);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  router.post('/servers/:identifier/power', async (req: AuthenticatedRequest, res, next) => {
    try {
      const { signal } = z.object({ signal: z.enum(['start', 'stop', 'restart']) }).parse(req.body);
      await serverService.power(req.actor!.id, 'admin', req.params.identifier, signal);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  router.get('/servers/:identifier/console', async (req: AuthenticatedRequest, res, next) => {
    try {
      const credentials = await serverService.consoleCredentials(req.actor!.id, 'admin', req.params.identifier);
      return res.json(credentials);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/servers', (req: AuthenticatedRequest, res) => {
    res.json(serverService.listForUser(req.actor!.id, 'admin'));
  });

  router.get('/audit', (_req, res) => {
    res.json(auditService.list());
  });

  return router;
}
