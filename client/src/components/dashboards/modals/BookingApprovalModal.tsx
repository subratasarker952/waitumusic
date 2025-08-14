import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, XCircle, Clock, DollarSign, MapPin, User } from 'lucide-react';

interface BookingApproval {
  id: number;
  eventName: string;
  artistName: string;
  bookerName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  amount: number;
  commissionRate: number;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
  specialRequests?: string;
  technicalRiderRequired: boolean;
}

interface BookingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBooking?: BookingApproval | null;
}

export default function BookingApprovalModal({ isOpen, onClose, selectedBooking }: BookingApprovalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewingBooking, setReviewingBooking] = useState<BookingApproval | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null);

  // Fetch booking approvals
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/admin/booking-approvals'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/booking-approvals');
      return response as BookingApproval[];
    }
  });

  // Approve booking mutation
  const approveBookingMutation = useMutation({
    mutationFn: async ({ id, note, adjustedAmount }: { id: number; note: string; adjustedAmount?: number }) => {
      return await apiRequest(`/api/admin/bookings/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note, adjustedAmount })
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Booking approved successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/booking-approvals'] });
      setReviewingBooking(null);
      setApprovalNote('');
      setAdjustedPrice(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve booking', variant: 'destructive' });
    }
  });

  // Decline booking mutation
  const declineBookingMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      return await apiRequest(`/api/admin/bookings/${id}/decline`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Booking declined successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/booking-approvals'] });
      setReviewingBooking(null);
      setApprovalNote('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to decline booking', variant: 'destructive' });
    }
  });

  const handleApprove = (booking: BookingApproval) => {
    if (!approvalNote.trim()) {
      toast({ title: 'Error', description: 'Please add an approval note', variant: 'destructive' });
      return;
    }
    approveBookingMutation.mutate({ 
      id: booking.id, 
      note: approvalNote,
      adjustedAmount: adjustedPrice || undefined
    });
  };

  const handleDecline = (booking: BookingApproval) => {
    if (!approvalNote.trim()) {
      toast({ title: 'Error', description: 'Please add a decline reason', variant: 'destructive' });
      return;
    }
    declineBookingMutation.mutate({ id: booking.id, note: approvalNote });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      declined: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const approvedBookings = bookings?.filter(b => b.status === 'approved') || [];
  const declinedBookings = bookings?.filter(b => b.status === 'declined') || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Approvals
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="declined">
              Declined ({declinedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 flex-1">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Date & Venue</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : pendingBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No pending bookings for approval
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.eventName}</p>
                            <p className="text-sm text-muted-foreground">
                              Booked by {booking.bookerName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{booking.artistName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(booking.eventDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {booking.venue}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{formatCurrency(booking.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.commissionRate}% commission
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(booking.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReviewingBooking(booking);
                              setAdjustedPrice(booking.amount);
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 flex-1">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No approved bookings
                      </TableCell>
                    </TableRow>
                  ) : (
                    approvedBookings.map((booking) => {
                      const statusBadge = getStatusBadge(booking.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <p className="font-medium">{booking.eventName}</p>
                          </TableCell>
                          <TableCell>{booking.artistName}</TableCell>
                          <TableCell>
                            {new Date(booking.eventDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(booking.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${statusBadge.color}`} />
                              <Badge variant={statusBadge.variant}>
                                Approved
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="declined" className="space-y-4 flex-1">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declinedBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No declined bookings
                      </TableCell>
                    </TableRow>
                  ) : (
                    declinedBookings.map((booking) => {
                      const statusBadge = getStatusBadge(booking.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <p className="font-medium">{booking.eventName}</p>
                          </TableCell>
                          <TableCell>{booking.artistName}</TableCell>
                          <TableCell>
                            {new Date(booking.eventDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(booking.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${statusBadge.color}`} />
                              <Badge variant={statusBadge.variant}>
                                Declined
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Booking Modal */}
        {reviewingBooking && (
          <Dialog open={!!reviewingBooking} onOpenChange={() => setReviewingBooking(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Booking: {reviewingBooking.eventName}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Event Name</Label>
                        <p className="font-medium">{reviewingBooking.eventName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date & Time</Label>
                        <p>{new Date(reviewingBooking.eventDate).toLocaleDateString()} at {reviewingBooking.eventTime}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Venue</Label>
                        <p>{reviewingBooking.venue}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p>{reviewingBooking.location}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Artist</Label>
                        <p className="font-medium">{reviewingBooking.artistName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Booked By</Label>
                        <p>{reviewingBooking.bookerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Submitted</Label>
                        <p>{new Date(reviewingBooking.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Technical Rider</Label>
                        <Badge variant={reviewingBooking.technicalRiderRequired ? 'default' : 'secondary'}>
                          {reviewingBooking.technicalRiderRequired ? 'Required' : 'Not Required'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Financial Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Original Amount</Label>
                        <p className="text-2xl font-bold">{formatCurrency(reviewingBooking.amount)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Commission ({reviewingBooking.commissionRate}%)</Label>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(reviewingBooking.amount * (reviewingBooking.commissionRate / 100))}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Artist Payout</Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(reviewingBooking.amount * (1 - reviewingBooking.commissionRate / 100))}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="adjusted-price">Adjust Booking Amount (Optional)</Label>
                      <Input
                        id="adjusted-price"
                        type="number"
                        placeholder="Enter adjusted amount"
                        value={adjustedPrice || ''}
                        onChange={(e) => setAdjustedPrice(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Special Requests */}
                {reviewingBooking.specialRequests && (
                  <div>
                    <Label className="text-sm font-medium">Special Requests</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{reviewingBooking.specialRequests}</p>
                    </div>
                  </div>
                )}

                {/* Admin Note */}
                <div>
                  <Label htmlFor="approval-note">Admin Note</Label>
                  <Textarea
                    id="approval-note"
                    placeholder="Add your approval/decline comments..."
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setReviewingBooking(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDecline(reviewingBooking)}
                    disabled={declineBookingMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleApprove(reviewingBooking)}
                    disabled={approveBookingMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}