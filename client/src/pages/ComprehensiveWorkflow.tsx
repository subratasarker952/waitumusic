import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AuthorizedRoute from '@/components/AuthorizedRoute';
import BookingWorkflow from '@/components/booking/ComprehensiveBookingWorkflow';
import { 
  Calendar, ArrowLeft, Settings, Users, FileText, 
  CheckCircle, AlertTriangle, Clock, MapPin, Sliders, 
  Music, Zap, Move, Hash 
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function ComprehensiveWorkflow() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Fetch all bookings for selection
  const { data: availableBookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery<any[]>({
    queryKey: ['/api/bookings/all'],
    enabled: !!user && [1, 2].includes(user.roleId) // Only admins and superadmins
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if bookings fetch failed
  if (bookingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Bookings</h2>
          <p className="text-muted-foreground mb-4">Failed to load booking data</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthorizedRoute>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Comprehensive Booking Workflow</h1>
              <p className="text-muted-foreground">Advanced 6-step booking management system</p>
            </div>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            <Settings className="h-3 w-3 mr-1" />
            {user?.roleId === 1 ? 'Superadmin' : 'Admin'} Access
          </Badge>
        </div>

        {/* Booking Selection Section */}
        {!selectedBookingId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Booking for Workflow Management
              </CardTitle>
              <p className="text-muted-foreground">
                Choose a booking to begin the comprehensive 6-step workflow process
              </p>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">Loading available bookings...</div>
                </div>
              ) : availableBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableBookings.map((booking: any) => (
                    <Card 
                      key={booking.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                      onClick={() => setSelectedBookingId(booking.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg truncate">
                                {booking.eventName || 'Untitled Event'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.primaryArtist?.stageName || 'No artist assigned'}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Booking #{booking.id}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.eventDate 
                                  ? new Date(booking.eventDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'Date TBD'
                                }
                              </span>
                            </div>
                            
                            {booking.venueName && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{booking.venueName}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {/* Calculate total assigned talent including primary artist */}
                                {(booking.assignedMusicians?.length || 0) + 1} talent assigned
                              </span>
                            </div>
                            
                            {booking.totalBudget && (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-green-600">
                                  ${parseFloat(booking.totalBudget).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingId(booking.id);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Start Workflow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Bookings Available</h3>
                  <p className="text-muted-foreground mb-4">
                    There are currently no bookings available for workflow management.
                  </p>
                  <Button onClick={() => setLocation('/booking')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Create New Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Workflow Section */}
        {selectedBookingId && (
          <div className="space-y-6">
            {/* Current Booking Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Workflow - Booking #{selectedBookingId}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedBookingId(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Change Booking
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentBooking = availableBookings.find((b: any) => b.id === selectedBookingId);
                  return currentBooking ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Event</p>
                        <p className="font-semibold">{currentBooking.eventName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Artist</p>
                        <p className="font-semibold">{currentBooking.primaryArtist?.stageName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                        <p className="font-semibold">
                          {new Date(currentBooking.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(currentBooking.status)}>
                          {currentBooking.status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading booking details...</p>
                  );
                })()}
              </CardContent>
            </Card>



            {/* Comprehensive Workflow Component */}
            <BookingWorkflow 
              bookingId={selectedBookingId}
              userRole={user?.roleId === 1 ? 'superadmin' : 'admin'}
              canEdit={true}
              onStatusChange={(status) => {
                console.log('Booking status changed to:', status);
                // Refresh bookings data or handle status change
              }}
            />
          </div>
        )}
      </div>
    </AuthorizedRoute>
  );
}