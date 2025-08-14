import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Eye
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

interface MobileBookingDashboardProps {
  onCreateBooking: () => void;
}

export default function MobileBookingDashboard({ onCreateBooking }: MobileBookingDashboardProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings'],
  });

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const filterBookings = (bookings: any[]) => {
    let filtered = bookings;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status?.toLowerCase() === activeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(booking => 
        booking.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.venueName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const upcomingBookings = filterBookings(bookings.filter((booking: any) => 
    new Date(booking.eventDate || booking.createdAt) >= new Date()
  ));

  const pastBookings = filterBookings(bookings.filter((booking: any) => 
    new Date(booking.eventDate || booking.createdAt) < new Date()
  ));

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="mb-3 border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">{booking.eventName}</h3>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(booking.status)}
              <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                {booking.status || 'Pending'}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Booking #{booking.id}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(new Date(booking.eventDate || booking.createdAt))}</span>
          </div>
          
          {booking.venueName && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{booking.venueName}</span>
            </div>
          )}
          
          {booking.totalBudget && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{booking.totalBudget}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{booking.artistName || 'Artist TBD'}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          {booking.status?.toLowerCase() === 'pending' && (
            <Button size="sm" className="flex-1">
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const FilterTabs = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {[
        { key: 'all', label: 'All', count: bookings.length },
        { key: 'pending', label: 'Pending', count: bookings.filter((b: any) => b.status?.toLowerCase() === 'pending').length },
        { key: 'confirmed', label: 'Confirmed', count: bookings.filter((b: any) => b.status?.toLowerCase() === 'confirmed').length },
        { key: 'cancelled', label: 'Cancelled', count: bookings.filter((b: any) => b.status?.toLowerCase() === 'cancelled').length }
      ].map(filter => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter(filter.key)}
          className="shrink-0"
        >
          {filter.label}
          {filter.count > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 text-xs">
              {filter.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-gray-600">Manage your events and performances</p>
        </div>
        <Button onClick={onCreateBooking} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white"
        />
      </div>

      {/* Filters */}
      <FilterTabs />

      {/* Booking Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-4">Create your first booking to get started</p>
                  <Button onClick={onCreateBooking}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div>
                {upcomingBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="past">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {pastBookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past bookings</h3>
                  <p className="text-gray-600">Your completed bookings will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {pastBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}