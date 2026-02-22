import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../core/errors.js';
import { UserRepository } from '../users/user.repository.js';

export type AuthenticatedRequest = Request & {
  actor?: { id: string; role: 'admin' | 'client' };
};

export function createAuthMiddleware(userRepository: UserRepository) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const userId = req.header('x-user-id');

    if (!userId) {
      return next(new AppError('Missing x-user-id header', 401, 'UNAUTHORIZED'));
    }

    const user = userRepository.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 401, 'UNAUTHORIZED'));
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
