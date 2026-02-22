import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../modules/auth/auth.service.js';

export function createAuthRoutes(authService: AuthService) {
  const router = Router();

  router.post('/register', (req, res, next) => {
    try {
      const input = z.object({
        email: z.string().email(),
        username: z.string().min(3),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        password: z.string().min(6)
      }).parse(req.body);

      return res.status(201).json(authService.register(input));
    } catch (error) {
      return next(error);
    }
  });

  router.post('/login', (req, res, next) => {
    try {
      const input = z.object({ emailOrUsername: z.string().min(3), password: z.string().min(6) }).parse(req.body);
      return res.json(authService.login(input));
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
