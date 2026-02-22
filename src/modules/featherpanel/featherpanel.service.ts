import { env } from '../../config/env.js';
import { ExternalApiError } from '../../core/errors.js';
import { withRetry } from '../../core/retry.js';

type FeatherUserPayload = {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
};

type CreateServerPayload = {
  name: string;
  user: number;
  egg: number;
  docker_image: string;
  limits: { memory: number; swap: number; disk: number; io: number; cpu: number };
  feature_limits: { databases: number; allocations: number; backups: number };
  environment: Record<string, string>;
  deploy?: { locations: number[]; dedicated_ip: boolean; port_range: string[] };
};

export class FeatherPanelService {
  private readonly applicationHeaders = {
    Authorization: `Bearer ${env.FEATHERPANEL_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  private readonly clientHeaders = {
    Authorization: `Bearer ${env.FEATHERPANEL_CLIENT_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  private async request<T>(path: string, init: RequestInit, useClientApi = false): Promise<T> {
    return withRetry(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), env.REQUEST_TIMEOUT_MS);

        try {
          const response = await fetch(`${env.FEATHERPANEL_URL}${path}`, {
            ...init,
            headers: useClientApi ? this.clientHeaders : this.applicationHeaders,
            signal: controller.signal
          });

          const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

          if (!response.ok) {
            throw new ExternalApiError('FeatherPanel request failed', {
              status: response.status,
              body,
              path
            });
          }

          return body as T;
        } finally {
          clearTimeout(timeout);
        }
      },
      {
        attempts: env.RETRY_ATTEMPTS,
        baseDelayMs: env.RETRY_BASE_DELAY_MS,
        retryOn: (error) => {
          if (error instanceof ExternalApiError) {
            const status = Number(error.metadata?.status ?? 500);
            return status === 429 || status >= 500;
          }

          return true;
        }
      }
    );
  }

  createUser(payload: FeatherUserPayload): Promise<{ attributes: { id: number } }> {
    return this.request('/api/application/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  createServer(payload: CreateServerPayload): Promise<{ attributes: { id: number; identifier: string; node: number; status: string } }> {
    return this.request('/api/application/servers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  power(identifier: string, signal: 'start' | 'stop' | 'restart') {
    return this.request(`/api/client/servers/${identifier}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal })
    }, true);
  }

  getConsoleCredentials(identifier: string): Promise<{ data: { token: string; socket: string } }> {
    return this.request(`/api/client/servers/${identifier}/websocket`, {
      method: 'GET'
    }, true);
  }

  updateBuild(serverId: number, limits: { memory: number; disk: number; cpu: number }) {
    return this.request(`/api/application/servers/${serverId}/build`, {
      method: 'PATCH',
      body: JSON.stringify({
        limits: {
          memory: limits.memory,
          swap: 0,
          disk: limits.disk,
          io: 500,
          cpu: limits.cpu
        }
      })
    });
  }
}
