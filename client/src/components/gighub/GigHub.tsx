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

// Role-specific components
import { SetlistViewer } from './components/SetlistViewer';
import { SpleeterInterface } from './components/SpleeterInterface';
import { CounterOfferDialog } from './components/CounterOfferDialog';
import { MediaHubSection } from './components/MediaHubSection';

interface BookingDetails {
  id: number;
  eventName: string;
  eventDate: string | null;
  eventType: string;
  venueName: string | null;
  venueAddress: string | null;
  status: string;
  totalBudget: string | null;
  finalPrice: string | null;
  requirements: string | null;
  primaryArtist: {
    userId: number;
    stageName: string;
  };
  workflowData: any;
  assignmentInfo?: {
    roleInBooking: any;
    selectedTalent: any;
    isMainBookedTalent: boolean;
    assignedGroup: string;
    assignedChannel: number;
    status: string;
  };
}

export default function GigHub() {
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
      const response = await apiRequest(`/api/bookings/${bookingId}/talent-view`);
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
  const getTabs = () => {
    const baseTabs = [
      { value: 'overview', label: 'Overview', icon: <Briefcase className="h-4 w-4" /> },
      { value: 'contracts', label: 'Contracts', icon: <FileText className="h-4 w-4" /> },
      { value: 'mediahub', label: 'MediaHub', icon: <FileText className="h-4 w-4" /> },
      { value: 'payment', label: 'Payment', icon: <DollarSign className="h-4 w-4" /> }
    ];

    switch (roleType) {
      case 'performer':
        return [
          ...baseTabs.slice(0, 2),
          { value: 'setlist', label: 'Setlist', icon: <Music className="h-4 w-4" /> },
          { value: 'charts', label: 'Chord Charts', icon: <BookOpen className="h-4 w-4" /> },
          { value: 'technical', label: 'Technical', icon: <Layout className="h-4 w-4" /> },
          ...baseTabs.slice(2)
        ];

      case 'dj':
        return [
          ...baseTabs.slice(0, 2),
          { value: 'tracks', label: 'Tracks', icon: <Headphones className="h-4 w-4" /> },
          { value: 'spleeter', label: 'Stem Separation', icon: <SplitSquareVertical className="h-4 w-4" /> },
          ...baseTabs.slice(2)
        ];

      case 'visual_professional':
        return [
          ...baseTabs.slice(0, 2),
          { value: 'shooting-guide', label: 'Shooting Guide', icon: <Camera className="h-4 w-4" /> },
          { value: 'stage-layout', label: 'Stage Layout', icon: <Layout className="h-4 w-4" /> },
          ...baseTabs.slice(2)
        ];

      default:
        return baseTabs;
    }
  };

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
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${getTabs().length}, 1fr)` }}>
          {getTabs().map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.icon}
              <span className="ml-1">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <Card className="p-6 bg-white shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Booking Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
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

              {/* Event Dates */}
              <div className="flex flex-col">
                <Label className="font-medium text-gray-600">Event Dates</Label>
                <div className="text-sm text-gray-800">
                  {formatEventDates(booking.eventDates)}
                </div>
              </div>

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

              {/* Assignment Info */}
              {booking.assignmentInfo && (
                <div className="flex flex-col space-y-2 border-t border-gray-200 pt-4">
                  <Label className="font-medium text-gray-600">Your Assignment Details</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                    <div>
                      <span className="font-medium text-gray-600">Group:</span>{" "}
                      {booking.assignmentInfo.assignedGroup}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Channel:</span>{" "}
                      {booking.assignmentInfo.assignedChannel || "TBD"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>



        {/* Performer-specific tabs */}
        {roleType === 'performer' && (
          <>
            <TabsContent value="setlist">
              <SetlistViewer bookingId={bookingId} workflowData={booking.workflowData} />
            </TabsContent>
            <TabsContent value="charts">
              <Card>
                <CardHeader>
                  <CardTitle>Chord Charts</CardTitle>
                  <CardDescription>View chord charts for your setlist songs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Chord charts will be displayed here for each song in your setlist.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="technical">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {config?.technicalRider?.allowAssignedTalentAccess ? (
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Technical Rider PDF
                      </Button>
                    ) : (
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground text-center">
                          Technical rider download is restricted. Contact the event organizer for technical requirements.
                        </p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
                      <Layout className="h-4 w-4 mr-2" />
                      View Stage Plot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {/* DJ-specific tabs */}
        {roleType === 'dj' && (
          <>
            <TabsContent value="tracks">
              <SpleeterInterface bookingId={bookingId} songs={booking.workflowData?.djSongs || []} />
            </TabsContent>
            <TabsContent value="spleeter">
              <Card>
                <CardHeader>
                  <CardTitle>Stem Separation Tools</CardTitle>
                  <CardDescription>
                    Use AI-powered Spleeter to separate tracks into stems for mixing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SpleeterInterface bookingId={bookingId} songs={booking.workflowData?.djSongs || []} />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {/* Visual Professional tabs */}
        {roleType === 'visual_professional' && (
          <>
            <TabsContent value="shooting-guide">
              <Card>
                <CardHeader>
                  <CardTitle>Shooting Guide</CardTitle>
                  <CardDescription>Photography and videography guidelines for this event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Key Moments to Capture</Label>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Artist entrances and exits</li>
                        <li>Crowd reactions during key songs</li>
                        <li>Special effects and lighting moments</li>
                        <li>Behind-the-scenes preparation</li>
                      </ul>
                    </div>
                    <div>
                      <Label>Technical Settings</Label>
                      <p className="text-sm text-muted-foreground">Recommended camera settings and equipment list will be provided here.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stage-layout">
              <Card>
                <CardHeader>
                  <CardTitle>Stage Layout & Positioning</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={`/api/bookings/${bookingId}/stage-plot`}
                    alt="Stage Plot"
                    className="w-full rounded-lg border"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {/* Common tabs for all roles */}
        <TabsContent value="mediahub">
          <MediaHubSection bookingId={bookingId} />
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>View and sign performance contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking?.contracts?.length > 0 ? (
                  booking.contracts.map((contract: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{contract.contractType === "booking_agreement" ? "Booking Agreement" : 'Performance Agreement'}</h4>
                        <p className="text-sm text-muted-foreground capitalize">Status: {contract.status || 'Pending'}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No contracts available yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
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