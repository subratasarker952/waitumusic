import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Music, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { PerfectLoading } from '@/components/ui/perfect-loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BookingAssignment {
  id: number;
  bookingId: number;
  bookingEventDate: string;
  bookingEventName: string;
  bookingVenueName: string;
  bookingVenueAddress: string;
  roleInBooking: string;
  selectedTalent: string;
  instrumentName: string;
  status: string;
  isMainBookedTalent: boolean;
  assignedGroup: string;
  assignedChannel: number;
}

export function GigComponent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch bookings where user is assigned
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['/api/my-gigs'],
    enabled: !!user
  });

  if (isLoading) {
    return <PerfectLoading message="Loading your gigs..." />;
  }

  const activeGigs = Array.isArray(assignments) 
    ? assignments.filter((a: BookingAssignment) => 
        new Date(a.bookingEventDate) >= new Date()
      )
    : [];
  
  const pastGigs = Array.isArray(assignments) 
    ? assignments.filter((a: BookingAssignment) => 
        new Date(a.bookingEventDate) < new Date()
      )
    : [];

  const GigCard = ({ gig }: { gig: BookingAssignment }) => (
    <Card data-testid={`card-gig-${gig.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{gig.bookingEventName}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {gig.isMainBookedTalent && (
                <Badge variant="default">Main Talent</Badge>
              )}
              <Badge variant="outline">{gig.roleInBooking}</Badge>
              {gig.instrumentName && (
                <Badge variant="secondary">
                  <Music className="h-3 w-3 mr-1" />
                  {gig.instrumentName}
                </Badge>
              )}
            </div>
          </div>
          <Badge 
            variant={gig.status === 'confirmed' ? 'default' : 'secondary'}
            data-testid={`status-gig-${gig.id}`}
          >
            {gig.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(gig.bookingEventDate), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{gig.bookingVenueName}</span>
          </div>
          {gig.bookingVenueAddress && (
            <div className="text-xs ml-6">{gig.bookingVenueAddress}</div>
          )}
          {(gig.assignedGroup || gig.assignedChannel) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Technical Details:</span>
              {gig.assignedGroup && <span>Group {gig.assignedGroup}</span>}
              {gig.assignedChannel && <span>Channel {gig.assignedChannel}</span>}
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation(`/bookings/${gig.bookingId}`)}
            data-testid={`button-view-booking-${gig.id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Gig
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Gigs</h2>
        <p className="text-muted-foreground">
          View all bookings where you've been assigned as talent
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming-gigs">
            Upcoming ({activeGigs.length})
          </TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past-gigs">
            Past ({pastGigs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {activeGigs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming gigs</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGigs.map((gig: BookingAssignment) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastGigs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No past gigs</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pastGigs.map((gig: BookingAssignment) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}