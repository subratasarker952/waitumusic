import { Request, Response, NextFunction } from 'express';

// Enhanced error handling middleware for comprehensive error management

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  context?: any;
}

// Error types enum
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

// Create custom error
export function createError(
  message: string,
  statusCode: number = 500,
  type: ErrorType = ErrorType.INTERNAL,
  context?: any
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  error.context = { type, ...context };
  return error;
}

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler
export function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational !== undefined ? err.isOperational : true;

  // Log error
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    context: err.context,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      context: err.context
    })
  });
}

// Not found handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = createError(
    `Cannot ${req.method} ${req.path}`,
    404,
    ErrorType.NOT_FOUND
  );
  next(error);
}

// Validation error handler
export function handleValidationError(errors: any[]) {
  const message = errors.map(e => e.message).join(', ');
  throw createError(message, 400, ErrorType.VALIDATION, { errors });
}

// Database error handler
export function handleDatabaseError(error: any) {
  console.error('Database error:', error);
  
  // Handle specific database errors
  if (error.code === '23505') {
    throw createError('Duplicate entry found', 409, ErrorType.DATABASE);
  }
  if (error.code === '23503') {
    throw createError('Referenced entity not found', 400, ErrorType.DATABASE);
  }
  
  throw createError('Database operation failed', 500, ErrorType.DATABASE);
}

// Authentication error handler
export function handleAuthError(message: string = 'Authentication failed') {
  throw createError(message, 401, ErrorType.AUTHENTICATION);
}

// Authorization error handler
export function handleAuthorizationError(message: string = 'Access denied') {
  throw createError(message, 403, ErrorType.AUTHORIZATION);
}