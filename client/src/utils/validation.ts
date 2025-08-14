import { z } from 'zod';

// Email validation with comprehensive checks
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .refine((email) => {
    // Additional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, "Invalid email format");

// Phone number validation with international support
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((phone) => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check for valid phone number length (7-15 digits)
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return false;
    }
    
    // Basic pattern check for common formats
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }, "Please enter a valid phone number");

// Credit card validation
export const creditCardSchema = z.object({
  number: z
    .string()
    .min(1, "Card number is required")
    .refine((num) => {
      const digitsOnly = num.replace(/\s/g, '');
      return digitsOnly.length >= 13 && digitsOnly.length <= 19;
    }, "Invalid card number length")
    .refine((num) => {
      // Luhn algorithm for card validation
      const digitsOnly = num.replace(/\s/g, '');
      let sum = 0;
      let isEven = false;
      
      for (let i = digitsOnly.length - 1; i >= 0; i--) {
        let digit = parseInt(digitsOnly[i], 10);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    }, "Invalid card number"),
  
  expiry: z
    .string()
    .min(1, "Expiry date is required")
    .refine((expiry) => {
      const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      return regex.test(expiry);
    }, "Format: MM/YY")
    .refine((expiry) => {
      const [month, year] = expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      return expiryDate > new Date();
    }, "Card has expired"),
  
  cvv: z
    .string()
    .min(3, "CVV is required")
    .max(4, "Invalid CVV")
    .regex(/^\d+$/, "CVV must contain only digits")
});

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required")
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((file) => file.size <= 50 * 1024 * 1024, "File size must be less than 50MB")
    .refine((file) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'video/mp4',
        'application/pdf'
      ];
      return allowedTypes.includes(file.type);
    }, "File type not supported")
});

// Form field highlighting utility
export function getFieldError(errors: any, fieldName: string): string | undefined {
  return errors[fieldName]?.message;
}

export function getFieldClassName(errors: any, fieldName: string, baseClass: string = ""): string {
  const hasError = !!errors[fieldName];
  return `${baseClass} ${hasError ? 'border-destructive focus:ring-destructive' : ''}`.trim();
}