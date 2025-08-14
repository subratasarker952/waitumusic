import winston from 'winston';
import { Request } from 'express';

// Error severity levels
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error context interface
interface ErrorContext {
  userId?: number;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  requestBody?: any;
  queryParams?: any;
  [key: string]: any;
}

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'waitumusic-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Write critical errors to separate file
    new winston.transports.File({
      filename: 'logs/critical.log',
      level: 'critical',
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Main error logging function
export function logError(
  error: any,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  context: ErrorContext = {}
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const logEntry = {
    message: errorMessage,
    severity,
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error?.name || 'UnknownError',
      message: errorMessage,
      stack: errorStack
    }
  };

  // Log based on severity
  switch (severity) {
    case ErrorSeverity.DEBUG:
      logger.debug(logEntry);
      break;
    case ErrorSeverity.INFO:
      logger.info(logEntry);
      break;
    case ErrorSeverity.WARNING:
      logger.warn(logEntry);
      break;
    case ErrorSeverity.ERROR:
      logger.error(logEntry);
      break;
    case ErrorSeverity.CRITICAL:
      logger.error({ ...logEntry, critical: true });
      // For critical errors, also alert (in production, this could send emails/notifications)
      alertCriticalError(logEntry);
      break;
  }
}

// Extract context from Express request
export function getRequestContext(req: Request): ErrorContext {
  return {
    endpoint: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId,
    queryParams: req.query,
    // Don't log sensitive data
    requestBody: sanitizeRequestBody(req.body)
  };
}

// Sanitize request body to avoid logging sensitive data
function sanitizeRequestBody(body: any): any {
  if (!body) return undefined;
  
  const sensitiveFields = [
    'password', 'passwordHash', 'token', 'secret', 
    'creditCard', 'ssn', 'apiKey', 'privateKey'
  ];
  
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Alert critical errors (in production, this would send notifications)
function alertCriticalError(logEntry: any): void {
  console.error('🚨 CRITICAL ERROR:', {
    message: logEntry.message,
    endpoint: logEntry.context.endpoint,
    timestamp: logEntry.timestamp
  });
  
  // In production, this would:
  // - Send email to admins
  // - Send Slack/Discord notification
  // - Create PagerDuty incident
  // - etc.
}

// Log request/response middleware
export function requestLogger(req: Request, res: any, next: any): void {
  const start = Date.now();
  
  // Log request
  logError(`${req.method} ${req.path}`, ErrorSeverity.INFO, {
    ...getRequestContext(req),
    type: 'request'
  });
  
  // Log response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;
    
    logError(`${req.method} ${req.path} - ${res.statusCode}`, ErrorSeverity.INFO, {
      ...getRequestContext(req),
      type: 'response',
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    
    originalSend.call(this, data);
  };
  
  next();
}

// Error types for categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHZ_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  FILE_SYSTEM = 'FILE_SYSTEM_ERROR',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// Categorize errors
export function categorizeError(error: any): ErrorType {
  const message = error?.message?.toLowerCase() || '';
  
  if (error.name === 'ZodError' || message.includes('validation')) {
    return ErrorType.VALIDATION;
  }
  if (message.includes('unauthorized') || message.includes('authentication')) {
    return ErrorType.AUTHENTICATION;
  }
  if (message.includes('forbidden') || message.includes('permission')) {
    return ErrorType.AUTHORIZATION;
  }
  if (message.includes('database') || message.includes('sql') || error.code?.startsWith('PG')) {
    return ErrorType.DATABASE;
  }
  if (message.includes('api') || message.includes('external')) {
    return ErrorType.EXTERNAL_API;
  }
  if (message.includes('file') || message.includes('directory')) {
    return ErrorType.FILE_SYSTEM;
  }
  
  return ErrorType.UNKNOWN;
}

// Create standardized error response
export function createErrorResponse(
  error: any,
  fallbackMessage: string = 'An error occurred'
): { error: string; message: string; code?: string } {
  const errorType = categorizeError(error);
  
  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    switch (errorType) {
      case ErrorType.VALIDATION:
        return { error: 'Validation failed', message: error.message };
      case ErrorType.AUTHENTICATION:
        return { error: 'Authentication failed', message: 'Please log in and try again' };
      case ErrorType.AUTHORIZATION:
        return { error: 'Access denied', message: 'You don\'t have permission for this action' };
      case ErrorType.DATABASE:
        return { error: 'Database error', message: 'A database error occurred. Please try again later' };
      default:
        return { error: 'Internal error', message: fallbackMessage };
    }
  }
  
  // In development, provide more details
  return {
    error: errorType,
    message: error.message || fallbackMessage,
    code: error.code
  };
}