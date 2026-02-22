import { logger } from './logger.js';

export type RetryOptions = {
  attempts: number;
  baseDelayMs: number;
  retryOn?: (error: unknown) => boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const shouldRetry = options.retryOn ? options.retryOn(error) : true;
      const isLastAttempt = attempt === options.attempts;

      if (!shouldRetry || isLastAttempt) {
        throw lastError;
      }

      const delayMs = options.baseDelayMs * 2 ** (attempt - 1);
      logger.warn({ attempt, delayMs, err: error }, 'Retrying failed external operation');
      await sleep(delayMs);
    }
  }

  throw lastError;
}
