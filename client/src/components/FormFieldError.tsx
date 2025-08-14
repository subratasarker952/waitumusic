import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldError({ error, children, className }: FormFieldErrorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn(
        "relative",
        error && "ring-2 ring-destructive ring-offset-2 rounded-md"
      )}>
        {children}
      </div>
      {error && (
        <p className="text-sm text-destructive animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  );
}