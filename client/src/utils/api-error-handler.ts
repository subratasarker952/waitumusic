import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  field?: string;
  code?: string;
  status?: number;
}

export class ApiErrorHandler {
  static handleError(error: any, context?: string): void {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          this.handleBadRequest(data);
          break;
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          this.handleForbidden();
          break;
        case 404:
          this.handleNotFound(context);
          break;
        case 409:
          this.handleConflict(data);
          break;
        case 422:
          this.handleValidationError(data);
          break;
        case 429:
          this.handleRateLimitError();
          break;
        case 500:
        case 502:
        case 503:
          this.handleServerError();
          break;
        default:
          this.handleGenericError(data);
      }
    } else if (error.request) {
      // Request made but no response
      this.handleNetworkError();
    } else {
      // Something else happened
      this.handleGenericError(error);
    }
  }
  
  private static handleBadRequest(data: any): void {
    toast({
      title: "Invalid Request",
      description: data?.message || "The request contains invalid data. Please check your input.",
      variant: "destructive"
    });
  }
  
  private static handleUnauthorized(): void {
    toast({
      title: "Authentication Required",
      description: "Your session has expired. Please log in again.",
      variant: "destructive"
    });
    // Redirect to login after delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }
  
  private static handleForbidden(): void {
    toast({
      title: "Access Denied",
      description: "You don't have permission to perform this action.",
      variant: "destructive"
    });
  }
  
  private static handleNotFound(context?: string): void {
    toast({
      title: "Not Found",
      description: context ? `${context} not found.` : "The requested resource was not found.",
      variant: "destructive"
    });
  }
  
  private static handleConflict(data: any): void {
    toast({
      title: "Conflict",
      description: data?.message || "This action conflicts with existing data.",
      variant: "destructive"
    });
  }
  
  private static handleValidationError(data: any): void {
    const errors = data?.errors || [];
    const message = errors.length > 0 
      ? errors.map((e: any) => e.message).join(', ')
      : "Please check your input and try again.";
      
    toast({
      title: "Validation Error",
      description: message,
      variant: "destructive"
    });
  }
  
  private static handleRateLimitError(): void {
    toast({
      title: "Too Many Requests",
      description: "You're making requests too quickly. Please wait a moment and try again.",
      variant: "destructive"
    });
  }
  
  private static handleServerError(): void {
    toast({
      title: "Server Error",
      description: "Something went wrong on our end. Please try again later.",
      variant: "destructive"
    });
  }
  
  private static handleNetworkError(): void {
    toast({
      title: "Network Error",
      description: "Unable to connect. Please check your internet connection.",
      variant: "destructive"
    });
  }
  
  private static handleGenericError(error: any): void {
    const message = error?.message || "An unexpected error occurred. Please try again.";
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }
  
  // Helper method for form validation errors
  static formatValidationErrors(errors: Record<string, string[]>): string {
    return Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
  }
  
  // Helper method to check if error is auth related
  static isAuthError(error: any): boolean {
    return error?.response?.status === 401 || error?.response?.status === 403;
  }
}