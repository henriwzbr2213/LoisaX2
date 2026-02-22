import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../modules/auth/auth.middleware.js';
import { ServerService } from '../modules/servers/server.service.js';
import { AuthenticatedRequest } from '../modules/auth/auth.middleware.js';

export function createClientRoutes(serverService: ServerService) {
  const router = Router();
  router.use(requireRole('client'));

  router.get('/servers', (req: AuthenticatedRequest, res) => {
    res.json(serverService.listForUser(req.actor!.id, 'client'));
  });

  router.post('/servers/:identifier/power', async (req: AuthenticatedRequest, res, next) => {
    try {
      const { signal } = z.object({ signal: z.enum(['start', 'stop', 'restart']) }).parse(req.body);
      await serverService.power(req.actor!.id, 'client', req.params.identifier, signal);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  router.get('/servers/:identifier/console', async (req: AuthenticatedRequest, res, next) => {
    try {
      const credentials = await serverService.consoleCredentials(req.actor!.id, 'client', req.params.identifier);
      return res.json(credentials);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
