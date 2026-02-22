import { Router } from 'express';
import { z } from 'zod';
import { SessionService } from '../modules/auth/session.service.js';
import { UserRepository } from '../modules/users/user.repository.js';
import { AppError } from '../core/errors.js';

export function createAuthRoutes(sessionService: SessionService, userRepository: UserRepository) {
  const router = Router();

  router.post('/login', (req, res, next) => {
    try {
      const input = z.object({ userId: z.string() }).parse(req.body);
      const user = userRepository.findById(input.userId);

      if (!user) {
        throw new AppError('Usuário não encontrado para login', 404, 'NOT_FOUND');
      }

      const session = sessionService.issue(user.id, user.role);
      return res.json({ token: session.token, user: { id: user.id, role: user.role, username: user.username } });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/users', (_req, res) => {
    return res.json(userRepository.all().map((u) => ({ id: u.id, role: u.role, username: u.username })));
  });

  return router;
}
