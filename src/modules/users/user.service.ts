import { createHash, randomUUID } from 'node:crypto';
import { FeatherPanelService } from '../featherpanel/featherpanel.service.js';
import { UserRepository } from './user.repository.js';
import { User } from '../../types/domain.js';
import { ValidationError } from '../../core/errors.js';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly featherPanelService: FeatherPanelService
  ) {}

  static hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  async createClient(input: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    externalId: string;
    passwordHash?: string;
  }): Promise<User> {
    if (this.userRepository.findByExternalId(input.externalId)) {
      throw new ValidationError('External user already provisioned', { externalId: input.externalId });
    }

    if (this.userRepository.findByEmail(input.email)) {
      throw new ValidationError('Email already in use', { email: input.email });
    }

    if (this.userRepository.findByUsername(input.username)) {
      throw new ValidationError('Username already in use', { username: input.username });
    }

    const tempPassword = `${randomUUID()}!Aa1`;
    const feather = await this.featherPanelService.createUser({
      email: input.email,
      username: input.username,
      first_name: input.firstName,
      last_name: input.lastName,
      password: tempPassword
    });

    return this.userRepository.save({
      id: randomUUID(),
      email: input.email,
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      externalId: input.externalId,
      passwordHash: input.passwordHash ?? UserService.hashPassword(tempPassword),
      featherId: feather.attributes.id,
      role: 'client',
      createdAt: new Date()
    });
  }
}
