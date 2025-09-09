import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import AuthorizedRoute from '@/components/AuthorizedRoute';
import BookingCalendar from '@/components/BookingCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Music
} from 'lucide-react';

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

export default function Booking() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [activeTab, setActiveTab] = useState('new');
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: artists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['/api/artists'],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings'],
  });

  const managedArtists = Array.isArray(artists) ? artists.filter((artist: any) => artist.isManaged) : [];

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

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/bookings', { method: 'POST', body: data });
    },
    onSuccess: () => {
      toast({
        title: "Booking created",
        description: "Your booking request has been submitted successfully",
      });
      form.reset();
      setSelectedDates([]);
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setActiveTab('existing');
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "There was an error creating your booking",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (selectedDates.length === 0) {
      toast({
        title: "No dates selected",
        description: "Please select at least one date for your event",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      ...data,
      primaryArtistUserId: parseInt(data.primaryArtistUserId),
      totalBudget: data.totalBudget ? parseFloat(data.totalBudget) : undefined,
      dates: selectedDates.map(date => ({
        eventDate: date.toISOString(),
        venueName: data.venueName,
        venueAddress: data.venueAddress,
      })),
    };

    createBookingMutation.mutate(bookingData);
  };



  const eventTypes = [
    'Concert',
    'Corporate Event',
    'Wedding',
    'Private Party',
    'Festival',
    'Recording Session',
    'Photo Shoot',
    'Other'
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <AuthorizedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="gradient-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Booking Management
              </h1>
              <p className="text-xl text-gray-200">
                Create and manage artist bookings with our professional calendar system
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">New Booking</TabsTrigger>
              <TabsTrigger value="existing">My Bookings</TabsTrigger>
            </TabsList>

            {/* New Booking Tab */}
            <TabsContent value="new" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Booking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="primaryArtistUserId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Artist</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose an artist" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {artistsLoading ? (
                                    <SelectItem value="loading" disabled>Loading artists...</SelectItem>
                                  ) : managedArtists.length > 0 ? (
                                    managedArtists.map((artist: any) => (
                                      <SelectItem key={artist.userId} value={artist.userId.toString()}>
                                        {artist.stageName || artist.user?.fullName}
                                        {artist.basePrice && ` - From $${artist.basePrice}`}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-artists" disabled>No managed artists available</SelectItem>
                                  )}
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
                              <FormLabel>Event Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter event name" {...field} />
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
                              <FormLabel>Event Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select event type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {eventTypes.map((type) => (
                                    <SelectItem key={type} value={type.toLowerCase()}>
                                      {type}
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
                          name="totalBudget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter total budget" 
                                  {...field} 
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
                              <FormLabel>Venue Name (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter venue name" {...field} />
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
                              <FormLabel>Venue Address (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter venue address" {...field} />
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
                              <FormLabel>Special Requirements (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any special requirements or notes..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={createBookingMutation.isPending}
                        >
                          {createBookingMutation.isPending ? 'Creating Booking...' : 'Create Booking'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Calendar */}
                <div>
                  <BookingCalendar
                    selectedDates={selectedDates}
                    onDateSelect={setSelectedDates}
                    multiSelect={true}
                    bookedDates={[]} // TODO: Get actual booked dates from API
                    unavailableDates={[]} // TODO: Get actual unavailable dates
                  />

                  {selectedDates.length > 0 && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-sm">Selected Dates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedDates.map((date, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">
                                {date.toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedDates(dates => 
                                  dates.filter((_, i) => i !== index)
                                )}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Existing Bookings Tab */}
            <TabsContent value="existing" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Bookings</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-4"></div>
                          <div className="h-6 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : Array.isArray(bookings) && bookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(bookings) && bookings.map((booking: any) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.eventName}</h3>
                            <p className="text-sm text-muted-foreground">{booking.eventType}</p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          {booking.totalBudget && (
                            <div className="flex items-center text-sm">
                              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                              <span>${booking.totalBudget}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Booking #{booking.id}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Details
                          </Button>
                          {booking.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first booking to get started
                  </p>
                  <Button onClick={() => setActiveTab('new')}>
                    Create New Booking
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthorizedRoute>
  );
}
