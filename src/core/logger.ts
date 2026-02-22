import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  name: 'loisax2-featherpanel',
  level: env.NODE_ENV === 'production' ? 'info' : 'debug'
});
