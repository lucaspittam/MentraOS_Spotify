"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.AppError = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["AUTHENTICATION"] = "AUTHENTICATION";
    ErrorType["NETWORK"] = "NETWORK";
    ErrorType["API"] = "API";
    ErrorType["STORAGE"] = "STORAGE";
    ErrorType["VOICE"] = "VOICE";
    ErrorType["UI"] = "UI";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class AppError extends Error {
    constructor(message, type, code, retryable = false) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.code = code;
        this.retryable = retryable;
    }
}
exports.AppError = AppError;
class ErrorHandler {
    constructor() {
        this.errorCallbacks = new Map();
    }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    handleError(error, context) {
        let appError;
        if (error instanceof AppError) {
            appError = error;
        }
        else if (error instanceof Error) {
            appError = this.categorizeError(error);
        }
        else {
            appError = new AppError('An unknown error occurred', ErrorType.API, 'UNKNOWN_ERROR');
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
    categorizeError(error) {
        const message = error.message.toLowerCase();
        if (message.includes('unauthorized') || message.includes('invalid token')) {
            return new AppError('Authentication failed. Please reconnect your Spotify account.', ErrorType.AUTHENTICATION, 'AUTH_FAILED', false);
        }
        if (message.includes('network') || message.includes('fetch')) {
            return new AppError('Network connection failed. Please check your internet connection.', ErrorType.NETWORK, 'NETWORK_ERROR', true);
        }
        if (message.includes('rate limit') || message.includes('too many requests')) {
            return new AppError('Too many requests. Please wait a moment before trying again.', ErrorType.API, 'RATE_LIMITED', true);
        }
        if (message.includes('device') || message.includes('player')) {
            return new AppError('No active Spotify device found. Please start playing music on a device.', ErrorType.API, 'NO_DEVICE', false);
        }
        if (message.includes('storage') || message.includes('store')) {
            return new AppError('Failed to save settings. Please try again.', ErrorType.STORAGE, 'STORAGE_ERROR', true);
        }
        return new AppError(error.message || 'An unexpected error occurred', ErrorType.API, 'GENERIC_ERROR', false);
    }
    onError(type, callback) {
        if (!this.errorCallbacks.has(type)) {
            this.errorCallbacks.set(type, []);
        }
        this.errorCallbacks.get(type).push(callback);
    }
    notifyCallbacks(error) {
        const callbacks = this.errorCallbacks.get(error.type) || [];
        callbacks.forEach(callback => {
            try {
                callback(error);
            }
            catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });
    }
    async retryOperation(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                const appError = this.handleError(error, `Retry attempt ${attempt + 1}`);
                if (!appError.retryable || attempt === maxRetries) {
                    throw appError;
                }
                await this.wait(delay * Math.pow(2, attempt));
            }
        }
        throw this.handleError(lastError, 'Max retries exceeded');
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=error-handler.js.map