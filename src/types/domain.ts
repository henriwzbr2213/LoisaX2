export type Role = 'admin' | 'client';

export type User = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  externalId: string;
  featherId: number;
  role: Role;
  createdAt: Date;
};

export type Server = {
  id: string;
  userId: string;
  featherId: number;
  featherIdentifier: string;
  nodeId: number;
  locationId: number;
  eggId: number;
  memory: number;
  cpu: number;
  disk: number;
  status: 'installing' | 'running' | 'stopped' | 'suspended';
  createdAt: Date;
};

export type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};
