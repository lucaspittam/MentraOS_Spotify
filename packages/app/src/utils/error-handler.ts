export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  STORAGE = 'STORAGE',
  VOICE = 'VOICE',
  UI = 'UI',
  MEDIA = 'MEDIA',
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    type: ErrorType,
    code?: string,
    retryable = false
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.retryable = retryable;
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: Map<ErrorType, ((error: AppError) => void)[]> = new Map();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: unknown, context?: string): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = this.categorizeError(error);
    } else {
      appError = new AppError(
        'An unknown error occurred',
        ErrorType.API,
        'UNKNOWN_ERROR'
      );
    }

    console.error(`[${appError.type}] ${context || 'Error'}:`, {
      message: appError.message,
      code: appError.code,
      retryable: appError.retryable,
      stack: appError.stack
    });

    this.notifyCallbacks(appError);
    return appError;
  }

  private categorizeError(error: Error): AppError {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return new AppError(
        'Network connection failed. Please check your internet connection.',
        ErrorType.NETWORK,
        'NETWORK_ERROR',
        true
      );
    }

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return new AppError(
        'Too many requests. Please wait a moment before trying again.',
        ErrorType.API,
        'RATE_LIMITED',
        true
      );
    }

    if (message.includes('media') || message.includes('player')) {
      return new AppError(
        'Media player error. Please check your phone.',
        ErrorType.MEDIA,
        'PLAYER_ERROR',
        false
      );
    }

    if (message.includes('storage') || message.includes('store')) {
      return new AppError(
        'Failed to save settings. Please try again.',
        ErrorType.STORAGE,
        'STORAGE_ERROR',
        true
      );
    }

    return new AppError(
      error.message || 'An unexpected error occurred',
      ErrorType.API,
      'GENERIC_ERROR',
      false
    );
  }

  onError(type: ErrorType, callback: (error: AppError) => void): void {
    if (!this.errorCallbacks.has(type)) {
      this.errorCallbacks.set(type, []);
    }
    this.errorCallbacks.get(type)!.push(callback);
  }

  private notifyCallbacks(error: AppError): void {
    const callbacks = this.errorCallbacks.get(error.type) || [];
    callbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const appError = this.handleError(error, `Retry attempt ${attempt + 1}`);
        
        if (!appError.retryable || attempt === maxRetries) {
          throw appError;
        }

        await this.wait(delay * Math.pow(2, attempt));
      }
    }

    throw this.handleError(lastError!, 'Max retries exceeded');
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
