import React, { useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Calendar, MapPin, DollarSign, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TalentBooking {
  id: number;
  eventName: string;
  eventType: string;
  eventDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  status: string;
  totalBudget: string | null;
  finalPrice: string | null;
  assignmentRole: number;
  assignmentStatus: string;
  assignedAt: string;
}

interface BookingDetails {
  booking: TalentBooking;
  contracts: any[];
  technicalRiders: any[];
  signatures: any[];
  assignment: any;
}

export function TalentBookingView() {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseAction, setResponseAction] = useState<'approve' | 'reject' | 'counter_offer'>('approve');
  const [counterOffer, setCounterOffer] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch talent's assigned bookings
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['talent-bookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Handle token expiration
          localStorage.removeItem('token');
          const { navigate } = useNavigation();
          navigate('/login');
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error.message.includes('Session expired')) return false;
      return failureCount < 3;
    }
  });

  // Fetch detailed booking information
  const { data: bookingDetails } = useQuery({
    queryKey: ['booking-details', selectedBooking],
    queryFn: async () => {
      if (!selectedBooking) return null;
      const response = await fetch(`/api/bookings/${selectedBooking}/talent-view`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch booking details');
      return response.json();
    },
    enabled: !!selectedBooking
  });

  // Submit talent response
  const responseMutation = useMutation({
    mutationFn: async (data: { action: string; counterOffer?: string; notes?: string }) => {
      const response = await fetch(`/api/bookings/${selectedBooking}/talent-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to submit response');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response Submitted",
        description: "Your response has been sent to the booking coordinator."
      });
      setResponseDialog(false);
      setCounterOffer('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['talent-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-details', selectedBooking] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive"
      });
    }
  });

  const handleResponse = () => {
    responseMutation.mutate({
      action: responseAction,
      counterOffer: responseAction === 'counter_offer' ? counterOffer : undefined,
      notes
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'approve':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'reject':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Badge variant="outline" className="text-sm">
          {bookings?.length || 0} Active Assignments
        </Badge>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 text-center">
              You don't have any booking assignments yet. When you're assigned to bookings, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking: TalentBooking) => (
            <Card key={booking.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{booking.eventName}</CardTitle>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status}</span>
                  </Badge>
                </div>
                <CardDescription>{booking.eventType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {booking.eventDate 
                    ? format(new Date(booking.eventDate), 'PPP')
                    : 'Date TBD'
                  }
                </div>
                
                {booking.venueName && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {booking.venueName}
                  </div>
                )}
                
                {booking.finalPrice && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${parseFloat(booking.finalPrice).toLocaleString()}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  Role: {booking.assignmentRole || 'Talent'}
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedBooking(booking.id)}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {booking.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking.id);
                        setResponseDialog(true);
                      }}
                      className="flex-1"
                    >
                      Respond
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Details Dialog */}
      {selectedBooking && bookingDetails && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{bookingDetails.booking.eventName}</DialogTitle>
              <DialogDescription>
                Complete booking details and documents
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="signatures">Approvals</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Event Type</Label>
                    <p className="text-sm text-gray-600">{bookingDetails.booking.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(bookingDetails.booking.status)}>
                      {bookingDetails.booking.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Venue</Label>
                    <p className="text-sm text-gray-600">
                      {bookingDetails.booking.venueName || 'TBD'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <p className="text-sm text-gray-600">
                      {bookingDetails.booking.eventDate 
                        ? format(new Date(bookingDetails.booking.eventDate), 'PPP')
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contracts" className="space-y-4">
                {bookingDetails.contracts.length === 0 ? (
                  <p className="text-gray-600">No contracts generated yet.</p>
                ) : (
                  bookingDetails.contracts.map((contract: any) => (
                    <Card key={contract.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{contract.contractType}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Contract
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                {bookingDetails.technicalRiders.length === 0 ? (
                  <p className="text-gray-600">No technical riders generated yet.</p>
                ) : (
                  bookingDetails.technicalRiders.map((rider: any) => (
                    <Card key={rider.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">Technical Rider</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Technical Rider
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="signatures" className="space-y-4">
                {bookingDetails.signatures.length === 0 ? (
                  <p className="text-gray-600">No signatures collected yet.</p>
                ) : (
                  bookingDetails.signatures.map((signature: any) => (
                    <Card key={signature.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <span>{signature.signerName}</span>
                          <Badge variant="outline">Signed</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Response Dialog */}
      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Booking</DialogTitle>
            <DialogDescription>
              Please review the booking details and provide your response.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Your Response</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={responseAction === 'approve' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setResponseAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={responseAction === 'reject' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setResponseAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  variant={responseAction === 'counter_offer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setResponseAction('counter_offer')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Counter Offer
                </Button>
              </div>
            </div>

            {responseAction === 'counter_offer' && (
              <div>
                <Label htmlFor="counterOffer">Counter Offer Details</Label>
                <Textarea
                  id="counterOffer"
                  placeholder="Please provide your counter offer details (rate, terms, etc.)"
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional comments or requirements"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setResponseDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleResponse}
                disabled={responseMutation.isPending}
              >
                {responseMutation.isPending ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}