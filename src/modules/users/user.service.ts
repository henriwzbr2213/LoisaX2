import { randomUUID } from 'node:crypto';
import { FeatherPanelService } from '../featherpanel/featherpanel.service.js';
import { UserRepository } from './user.repository.js';
import { User } from '../../types/domain.js';
import { ValidationError } from '../../core/errors.js';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly featherPanelService: FeatherPanelService
  ) {}

  async createClient(input: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    externalId: string;
  }): Promise<User> {
    if (this.userRepository.findByExternalId(input.externalId)) {
      throw new ValidationError('External user already provisioned', { externalId: input.externalId });
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
      featherId: feather.attributes.id,
      role: 'client',
      createdAt: new Date()
    });
  }

  seedAdmin(input: Omit<User, 'createdAt'>) {
    return this.userRepository.save({ ...input, createdAt: new Date() });
  }
}
