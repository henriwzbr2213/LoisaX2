import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  FEATHERPANEL_URL: z.string().url(),
  FEATHERPANEL_API_KEY: z.string().min(10),
  FEATHERPANEL_CLIENT_API_KEY: z.string().min(10),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(10000),
  RETRY_ATTEMPTS: z.coerce.number().default(3),
  RETRY_BASE_DELAY_MS: z.coerce.number().default(250)
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
