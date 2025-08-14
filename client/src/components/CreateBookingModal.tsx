import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getFieldClassName } from '@/utils/validation';
import { dateRangeSchema } from '@/utils/validation';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

const bookingSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  venueName: z.string().min(1, "Venue name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  budget: z.number().min(0, "Budget must be positive"),
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

type BookingFormData = z.infer<typeof bookingSchema>;

interface CreateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BookingFormData) => void;
}

export function CreateBookingModal({ open, onOpenChange, onSubmit }: CreateBookingModalProps) {
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();
  const [isMobile, setIsMobile] = useState(false);
  
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      eventName: '',
      venueName: '',
      eventDate: '',
      startDate: '',
      endDate: '',
      budget: 0
    }
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = (data: BookingFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isMobile ? 'max-h-[90vh] overflow-y-auto' : ''}`}
        style={{
          marginBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0',
          transition: 'margin-bottom 0.3s ease'
        }}
      >
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className={getFieldClassName(form.formState.errors, 'eventName')}
                      placeholder="Summer Music Festival"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="venueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className={getFieldClassName(form.formState.errors, 'venueName')}
                      placeholder="Madison Square Garden"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className={getFieldClassName(form.formState.errors, 'startDate')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className={getFieldClassName(form.formState.errors, 'endDate')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className={getFieldClassName(form.formState.errors, 'budget')}
                      placeholder="10000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className={`flex justify-end gap-3 ${isMobile ? 'sticky bottom-0 bg-background pt-4 pb-2' : ''}`}>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Booking
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}