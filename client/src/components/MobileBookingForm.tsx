import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Send,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const bookingSchema = z.object({
  primaryArtistUserId: z.string().min(1, 'Please select an artist'),
  eventName: z.string().min(1, 'Event name is required'),
  eventType: z.string().min(1, 'Please select event type'),
  totalBudget: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  requirements: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface MobileBookingFormProps {
  selectedDates: Date[];
  artists: any[];
  onSubmit: (data: BookingFormData) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function MobileBookingForm({
  selectedDates,
  artists,
  onSubmit,
  onBack,
  isLoading = false
}: MobileBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      primaryArtistUserId: '',
      eventName: '',
      eventType: '',
      totalBudget: '',
      venueName: '',
      venueAddress: '',
      requirements: '',
    },
  });

  const eventTypes = [
    'Concert',
    'Festival',
    'Private Event',
    'Corporate Event',
    'Wedding',
    'Birthday Party',
    'Recording Session',
    'Music Video',
    'Photoshoot',
    'Interview',
    'Other'
  ];

  const managedArtists = artists.filter((artist: any) => artist.isManaged);

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const canProceedToNext = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 1:
        return values.primaryArtistUserId && values.eventName && values.eventType;
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-8 h-0.5 ${i + 1 < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-0">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handlePrevStep}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg">New Booking</CardTitle>
            <div className="w-10" /> {/* Spacer */}
          </div>
          <StepIndicator />
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">Event Details</h3>
                    <p className="text-sm text-gray-600">Tell us about your event</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="primaryArtistUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Select Artist *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Choose an artist" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {managedArtists.map((artist: any) => (
                              <SelectItem key={artist.userId} value={artist.userId?artist.userId.toString():`artist-${Math.random()}`}>
                                {artist.stageName} - {artist.genre || 'Artist'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Event Name *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Summer Music Festival" 
                            className="h-12"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Event Type *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventTypes.map((type, index) => (
                              <SelectItem key={index} value={type.toLowerCase().replace(/\s+/g, '_') || `event-${Math.random()}`}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Venue & Budget */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">Venue & Budget</h3>
                    <p className="text-sm text-gray-600">Add location and budget details</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="venueName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Venue Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Madison Square Garden" 
                            className="h-12"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venueAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Full venue address..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Total Budget
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., $5,000" 
                            className="h-12"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special requirements, technical needs, etc..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
                    <p className="text-sm text-gray-600">Confirm your booking details</p>
                  </div>

                  {/* Selected Dates */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Selected Dates</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedDates.map((date, index) => (
                        <Badge key={index} variant="outline">
                          {format(date, 'MMM d, yyyy')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="space-y-3">
                    <Separator />
                    {form.watch('primaryArtistUserId') && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Artist:</span>
                        <span className="text-sm font-medium">
                          {managedArtists.find(a => a.userId.toString() === form.watch('primaryArtistUserId'))?.stageName}
                        </span>
                      </div>
                    )}
                    
                    {form.watch('eventName') && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Event:</span>
                        <span className="text-sm font-medium">{form.watch('eventName')}</span>
                      </div>
                    )}
                    
                    {form.watch('eventType') && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium">
                          {eventTypes.find(t => t.toLowerCase().replace(/\s+/g, '_') === form.watch('eventType'))}
                        </span>
                      </div>
                    )}
                    
                    {form.watch('venueName') && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Venue:</span>
                        <span className="text-sm font-medium">{form.watch('venueName')}</span>
                      </div>
                    )}
                    
                    {form.watch('totalBudget') && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Budget:</span>
                        <span className="text-sm font-medium">{form.watch('totalBudget')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep < totalSteps ? (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handlePrevStep}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleNextStep}
                      disabled={!canProceedToNext()}
                      className="flex-1"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handlePrevStep}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Submitting...' : (
                        <>
                          Submit
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}