import { randomUUID } from 'node:crypto';
import { AppError, ValidationError } from '../../core/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { SessionService } from './session.service.js';
import { UserService } from '../users/user.service.js';

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService
  ) {}

  register(input: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    if (this.userRepository.findByEmail(input.email)) {
      throw new ValidationError('Email já cadastrado');
    }

    if (this.userRepository.findByUsername(input.username)) {
      throw new ValidationError('Username já cadastrado');
    }

    const role = this.userRepository.count() === 0 ? 'admin' : 'client';
    const user = this.userRepository.save({
      id: randomUUID(),
      email: input.email,
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      externalId: `local-${randomUUID()}`,
      passwordHash: UserService.hashPassword(input.password),
      featherId: 0,
      role,
      createdAt: new Date()
    });

    const session = this.sessionService.issue(user.id, user.role);
    return { token: session.token, user: { id: user.id, username: user.username, role: user.role } };
  }

  login(input: { emailOrUsername: string; password: string }) {
    const user = this.userRepository.findByEmail(input.emailOrUsername) ?? this.userRepository.findByUsername(input.emailOrUsername);

    if (!user) {
      throw new AppError('Credenciais inválidas', 401, 'UNAUTHORIZED');
    }

    const hash = UserService.hashPassword(input.password);
    if (hash !== user.passwordHash) {
      throw new AppError('Credenciais inválidas', 401, 'UNAUTHORIZED');
    }

    const session = this.sessionService.issue(user.id, user.role);
    return { token: session.token, user: { id: user.id, username: user.username, role: user.role } };
  }
}
