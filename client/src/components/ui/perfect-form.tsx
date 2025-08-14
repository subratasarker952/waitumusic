/**
 * Industry-Standard Perfect Form Components
 * Handles validation, accessibility, consistency, and UX excellence
 */

import React from 'react';
import { useForm, FormProvider, useFormContext, FieldPath, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// Form field wrapper with perfect validation display
interface PerfectFormFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const PerfectFormField: React.FC<PerfectFormFieldProps> = ({
  name,
  label,
  description,
  required = false,
  children,
  className,
}) => {
  const {
    formState: { errors, touchedFields },
    watch,
  } = useFormContext();

  const fieldError = errors[name];
  const isTouched = touchedFields[name];
  const fieldValue = watch(name);
  const hasValue = fieldValue && fieldValue.length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={name}
        className={cn(
          'text-sm font-medium transition-colors',
          fieldError ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </Label>
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="relative">
        {children}
        
        {/* Success indicator */}
        {isTouched && hasValue && !fieldError && (
          <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
        )}
        
        {/* Error indicator */}
        {fieldError && (
          <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
        )}
      </div>
      
      {/* Error message */}
      {fieldError && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>{fieldError.message as string}</span>
        </p>
      )}
    </div>
  );
};

// Perfect input with all states
interface PerfectInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PerfectInput: React.FC<PerfectInputProps> = ({
  name,
  label,
  description,
  required = false,
  size = 'md',
  className,
  type = 'text',
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <PerfectFormField name={name} label={label} description={description} required={required}>
      <div className="relative">
        <Input
          {...register(name)}
          id={name}
          type={inputType}
          className={cn(
            sizeClasses[size],
            errors[name] && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            isPassword && 'pr-10',
            className
          )}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </PerfectFormField>
  );
};

// Perfect textarea
interface PerfectTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

export const PerfectTextarea: React.FC<PerfectTextareaProps> = ({
  name,
  label,
  description,
  required = false,
  showCharCount = false,
  maxLength,
  className,
  ...props
}) => {
  const { register, watch, formState: { errors } } = useFormContext();
  const value = watch(name) || '';

  return (
    <PerfectFormField name={name} label={label} description={description} required={required}>
      <div className="relative">
        <Textarea
          {...register(name)}
          id={name}
          maxLength={maxLength}
          className={cn(
            errors[name] && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={!!errors[name]}
          {...props}
        />
        
        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </PerfectFormField>
  );
};

// Perfect select
interface PerfectSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  className?: string;
}

export const PerfectSelect: React.FC<PerfectSelectProps> = ({
  name,
  label,
  description,
  required = false,
  options,
  placeholder = 'Select an option...',
  className,
}) => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <PerfectFormField name={name} label={label} description={description} required={required}>
      <select
        {...register(name)}
        id={name}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          errors[name] && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={!!errors[name]}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </PerfectFormField>
  );
};

// Perfect form wrapper
interface PerfectFormProps<TFieldValues extends FieldValues = FieldValues> {
  schema: z.ZodSchema<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  defaultValues?: Partial<TFieldValues>;
  children: React.ReactNode;
  className?: string;
  submitText?: string;
  showSubmitButton?: boolean;
  isLoading?: boolean;
}

export function PerfectForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
  submitText = 'Submit',
  showSubmitButton = true,
  isLoading = false,
}: PerfectFormProps<TFieldValues>) {
  const methods = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur', // Validate on blur for better UX
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      // You could show a toast or error message here
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)} noValidate>
        {children}
        
        {showSubmitButton && (
          <Button
            type="submit"
            disabled={isLoading || !methods.formState.isValid}
            className="w-full"
          >
            {isLoading ? 'Submitting...' : submitText}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}

// Form validation helpers
export const createFormSchema = z.object({
  // Common field patterns
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});