import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  DollarSign, 
  Video,
  Phone,
  MessageSquare,
  Plus,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const consultationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  clientName: z.string().min(2, "Client name is required"),
  clientEmail: z.string().email("Valid email is required"),
  serviceType: z.string().min(1, "Please select a service type"),
  duration: z.string().min(1, "Please select duration"),
  rate: z.string().min(1, "Rate is required"),
  meetingType: z.string().min(1, "Please select meeting type"),
  notes: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface ConsultationCalendarProps {
  user: any;
}

export default function ConsultationCalendar({ user }: ConsultationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      title: "",
      clientName: "",
      clientEmail: "",
      serviceType: "",
      duration: "",
      rate: "",
      meetingType: "",
      notes: ""
    }
  });

  // Fetch consultations
  const { data: consultations, isLoading } = useQuery({
    queryKey: ['/api/consultations', user.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/consultations?professionalId=${user.id}`);
      return await response.json();
    },
  });

  // Fetch availability slots
  const { data: availability } = useQuery({
    queryKey: ['/api/professional/availability', user.id, selectedDate],
    queryFn: async () => {
      const dateStr = selectedDate?.toISOString().split('T')[0];
      const response = await apiRequest(`/api/professional/availability?professionalId=${user.id}&date=${dateStr}`);
      return await response.json();
    },
    enabled: !!selectedDate
  });

  // Create consultation mutation
  const createConsultationMutation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      const consultationData = {
        ...data,
        professionalId: user.id,
        date: selectedDate?.toISOString().split('T')[0],
        timeSlot: selectedTimeSlot,
        status: 'pending'
      };
      const response = await apiRequest('/api/consultations', {
        method: 'POST',
        body: JSON.stringify(consultationData)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consultations'] });
      setIsBookingModalOpen(false);
      form.reset();
      setSelectedTimeSlot('');
      toast({
        title: "Consultation Scheduled",
        description: "The consultation has been scheduled successfully.",
      });
    },
  });

  // Update consultation status mutation
  const updateConsultationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest(`/api/consultations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consultations'] });
      toast({
        title: "Status Updated",
        description: "Consultation status has been updated.",
      });
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    if (!selectedTimeSlot) {
      toast({
        title: "Time Slot Required",
        description: "Please select a time slot for the consultation.",
        variant: "destructive",
      });
      return;
    }
    createConsultationMutation.mutate(data);
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const availableSlots = availability?.available || timeSlots;
  const bookedSlots = availability?.booked || [];

  const consultationsList = consultations || [
    {
      id: 1,
      title: "Brand Strategy Consultation",
      clientName: "Sarah Johnson",
      clientEmail: "sarah@example.com",
      date: "2024-02-15",
      timeSlot: "14:00",
      duration: "60",
      serviceType: "Marketing Strategy",
      rate: "150",
      status: "confirmed",
      meetingType: "video"
    },
    {
      id: 2,
      title: "Music Production Review",
      clientName: "Mike Chen",
      clientEmail: "mike@example.com",
      date: "2024-02-16",
      timeSlot: "10:30",
      duration: "90",
      serviceType: "Music Production",
      rate: "200",
      status: "pending",
      meetingType: "in-person"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Consultation Calendar</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage your consultation bookings and availability</p>
        </div>
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Consultation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Brand Strategy Session" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="marketing">Marketing Strategy</SelectItem>
                            <SelectItem value="production">Music Production</SelectItem>
                            <SelectItem value="photography">Photography</SelectItem>
                            <SelectItem value="videography">Videography</SelectItem>
                            <SelectItem value="coaching">Career Coaching</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Client full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="client@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meetingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="video">Video Call</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                            <SelectItem value="in-person">In Person</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date and Time Selection */}
                <div className="space-y-4">
                  <Label>Select Date & Time</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Available Time Slots</Label>
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {timeSlots.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isSelected = selectedTimeSlot === slot;
                          return (
                            <Button
                              key={slot}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              disabled={isBooked}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`text-xs ${isBooked ? 'opacity-50' : ''}`}
                            >
                              {slot}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about the consultation..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createConsultationMutation.isPending}>
                    Schedule Consultation
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar and Consultations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <div className="mt-4">
              <h4 className="font-semibold mb-2">
                Consultations for {selectedDate?.toLocaleDateString()}
              </h4>
              <div className="space-y-2">
                {consultationsList
                  .filter((consultation: any) => consultation.date === selectedDate?.toISOString().split('T')[0])
                  .map((consultation: any) => (
                    <div key={consultation.id} className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                      <div className="font-medium">{consultation.title}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {consultation.timeSlot} - {consultation.clientName}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Consultations */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Upcoming Consultations</h4>
          {consultationsList.map((consultation: any) => (
            <Card key={consultation.id} className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">{consultation.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{consultation.clientName}</p>
                  </div>
                  <Badge className={getStatusColor(consultation.status)}>
                    {consultation.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    {consultation.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {consultation.timeSlot} ({consultation.duration}m)
                  </div>
                  <div className="flex items-center gap-2">
                    {getMeetingTypeIcon(consultation.meetingType)}
                    {consultation.meetingType}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    ${consultation.rate}
                  </div>
                </div>

                {consultation.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => updateConsultationMutation.mutate({ id: consultation.id, status: 'confirmed' })}
                      className="flex-1"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateConsultationMutation.mutate({ id: consultation.id, status: 'cancelled' })}
                      className="flex-1"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {consultationsList.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Consultations</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {consultationsList.filter((c: any) => c.status === 'confirmed').length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Confirmed</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {consultationsList.filter((c: any) => c.status === 'pending').length}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            ${consultationsList.reduce((sum: number, c: any) => sum + parseInt(c.rate), 0)}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Total Revenue</div>
        </Card>
      </div>
    </div>
  );
}