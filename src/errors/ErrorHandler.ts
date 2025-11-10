export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class GeminiError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'GEMINI_ERROR', userMessage);
    this.name = 'GeminiError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'VALIDATION_ERROR', userMessage);
    this.name = 'ValidationError';
  }
}
