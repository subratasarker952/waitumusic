import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { storage } from '../storage';

// Global error wrapper to ensure ALL functions have try-catch
export function wrapWithTryCatch<T extends (...args: any[]) => any>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name}:`, error);
      throw error;
    }
  }) as T;
}

// Wrap all storage methods with try-catch
export function wrapStorageMethods(storageInstance: any) {
  const wrappedStorage: any = {};
  
  for (const key of Object.keys(storageInstance)) {
    const value = storageInstance[key];
    if (typeof value === 'function') {
      wrappedStorage[key] = wrapWithTryCatch(value.bind(storageInstance));
    } else {
      wrappedStorage[key] = value;
    }
  }
  
  return wrappedStorage;
}

// Global route error handler
export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  // User-friendly error messages
  const userMessage = getUserFriendlyMessage(err);
  
  res.status(500).json({
    message: userMessage,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

function getUserFriendlyMessage(error: Error): string {
  const errorMap: Record<string, string> = {
    'ECONNREFUSED': 'Unable to connect to the service. Please try again later.',
    'ETIMEDOUT': 'The request took too long. Please try again.',
    'ENOTFOUND': 'Service not found. Please check your connection.',
    'unauthorized': 'You need to log in to access this feature.',
    'forbidden': 'You don\'t have permission to do this.',
    'not found': 'The requested item was not found.',
    'validation': 'Please check your input and try again.',
    'duplicate': 'This item already exists.',
    'rate limit': 'Too many requests. Please wait a moment.',
    'payment': 'Payment processing failed. Please check your details.',
    'email': 'Failed to send email. Please try again.',
    'upload': 'File upload failed. Please check the file and try again.',
    'database': 'Database error. Our team has been notified.'
  };
  
  const errorMessage = error.message.toLowerCase();
  
  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }
  
  return 'Something went wrong. Please try again or contact support.';
}

// Async route wrapper with automatic error handling
export function asyncRouteHandler(fn: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}