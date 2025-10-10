import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useConfiguration } from '@/contexts/ConfigurationProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PerfectLoading } from '@/components/ui/perfect-loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import {
  Calendar, MapPin, Clock, Music, Camera, Video,
  FileText, Download, Eye, Edit, CheckCircle,
  XCircle, AlertCircle, DollarSign, Send,
  Mic, Guitar, Headphones, Users, Receipt,
  FileMusic, SplitSquareVertical, Target, Layout,
  BookOpen, PenTool, Image, Briefcase
} from 'lucide-react';
import { ContractsTab } from '../gighub/components/ContractsTab';
import { CounterOfferDialog } from '../gighub/components/CounterOfferDialog';

// Role-specific components




export default function BookerView() {
  const { user, roles } = useAuth();
  const roleIds = roles.map(r => r.id)
  const { config } = useConfiguration();
  const params = useParams();
  const bookingId = parseInt(params.id as string);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [counterOfferOpen, setCounterOfferOpen] = useState(false);

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-details', bookingId],
    queryFn: async () => {
      const response = await apiRequest(`/api/bookings/${bookingId}/booker-view`);
      return response;
    },
    enabled: !!bookingId && !!user
  });


  console.log(booking);

  // Determine user's role type for UI adaptation
  const getUserRoleType = () => {
    if (!user) return "unknown";

    // Artists and Musicians
    if (roleIds.some(r => [3, 4, 5, 6].includes(r))) {
      return "performer";
    }

    // Audio or Visual Professionals (roles 7 or 8)
    if (roleIds.some(r => [7, 8].includes(r))) {
      const talent = booking?.assignmentInfo?.selectedTalent?.name?.toLowerCase() || "";

      if (talent.includes("dj")) {
        return "dj";
      }
      if (talent.includes("photo") || talent.includes("video") || talent.includes("visual")) {
        return "visual_professional";
      }
      return "audio_professional";
    }

    return "professional";
  };


  const roleType = getUserRoleType();

  // Accept booking mutation
  const acceptBookingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/bookings/${bookingId}/talent-response`, {
        method: 'POST',
        body: { action: 'accept' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Accepted",
        description: "You've successfully accepted this booking."
      });
      queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
    }
  });

  // Reject booking mutation
  const rejectBookingMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiRequest(`/api/bookings/${bookingId}/talent-response`, {
        method: 'POST',
        body: { action: 'reject', reason }
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Declined",
        description: "You've declined this booking.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
    }
  });

  if (isLoading) {
    return <PerfectLoading message="Loading gig details..." />;
  }

  if (error || !booking) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-semibold">Unable to load booking details</p>
          <p className="text-muted-foreground">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  // Role-specific tab configuration
  const tabs = [
    { value: 'overview', label: 'Overview', icon: <Briefcase className="h-4 w-4" /> },
    { value: 'contracts', label: 'Contracts', icon: <FileText className="h-4 w-4" /> },
    { value: 'payment', label: 'Payment', icon: <DollarSign className="h-4 w-4" /> }
  ];


  function formatEventDates(eventDates: any[]) {
    return eventDates.map(({ eventDate, startTime, endTime }) => {
      const dateObj = new Date(eventDate);
      const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      const formatTime = (time: any) => {
        const [hour, minute] = time?.split(":")?.map(Number);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
      };

      return <p className='whitespace-nowrap' key={eventDate}>{formattedDate} ({formatTime(startTime)} - {formatTime(endTime)})</p>;
    });
  }

  const renderBookingActions = () => {
    const canRespond = booking.assignmentInfo?.status === 'pending' || booking.status === 'pending';

    if (!canRespond) {
      return (
        <Badge variant={booking.assignmentInfo?.status === 'active' ? 'default' : 'secondary'} className='capitalize'>
          {booking.assignmentInfo?.status || booking.status}
        </Badge>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => acceptBookingMutation.mutate()}
          disabled={acceptBookingMutation.isPending}
          data-testid="button-accept-booking"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCounterOfferOpen(true)}
          data-testid="button-counter-offer"
        >
          <Edit className="h-4 w-4 mr-1" />
          Counter Offer
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm('Are you sure you want to decline this booking?')) {
              rejectBookingMutation.mutate('Declined by talent');
            }
          }}
          disabled={rejectBookingMutation.isPending}
          data-testid="button-decline-booking"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Decline
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{booking.eventName}</CardTitle>
              <CardDescription className="mt-2">
                {booking.assignmentInfo && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{booking.assignmentInfo.roleInBooking.name}</Badge>
                    <Badge variant="secondary">
                      <Music className="h-3 w-3 mr-1" />
                      {booking.assignmentInfo.selectedTalent.name}
                    </Badge>
                    {booking.assignmentInfo.isMainBookedTalent && (
                      <Badge variant="default">Main Talent</Badge>
                    )}
                  </div>
                )}
              </CardDescription>
            </div>
            {renderBookingActions()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{booking.eventDate ? format(new Date(booking.eventDate), 'PPP') : 'Date TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{booking.venueName || 'Venue TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{booking.finalPrice ? `$${booking.finalPrice}` : 'Price TBD'}</span>
            </div>
          </div>
          {booking.venueAddress && (
            <p className="text-sm text-muted-foreground mt-2">{booking.venueAddress}</p>
          )}
        </CardContent>
      </Card>

      {/* Role-Adaptive Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.icon}
              <span className="ml-1">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <Card className="bg-white shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Booking Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>

                <div>
                  {/* Event Name */}
                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">Event Name</Label>
                    <p className="text-sm text-gray-800">{booking.eventName}</p>
                  </div>

                  {/* Event Type */}
                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">Event Type</Label>
                    <p className="text-sm text-gray-800">{booking.eventType}</p>
                  </div>
                </div>

                {/* Event Dates */}
                <div className="flex flex-col">
                  <Label className="font-medium text-gray-600">Event Dates</Label>
                  <div className="text-sm text-gray-800">
                    {formatEventDates(booking.eventDates)}
                  </div>
                </div>

                <div>
                  {/* Venue */}
                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">Venue Name</Label>
                    <p className="text-sm text-gray-800">{booking.venueName}</p>
                  </div>

                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">Venue Address</Label>
                    <p className="text-sm text-gray-800">{booking.venueAddress}</p>
                  </div>

                  {/* Requirements */}
                  {booking.requirements && (
                    <div className="flex flex-col">
                      <Label className="font-medium text-gray-600">Requirements</Label>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap border-l-2 border-blue-200 pl-4">
                        {booking.requirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <ContractsTab booking={booking}></ContractsTab>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Track payment status and schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-2xl font-bold">{booking.finalPrice ? `$${booking.finalPrice}` : 'TBD'}</p>
                  </div>
                  <Badge variant={booking?.paymentCompleted ? 'default' : 'secondary'}>
                    {booking?.paymentCompleted ? "Paid" : 'Pending'}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <Label>Payment Schedule</Label>
                  <p className="text-sm text-muted-foreground">
                    50% deposit upon contract signing, 50% on event day
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Counter Offer Dialog */}
      <CounterOfferDialog
        open={counterOfferOpen}
        onOpenChange={setCounterOfferOpen}
        bookingId={bookingId}
        currentPrice={booking.finalPrice}
        onSuccess={() => {
          setCounterOfferOpen(false);
          queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
        }}
      />
    </div>
  );
}