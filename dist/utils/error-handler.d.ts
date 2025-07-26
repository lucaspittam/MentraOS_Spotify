export declare enum ErrorType {
    AUTHENTICATION = "AUTHENTICATION",
    NETWORK = "NETWORK",
    API = "API",
    STORAGE = "STORAGE",
    VOICE = "VOICE",
    UI = "UI"
}
export declare class AppError extends Error {
    readonly type: ErrorType;
    readonly code?: string;
    readonly retryable: boolean;
    constructor(message: string, type: ErrorType, code?: string, retryable?: boolean);
}
export declare class ErrorHandler {
    private static instance;
    private errorCallbacks;
    static getInstance(): ErrorHandler;
    handleError(error: unknown, context?: string): AppError;
    private categorizeError;
    onError(type: ErrorType, callback: (error: AppError) => void): void;
    private notifyCallbacks;
    retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
    private wait;
}
//# sourceMappingURL=error-handler.d.ts.map