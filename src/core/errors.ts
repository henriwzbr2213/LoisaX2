export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code = 'INTERNAL_ERROR',
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 502, 'EXTERNAL_API_ERROR', metadata);
  }
}

export class OwnershipError extends AppError {
  constructor(message = 'You do not own this server') {
    super(message, 403, 'OWNERSHIP_DENIED');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', metadata);
  }
}
