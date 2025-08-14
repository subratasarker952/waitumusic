import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

// Hook to automatically reset forms when modals close
export function useFormReset<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  isOpen: boolean,
  defaultValues?: T
) {
  const prevOpenRef = useRef(isOpen);
  
  useEffect(() => {
    // Reset form when modal closes (transition from open to closed)
    if (prevOpenRef.current && !isOpen) {
      form.reset(defaultValues);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, form, defaultValues]);
  
  return {
    resetForm: () => form.reset(defaultValues)
  };
}