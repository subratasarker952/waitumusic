import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Calendar, MapPin, Clock, DollarSign, User } from 'lucide-react';

interface BookingData {
  id: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  clientName: string;
  clientEmail: string;
  totalBudget: string;
  requirements: string;
  status: string;
}

interface BookingResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingData | null;
  onResponse: (bookingId: string, action: 'accept' | 'decline', message?: string) => void;
}

export default function BookingResponseModal({ 
  open, 
  onOpenChange, 
  booking,
  onResponse 
}: BookingResponseModalProps) {
  const { toast } = useToast();
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResponse = async (action: 'accept' | 'decline') => {
    if (!booking) return;

    setIsSubmitting(true);
    try {
      await onResponse(booking.id, action, responseMessage);
      toast({
        title: `Booking ${action === 'accept' ? 'Accepted' : 'Declined'}`,
        description: `You have ${action}ed the booking for ${booking.eventName}.`,
      });
      onOpenChange(false);
      setResponseMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Request Response
          </DialogTitle>
          <DialogDescription>
            Review and respond to this booking request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{booking.eventName}</h3>
              <Badge variant="outline" className="capitalize">
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(booking.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{booking.venueName}</p>
                    <p className="text-muted-foreground">{booking.venueAddress}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{booking.clientName}</p>
                    <p className="text-muted-foreground">{booking.clientEmail}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{booking.eventType}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">${booking.totalBudget} budget</span>
                </div>
              </div>
            </div>

            {booking.requirements && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Special Requirements:</Label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {booking.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Response Message */}
          <div className="space-y-2">
            <Label htmlFor="response">Response Message (Optional)</Label>
            <Textarea
              id="response"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add a personal message to the client..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent to the client along with your response.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={() => handleResponse('accept')}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept Booking
            </Button>

            <Button
              variant="outline"
              onClick={() => handleResponse('decline')}
              disabled={isSubmitting}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline Booking
            </Button>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Next Steps:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>If accepted, a contract will be automatically generated</li>
                <li>You'll receive a calendar invite for the event</li>
                <li>Payment details will be coordinated through the platform</li>
                <li>Technical rider requirements will be sent to the venue</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}