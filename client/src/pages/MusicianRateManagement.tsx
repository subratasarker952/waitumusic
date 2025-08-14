import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MusicianRateResponse from '@/components/booking/MusicianRateResponse';
import { Calendar, DollarSign, Music, User, Clock } from 'lucide-react';

interface BookingWithRate {
  id: number;
  artistName: string;
  eventDate: string;
  eventLocation: string;
  status: string;
  rateInfo?: {
    adminSetRate: number;
    originalCurrency: string;
    originalAmount: number;
    rateStatus: string;
    musicianResponse?: string;
    musicianResponseMessage?: string;
    rateNotes?: string;
    rateSetAt?: string;
    musicianResponseAt?: string;
  };
}

export default function MusicianRateManagement() {
  const [bookingsWithRates, setBookingsWithRates] = useState<BookingWithRate[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load currencies
      const currenciesResponse = await apiRequest('/api/currencies');
      if (currenciesResponse.ok) {
        const currencyData = await currenciesResponse.json();
        setCurrencies(currencyData);
      }

      // Load bookings with rate information for the current musician
      const bookingsResponse = await apiRequest(`/api/musicians/${user.id}/booking-rates`);

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookingsWithRates(bookingsData);
      }
    } catch (error) {
      console.error('Error loading musician rate data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load booking rate information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmitted = () => {
    loadData(); // Refresh data after response submission
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin_set':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingRates = bookingsWithRates.filter(b => b.rateInfo?.rateStatus === 'admin_set' && !['accepted', 'declined'].includes(b.rateInfo?.musicianResponse || ''));
  const respondedRates = bookingsWithRates.filter(b => b.rateInfo && ['accepted', 'declined', 'counter_offer'].includes(b.rateInfo?.musicianResponse || ''));
  const noRatesSet = bookingsWithRates.filter(b => !b.rateInfo || b.rateInfo.rateStatus === 'pending');

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>Loading your performance rate information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Performance Rate Management</h1>
          <p className="text-gray-600">Manage your booking rates and responses</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{pendingRates.length}</p>
                <p className="text-sm text-gray-600">Pending Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{respondedRates.length}</p>
                <p className="text-sm text-gray-600">Responded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-600">{noRatesSet.length}</p>
                <p className="text-sm text-gray-600">Awaiting Rate Setting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Rate Responses */}
      {pendingRates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Action Required - Pending Rate Responses</h2>
          <div className="space-y-4">
            {pendingRates.map((booking) => (
              <div key={booking.id} className="border-2 border-red-200 rounded-lg p-1">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {booking.artistName}
                      </div>
                      <Badge className={getStatusColor(booking.rateInfo?.rateStatus || '')}>
                        {booking.rateInfo?.rateStatus?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </div>
                        <span>{booking.eventLocation}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {booking.rateInfo && (
                      <MusicianRateResponse
                        bookingId={booking.id}
                        musicianId={user?.id || 0}
                        rateInfo={booking.rateInfo}
                        currencies={currencies}
                        onResponseSubmitted={handleResponseSubmitted}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previously Responded Rates */}
      {respondedRates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Previous Rate Responses</h2>
          <div className="grid gap-4">
            {respondedRates.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {booking.artistName}
                    </div>
                    <Badge className={getStatusColor(booking.rateInfo?.musicianResponse || '')}>
                      {booking.rateInfo?.musicianResponse?.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.eventDate).toLocaleDateString()}
                      </div>
                      <span>{booking.eventLocation}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {booking.rateInfo && (
                    <MusicianRateResponse
                      bookingId={booking.id}
                      musicianId={user?.id || 0}
                      rateInfo={booking.rateInfo}
                      currencies={currencies}
                      onResponseSubmitted={handleResponseSubmitted}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Without Rate Information */}
      {noRatesSet.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-600">Awaiting Rate Setting</h2>
          <div className="grid gap-4">
            {noRatesSet.map((booking) => (
              <Card key={booking.id} className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-semibold">{booking.artistName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.eventDate).toLocaleDateString()}
                          </div>
                          <span>{booking.eventLocation}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Awaiting Admin
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bookingsWithRates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Booking Assignments</h3>
            <p className="text-gray-500">You don't have any booking assignments with rate information yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}