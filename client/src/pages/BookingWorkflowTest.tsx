import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingWorkflow from '@/components/booking/BookingWorkflow';
import ContractGenerator from '@/components/booking/ContractGenerator';
import PrivateProfileSection from '@/components/booking/PrivateProfileSection';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, FileText, User, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

export default function BookingWorkflowTest() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [testUserId, setTestUserId] = useState<number>(16); // Default to Lí-Lí Octave
  const [selectedContractType, setSelectedContractType] = useState<'booking_agreement' | 'performance_agreement' | 'technical_rider'>('technical_rider');

  // Get all bookings for testing
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings/all'],
    enabled: true
  });

  // Get user data for profile testing
  const { data: userData } = useQuery({
    queryKey: ['/api/users', testUserId],
    enabled: testUserId > 0
  });

  const createTestBooking = async () => {
    try {
      const response = await apiRequest('/api/bookings/guest', {
        method: 'POST',
        body: JSON.stringify({
          guestName: 'Test User',
          guestEmail: 'test@example.com',
          guestPhone: '555-0123',
          primaryArtistUserId: 16, // Lí-Lí Octave
          eventName: 'Test Event for Workflow',
          eventType: 'Concert',
          eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          venueName: 'Test Venue',
          venueAddress: '123 Test Street, Test City',
          requirements: 'Full sound system, lighting rig, professional setup',
          totalBudget: 5000,
          createAccount: false
        })
      });

      if (response.ok) {
        const newBooking = await response.json();
        toast({
          title: "Test Booking Created",
          description: `Booking ID: ${newBooking.id} created successfully for testing.`
        });
        setSelectedBookingId(newBooking.id);
        // Refresh bookings list
        window.location.reload();
      } else {
        throw new Error('Failed to create test booking');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test booking.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">
            Complete booking workflow from creation to contract generation and payment processing
          </p>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/dashboard')}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
        <Button onClick={createTestBooking}>
          <Calendar className="h-4 w-4 mr-2" />
          Create Test Booking
        </Button>
      </div>

      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">Booking Workflow</TabsTrigger>
          <TabsTrigger value="contracts">Contract Generator</TabsTrigger>
          <TabsTrigger value="profiles">Private Profiles</TabsTrigger>
          <TabsTrigger value="testing">Test Controls</TabsTrigger>
        </TabsList>

        {/* Booking Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Test Booking</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookings.map((booking: any) => (
                      <Card 
                        key={booking.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedBookingId === booking.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedBookingId(booking.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">#{booking.id}</span>
                              <Badge variant="outline">{booking.status || 'pending'}</Badge>
                            </div>
                            <p className="text-sm font-medium">{booking.eventName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.eventDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">{booking.venueName}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {bookings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No bookings found. Create a test booking to get started.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedBookingId && (
            <BookingWorkflow 
              bookingId={selectedBookingId}
              onStatusChange={(status) => {
                toast({
                  title: "Booking Status Updated",
                  description: `Booking status changed to: ${status}`
                });
              }}
            />
          )}
        </TabsContent>

        {/* Contract Generator Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Type Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {['booking_agreement', 'performance_agreement', 'technical_rider'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedContractType === type ? "default" : "outline"}
                      onClick={() => setSelectedContractType(type as any)}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      <span className="text-sm">
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </Button>
                  ))}
                </div>
                
                {!selectedBookingId && (
                  <div className="text-center py-4 text-muted-foreground">
                    Please select a booking from the Workflow tab first.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedBookingId && (
            <ContractGenerator
              bookingId={selectedBookingId}
              contractType={selectedContractType}
              onGenerated={() => {
                toast({
                  title: "Contract Generated",
                  description: `${selectedContractType.replace('_', ' ')} has been successfully generated.`
                });
              }}
            />
          )}
        </TabsContent>

        {/* Private Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test User Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      type="number"
                      value={testUserId}
                      onChange={(e) => setTestUserId(parseInt(e.target.value))}
                      placeholder="Enter user ID to test"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quick Select</Label>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setTestUserId(16)}>
                        Lí-Lí Octave (16)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setTestUserId(17)}>
                        JCro (17)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setTestUserId(1)}>
                        Superadmin (1)
                      </Button>
                    </div>
                  </div>
                </div>
                
                {userData && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="font-medium">{userData.fullName}</p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <PrivateProfileSection
            userId={testUserId}
            userRole="managed_artist" // For testing purposes
            isOwner={true} // Enable editing for testing
            isAuthorized={true} // Show private sections for testing
          />
        </TabsContent>

        {/* Testing Controls Tab */}
        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    disabled={!selectedBookingId}
                    onClick={() => {
                      if (selectedBookingId) {
                        apiRequest(`/api/bookings/${selectedBookingId}/approve`, { method: 'POST' })
                          .then(res => res.json())
                          .then(() => toast({ title: "Success", description: "Booking approved" }))
                          .catch(() => toast({ title: "Error", description: "Failed to approve", variant: "destructive" }));
                      }
                    }}
                  >
                    Approve Booking
                  </Button>
                  
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled={!selectedBookingId}
                    onClick={() => {
                      if (selectedBookingId) {
                        apiRequest(`/api/bookings/${selectedBookingId}/generate-technical-rider`, { method: 'POST' })
                          .then(res => res.json())
                          .then(() => toast({ title: "Success", description: "Technical rider generated" }))
                          .catch(() => toast({ title: "Error", description: "Failed to generate", variant: "destructive" }));
                      }
                    }}
                  >
                    Generate Technical Rider
                  </Button>
                  
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled={!selectedBookingId}
                    onClick={() => {
                      if (selectedBookingId) {
                        fetch(`/api/bookings/${selectedBookingId}/generate-contracts`, { method: 'POST' })
                          .then(res => res.json())
                          .then(() => toast({ title: "Success", description: "Contracts generated" }))
                          .catch(() => toast({ title: "Error", description: "Failed to generate", variant: "destructive" }));
                      }
                    }}
                  >
                    Generate All Contracts
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Selected Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedBookingId ? `Booking ID: ${selectedBookingId}` : 'No booking selected'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Test User</Label>
                    <p className="text-sm text-muted-foreground">
                      User ID: {testUserId} ({userData?.fullName || 'Loading...'})
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Contract Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedContractType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Features Tested</Label>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>✓ Booking workflow visualization</li>
                      <li>✓ Contract generation (3 types)</li>
                      <li>✓ Private profile management</li>
                      <li>✓ Technical rider auto-population</li>
                      <li>✓ PDF receipt generation</li>
                      <li>✓ Admin approval workflow</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}