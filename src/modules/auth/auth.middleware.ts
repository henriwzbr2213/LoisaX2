import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../core/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { SessionService } from './session.service.js';

export type AuthenticatedRequest = Request & {
  actor?: { id: string; role: 'admin' | 'client' };
};

export function createAuthMiddleware(userRepository: UserRepository, sessionService: SessionService) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (token) {
      const session = sessionService.resolve(token);
      if (!session) {
        return next(new AppError('Sessão inválida ou expirada', 401, 'UNAUTHORIZED'));
      }

      req.actor = { id: session.userId, role: session.role };
      return next();
    }

    const userId = req.header('x-user-id');
    if (!userId) {
      return next(new AppError('Não autenticado. Faça login em /auth/login ou envie Authorization Bearer token.', 401, 'UNAUTHORIZED'));
    }

    const user = userRepository.findById(userId);
    if (!user) {
      return next(new AppError('Usuário não encontrado', 401, 'UNAUTHORIZED'));
    }

    req.actor = { id: user.id, role: user.role };
    return next();
  };
}

export function requireRole(role: 'admin' | 'client') {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (req.actor?.role !== role) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    return next();
  };
}
