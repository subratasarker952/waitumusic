import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Music, 
  Users, 
  Mic2, 
  CheckCircle,
  Star,
  Crown,
  Shield,
  User,
  Phone,
  Mail,
  DollarSign,
  Plus,
  X,
  Info,
  Smartphone,
  Monitor,
  Palette,
  Check
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { format, addDays, isSameDay, isBefore, startOfDay, isWeekend, isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';

// Booking form schema for popup
const bookingFormSchema = z.object({
  guestName: z.string().min(2, 'Full name is required'),
  guestEmail: z.string().email('Valid email is required'),
  guestPhone: z.string().optional(),
  eventName: z.string().min(1, 'Event name is required'),
  eventType: z.string().min(1, 'Please select event type'),
  venueName: z.string().min(1, 'Venue name is required'),
  venueAddress: z.string().min(1, 'Venue address is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  expectedAttendees: z.string().optional(),
  additionalNotes: z.string().optional(),
  budget: z.string().optional(),
  createAccount: z.boolean().default(false),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface Artist {
  id: number;
  userId: number;
  stageName: string; // Primary stage name from API
  stageNames?: string[]; // Alternative stage names array (optional)
  primaryGenre: string | null;
  basePrice: string | null;
  isManaged: boolean | null;
  bookingFormPictureUrl?: string;
  user?: {
    fullName: string;
    email: string;
  };
  userProfile?: {
    bio: string | null;
    avatarUrl: string | null;
  };
  profile?: {
    avatarUrl: string | null;
  };
}

interface Musician {
  id: number;
  userId: number;
  basePrice: string | null;
  isManaged: boolean | null;
  instruments: string[];
  stageNames?: string[]; // Musicians can also have stage names
  bookingFormPictureUrl?: string;
  user?: {
    fullName: string;
    email: string;
  };
  userProfile?: {
    bio: string | null;
    avatarUrl: string | null;
  };
  profile?: {
    avatarUrl: string | null;
  };
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'musician' | 'equipment' | 'service';
}

// Add-ons would be loaded from API in production
const getAvailableAddOns = (): AddOn[] => {
  // Return empty array - add-ons should come from database
  return [];
};

// Helper function to get display name for artists/musicians
const getDisplayName = (talent: Artist | Musician): string => {
  // First check for stageName (singular) which is what the API returns
  if ('stageName' in talent && talent.stageName) {
    return talent.stageName;
  }
  // Fallback to stageNames array if present
  if ('stageNames' in talent && talent.stageNames && talent.stageNames.length > 0) {
    const firstStageName = talent.stageNames[0];
    if (typeof firstStageName === 'object' && firstStageName && 'name' in firstStageName) {
      return (firstStageName as any).name;
    } else if (typeof firstStageName === 'string') {
      return firstStageName;
    }
  }
  return talent.user?.fullName || 'Unknown Artist';
};

// Helper function to get initials for avatar fallback
const getInitials = (talent: Artist | Musician): string => {
  const displayName = getDisplayName(talent);
  if (!displayName || typeof displayName !== 'string') {
    return 'A'; // Default fallback
  }
  return displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
};

// Calendar color coding utility functions
const getDateAvailability = (date: Date, artist: Artist | Musician | null) => {
  const today = startOfDay(new Date());
  const currentDate = startOfDay(date);
  
  // Past dates are disabled
  if (isBefore(currentDate, today)) {
    return { status: 'past', color: 'bg-gray-200 text-gray-400', available: false };
  }
  
  // Weekends (consultation booking style - unavailable)
  if (isWeekend(date)) {
    return { status: 'weekend', color: 'bg-red-100 text-red-600 border-red-200', available: false };
  }
  
  // In production, check artist's actual availability from database
  // For now, assume most dates are available (would be loaded from API)
  
  // Available dates (green)
  return { status: 'available', color: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200', available: true };
};

export default function BookingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useMobile();
  const [location] = useLocation();
  
  const [selectedTalent, setSelectedTalent] = useState<Artist | Musician | null>(null);
  const [multiTalentMode, setMultiTalentMode] = useState(false);
  const [selectedTalents, setSelectedTalents] = useState<(Artist | Musician)[]>([]);
  

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [multiDateMode, setMultiDateMode] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showMobileArtistSelect, setShowMobileArtistSelect] = useState(false);

  // Fetch managed artists and musicians
  const { data: artists = [], isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
  });

  const { data: musicians = [], isLoading: musiciansLoading } = useQuery<Musician[]>({
    queryKey: ['/api/musicians'],
  });

  // Fetch services created by managed artists/musicians only
  const { data: availableServices = [], isLoading: servicesLoading } = useQuery<any[]>({
    queryKey: ['/api/services/managed'],
  });

  // Multi-talent selection handlers
  const handleTalentSelection = (talent: Artist | Musician) => {
    if (multiTalentMode) {
      const isSelected = selectedTalents.some(t => t.userId === talent.userId);
      if (isSelected) {
        setSelectedTalents(selectedTalents.filter(t => t.userId !== talent.userId));
      } else {
        setSelectedTalents([...selectedTalents, talent]);
      }
      // Clear single selection when in multi-mode
      setSelectedTalent(null);
    } else {
      setSelectedTalent(selectedTalent?.userId === talent.userId ? null : talent);
      // Clear multi-selection when in single mode
      setSelectedTalents([]);
    }
  };

  const handleMultiTalentToggle = (checked: boolean) => {
    setMultiTalentMode(checked);
    if (checked) {
      // If we have a single selection, add it to multi-selection
      if (selectedTalent) {
        setSelectedTalents([selectedTalent]);
        setSelectedTalent(null);
      }
    } else {
      // If we have multi-selection, set first one as single selection
      if (selectedTalents.length > 0) {
        setSelectedTalent(selectedTalents[0]);
        setSelectedTalents([]);
      }
    }
  };

  // Parse URL parameters for auto-selection
  useEffect(() => {
    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);
    const artistId = urlParams.get('artist');
    const musicianId = urlParams.get('musician');

    if (artistId && artists.length > 0) {
      const artist = artists.find((a: Artist) => a.userId.toString() === artistId);
      if (artist && artist.isManaged) {
        setSelectedTalent(artist);
      }
    } else if (musicianId && musicians.length > 0) {
      const musician = musicians.find((m: Musician) => m.userId.toString() === musicianId);
      if (musician && musician.isManaged) {
        setSelectedTalent(musician);
      }
    }
  }, [location, artists, musicians]);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      eventName: '',
      eventType: '',
      venueName: '',
      venueAddress: '',
      startTime: '',
      endTime: '',
      expectedAttendees: '',
      additionalNotes: '',
      budget: '',
      createAccount: false,
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      let bookingData;
      
      const primaryTalent = multiTalentMode ? selectedTalents[0] : selectedTalent;
      const additionalTalents = multiTalentMode ? selectedTalents.slice(1) : [];
      
      if (user) {
        // Authenticated booking
        bookingData = {
          ...data,
          primaryArtistUserId: primaryTalent?.userId,
          additionalTalentUserIds: additionalTalents.map(t => t.userId),
          multiTalentBooking: multiTalentMode,
          eventDates: selectedDates.map(date => date.toISOString()),
          selectedAddOns,
          totalPrice: calculateTotalPrice(),
          bookerUserId: user.id,
          isGuestBooking: false,
        };
        console.log(bookingData)

        return await apiRequest('/api/bookings', {
          method: 'POST',
          body: bookingData,
        });
      } else {
        // Guest booking - map to expected fields
        bookingData = {
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          primaryArtistUserId: primaryTalent?.userId,
          additionalTalentUserIds: additionalTalents.map(t => t.userId),
          multiTalentBooking: multiTalentMode,
          eventName: data.eventName,
          eventType: data.eventType,
          eventDate: selectedDates.length > 0 ? selectedDates[0].toISOString() : null,
          venueName: data.venueName,
          venueAddress: data.venueAddress,
          requirements: data.additionalNotes,
          totalBudget: calculateTotalPrice(),
          createAccount: data.createAccount || false,
        };
        return await apiRequest('/api/bookings/guest', {
          method: 'POST',
          body: bookingData,
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Booking Submitted",
        description: "Your booking inquiry has been submitted successfully.",
      });
      setBookingSuccess(true);
      setShowBookingDialog(false);
      // Invalidate both user bookings and admin bookings queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateTotalPrice = () => {
    let basePrice = 0;
    
    if (multiTalentMode) {
      // Sum all selected talents' prices
      basePrice = selectedTalents.reduce((total, talent) => {
        return total + parseFloat(talent.basePrice || '0');
      }, 0);
    } else {
      // Single talent price
      basePrice = parseFloat(selectedTalent?.basePrice || '0');
    }
    
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = filteredAddOns.find((a: any) => a.id.toString() === addOnId);
      return total + (addOn ? parseFloat(addOn.basePrice || '0') : 0);
    }, 0);
    return basePrice + addOnTotal;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || isBefore(date, startOfDay(new Date()))) return;
    
    const hasSelectedTalent = multiTalentMode ? selectedTalents.length > 0 : selectedTalent;
    
    if (!hasSelectedTalent) {
      toast({
        title: "Select Talent First",
        description: "Please select talent before choosing a date.",
        variant: "destructive",
      });
      return;
    }

    if (multiDateMode) {
      // Multi-date selection mode
      setSelectedDates(prev => {
        const isAlreadySelected = prev.some(d => isSameDay(d, date));
        if (isAlreadySelected) {
          return prev.filter(d => !isSameDay(d, date));
        } else {
          return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
        }
      });
    } else {
      // Single date mode - direct booking
      setSelectedDates([date]);
      setShowBookingDialog(true);
    }
  };

  const handleConfirmDates = () => {
    const hasSelectedTalent = multiTalentMode ? selectedTalents.length > 0 : selectedTalent;
    
    if (selectedDates.length > 0 && hasSelectedTalent) {
      setShowBookingDialog(true);
    }
  };

  const formatDateRange = (dates: Date[]) => {
    if (dates.length === 0) return '';
    if (dates.length === 1) return format(dates[0], 'MMM d, yyyy');
    
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    
    // Group consecutive dates into ranges
    const ranges = [];
    let currentRange = [sortedDates[0]];
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const previousDate = sortedDates[i - 1];
      
      // Check if current date is consecutive to previous date
      const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive date, add to current range
        currentRange.push(currentDate);
      } else {
        // Non-consecutive date, finalize current range and start new one
        ranges.push(currentRange);
        currentRange = [currentDate];
      }
    }
    
    // Add the last range
    ranges.push(currentRange);
    
    // Format ranges
    const formattedRanges = ranges.map(range => {
      if (range.length === 1) {
        return format(range[0], 'MMM d');
      } else {
        const first = range[0];
        const last = range[range.length - 1];
        return `${format(first, 'MMM d')}-${format(last, 'd')}`;
      }
    });
    
    const year = format(sortedDates[0], 'yyyy');
    return formattedRanges.join(', ') + `, ${year}`;
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleBookingSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  const managedArtists = artists?.filter((artist: Artist) => artist.isManaged);
  const managedMusicians = musicians?.filter((musician: Musician) => musician.isManaged);

  // Filter services to only show those created by managed artists/musicians
  const filteredAddOns = availableServices?.filter((service: any) => {
    const createdByManagedArtist = managedArtists?.some((artist: Artist) => artist.userId === service.createdByUserId);
    const createdByManagedMusician = managedMusicians?.some((musician: Musician) => musician.userId === service.createdByUserId);
    return createdByManagedArtist || createdByManagedMusician;
  });

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Inquiry Submitted!</h2>
              <p className="text-gray-600 mb-4">
                Your booking inquiry has been submitted successfully. Our team will review your request and contact you within 24 hours.
              </p>
              <Button onClick={() => setBookingSuccess(false)}>
                Make Another Booking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 mobile-safe">
      <div className="max-w-7xl mx-auto mobile-container py-4 sm:py-6">
        {/* Enhanced Header */}
        <div className="mb-8 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Talent Booking
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Select managed talent, customize your package, and choose your date</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                <span>{isMobile ? 'Mobile' : 'Desktop'} View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile/Desktop Layout - 1/4 Artist, 1/4 Add-ons, 1/2 Calendar */}
        <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-12'} ${isMobile ? 'space-y-4' : 'h-[calc(100vh-220px)]'}`}>
          {/* Artist Selection - 1/4 of screen */}
          <div className={`${isMobile ? 'order-1' : 'lg:col-span-3'}`}>
            <Card className={`${isMobile ? 'h-auto' : 'h-full'} border-0 shadow-lg bg-white/80 backdrop-blur-sm`}>
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Select Talent
                </CardTitle>
                
                {/* Multi-Talent Selection Checkbox */}
                <div className="mt-3 p-2 bg-white/10 rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="multi-talent"
                      checked={multiTalentMode}
                      onCheckedChange={handleMultiTalentToggle}
                      className="border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-600"
                    />
                    <label 
                      htmlFor="multi-talent" 
                      className="text-sm font-medium cursor-pointer select-none"
                    >
                      Book multiple talents for this event
                    </label>
                  </div>
                  {multiTalentMode && (
                    <p className="text-xs mt-1 text-white/80">
                      Select multiple managed artists/musicians for your booking
                    </p>
                  )}
                </div>

                {/* Selection Summary */}
                {multiTalentMode ? (
                  selectedTalents.length > 0 && (
                    <div className="mt-2 p-2 bg-white/20 rounded">
                      <p className="text-sm font-semibold">Selected Talents ({selectedTalents.length}):</p>
                      <div className="mt-1 space-y-1">
                        {selectedTalents.map((talent, index) => (
                          <div key={talent.userId} className="text-xs flex items-center justify-between">
                            <span>{getDisplayName(talent)}</span>
                            <span className="font-semibold">${talent.basePrice || '0'}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <span className="text-sm font-bold">Total: ${selectedTalents.reduce((total, t) => total + parseFloat(t.basePrice || '0'), 0)}</span>
                      </div>
                    </div>
                  )
                ) : (
                  selectedTalent && (
                    <div className="mt-2 p-2 bg-white/20 rounded">
                      <p className="text-sm">Selected: <span className="font-semibold">{getDisplayName(selectedTalent)}</span></p>
                    </div>
                  )
                )}
              </CardHeader>
              <CardContent className={`${isMobile ? 'max-h-96 overflow-y-auto' : 'overflow-y-auto h-[calc(100%-120px)]'} p-4`}>
                <div className="space-y-4">
                  {/* Managed Artists */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      Managed Artists
                    </h3>
                    {artistsLoading ? (
                      <div className="text-center py-4">Loading artists...</div>
                    ) : managedArtists?.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">No managed artists available</div>
                    ) : (
                      <div className="space-y-3">
                        {managedArtists?.map((artist: Artist) => {
                          const isSelected = multiTalentMode 
                            ? selectedTalents.some(t => t.userId === artist.userId)
                            : selectedTalent?.userId === artist.userId;
                          
                          return (
                            <Card 
                              key={`managed-artist-${artist.userId || artist.id}`}
                              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                                isSelected ? 'ring-2 ring-purple-500 bg-purple-50 shadow-lg' : 'hover:bg-blue-50'
                              }`}
                              onClick={() => handleTalentSelection(artist)}
                            >
                        
                            <CardContent className="p-3 min-h-[80px]">
                              <div className="flex items-start space-x-3">
                                <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                                  <AvatarImage 
                                    src={artist.bookingFormPictureUrl || artist.userProfile?.avatarUrl || artist.profile?.avatarUrl || ''} 
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-lg">
                                    {getInitials(artist)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 flex flex-col">
                                  <h4 className="font-bold text-sm break-words leading-tight mb-1">{getDisplayName(artist)}</h4>
                                  <p className="text-xs text-gray-500 truncate mb-2">{artist.primaryGenre || 'Various'}</p>
                                  <div className="flex items-center justify-between mt-auto">
                                    <Badge variant="secondary" className={`text-xs px-1 py-0.5 ${
                                      isSelected 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900'
                                    }`}>
                                      <Crown className="w-2 h-2 mr-1" />
                                      {isSelected ? 'SELECTED' : 'Managed'}
                                    </Badge>
                                    <span className="text-sm font-bold text-green-600">
                                      ${artist.basePrice || '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Managed Musicians */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Mic2 className="w-4 h-4 text-blue-600" />
                      Managed Musicians
                    </h3>
                    {musiciansLoading ? (
                      <div className="text-center py-4">Loading musicians...</div>
                    ) : managedMusicians?.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">No managed musicians available</div>
                    ) : (
                      <div className="space-y-3">
                        {managedMusicians?.map((musician: Musician) => {
                          const isSelected = multiTalentMode 
                            ? selectedTalents?.some(t => t.userId === musician.userId)
                            : selectedTalent?.userId === musician.userId;
                          
                          return (
                            <Card 
                              key={`managed-musician-${musician.userId || musician.id}`}
                              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                                isSelected ? 'ring-2 ring-purple-500 bg-purple-50 shadow-lg' : 'hover:bg-blue-50'
                              }`}
                              onClick={() => handleTalentSelection(musician)}
                            >
                        
                            <CardContent className="p-3 min-h-[80px]">
                              <div className="flex items-start space-x-3">
                                <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                                  <AvatarImage 
                                    src={musician.bookingFormPictureUrl || musician.userProfile?.avatarUrl || musician.profile?.avatarUrl || ''} 
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                    <Mic2 className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 flex flex-col">
                                  <h4 className="font-bold text-sm break-words leading-tight mb-1">{musician.user?.fullName || 'Musician'}</h4>
                                  <p className="text-xs text-gray-500 truncate mb-2">Session Musician</p>
                                  <div className="flex items-center justify-between mt-auto">
                                    <Badge variant="secondary" className={`text-xs px-1 py-0.5 ${
                                      isSelected 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                        : 'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900'
                                    }`}>
                                      <Shield className="w-2 h-2 mr-1" />
                                      {isSelected ? 'SELECTED' : 'Managed'}
                                    </Badge>
                                    <span className="text-sm font-bold text-green-600">
                                      ${musician.basePrice || '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Next Button for Desktop - Talent Selection */}
                  {!isMobile && (selectedTalent || selectedTalents.length > 0) && (
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={() => {
                          document.getElementById('addons-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Continue to Add-ons
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add-ons Section - 1/4 of screen */}
          <div id="addons-section" className={`${isMobile ? 'order-2' : 'lg:col-span-3'}`}>
            <Card className={`${isMobile ? 'h-auto' : 'h-full'} border-0 shadow-lg bg-white/80 backdrop-blur-sm`}>
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add-ons & Services
                </CardTitle>
                {(selectedTalent || selectedTalents.length > 0) && (
                  <div className="mt-2 p-2 bg-white/20 rounded">
                    <p className="text-sm">
                      {multiTalentMode ? (
                        <>Total Base Price: <span className="font-semibold">${selectedTalents.reduce((total, t) => total + parseFloat(t.basePrice || '0'), 0)}</span></>
                      ) : (
                        <>Base Price: <span className="font-semibold">${selectedTalent?.basePrice || '0'}</span></>
                      )}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className={`${isMobile ? 'max-h-96 overflow-y-auto' : 'overflow-y-auto h-[calc(100%-120px)]'} p-4`}>
                {!selectedTalent && selectedTalents.length === 0 ? (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Select Talent</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Choose talent first to see available add-ons and services.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {/* Additional Musicians */}
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Additional Musicians
                      </h3>
                      <div className="space-y-2">
                        {servicesLoading ? (
                          <div className="text-center py-4 text-gray-500">Loading services...</div>
                        ) : filteredAddOns?.filter((service: any) => service.categoryId === 1 || service.name.toLowerCase().includes('musician')).length === 0 ? (
                          <div className="text-center py-4 text-gray-500">No additional musicians available from managed artists</div>
                        ) : (
                          filteredAddOns?.filter((service: any) => service.categoryId === 1 || service.name.toLowerCase().includes('musician')).map((service: any) => (
                            <Card key={service.id} className="border transition-all hover:shadow-md">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    checked={selectedAddOns.includes(service.id.toString())}
                                    onCheckedChange={() => handleAddOnToggle(service.id.toString())}
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{service.name}</h4>
                                    <p className="text-xs text-gray-600">{service.description}</p>
                                    <span className="text-sm font-semibold text-green-600">+${service.basePrice}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Music className="w-4 h-4 text-purple-600" />
                        Equipment
                      </h3>
                      <div className="space-y-2">
                        {servicesLoading ? (
                          <div className="text-center py-4 text-gray-500">Loading equipment...</div>
                        ) : filteredAddOns?.filter((service: any) => service.categoryId === 2 || service.name.toLowerCase().includes('equipment') || service.name.toLowerCase().includes('sound') || service.name.toLowerCase().includes('lighting')).length === 0 ? (
                          <div className="text-center py-4 text-gray-500">No equipment services available from managed artists</div>
                        ) : (
                          filteredAddOns?.filter((service: any) => service.categoryId === 2 || service.name.toLowerCase().includes('equipment') || service.name.toLowerCase().includes('sound') || service.name.toLowerCase().includes('lighting')).map((service: any) => (
                            <Card key={service.id} className="border transition-all hover:shadow-md">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    checked={selectedAddOns.includes(service.id.toString())}
                                    onCheckedChange={() => handleAddOnToggle(service.id.toString())}
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{service.name}</h4>
                                    <p className="text-xs text-gray-600">{service.description}</p>
                                    <span className="text-sm font-semibold text-green-600">+${service.basePrice}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        Services
                      </h3>
                      <div className="space-y-2">
                        {servicesLoading ? (
                          <div className="text-center py-4 text-gray-500">Loading services...</div>
                        ) : filteredAddOns?.filter((service: any) => service.categoryId === 3 || (!service.name.toLowerCase().includes('musician') && !service.name.toLowerCase().includes('equipment') && !service.name.toLowerCase().includes('sound') && !service.name.toLowerCase().includes('lighting'))).length === 0 ? (
                          <div className="text-center py-4 text-gray-500">No additional services available from managed artists</div>
                        ) : (
                          filteredAddOns?.filter((service: any) => service.categoryId === 3 || (!service.name.toLowerCase().includes('musician') && !service.name.toLowerCase().includes('equipment') && !service.name.toLowerCase().includes('sound') && !service.name.toLowerCase().includes('lighting'))).map((service: any) => (
                            <Card key={service.id} className="border transition-all hover:shadow-md">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    checked={selectedAddOns.includes(service.id.toString())}
                                    onCheckedChange={() => handleAddOnToggle(service.id.toString())}
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{service.name}</h4>
                                    <p className="text-xs text-gray-600">{service.description}</p>
                                    <span className="text-sm font-semibold text-green-600">+${service.basePrice}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Total Price Summary */}
                    {selectedAddOns.length > 0 && (
                      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Total Price:</span>
                            <span className="text-xl font-bold text-green-600">
                              ${calculateTotalPrice()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Base: ${selectedTalent?.basePrice || '0'} + Add-ons: ${selectedAddOns.reduce((total, addOnId) => {
                              const addOn = filteredAddOns?.find((a: any) => a.id.toString() === addOnId);
                              return total + (addOn ? parseFloat(addOn.basePrice || '0') : 0);
                            }, 0)}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                
                {/* Next Button for Desktop - Add-ons Section */}
                {!isMobile && (selectedTalent || selectedTalents.length > 0) && (
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      onClick={() => {
                        document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Continue to Calendar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Calendar Section - 1/2 of screen */}
          <div id="calendar-section" className={`${isMobile ? 'order-3' : 'lg:col-span-6'} flex flex-col`}>
            <Card className={`${isMobile ? 'h-auto' : 'h-full min-h-[800px]'} border-0 shadow-lg bg-white/80 backdrop-blur-sm flex flex-col`}>
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Select Your Date
                </CardTitle>
                {selectedTalent && (
                  <div className="mt-2 p-2 bg-white/20 rounded">
                    <p className="text-sm">
                      <span className="font-semibold">{getDisplayName(selectedTalent)}</span>
                      {selectedAddOns.length > 0 && ` (+${selectedAddOns.length} add-ons)`}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col">
                {/* Calendar Legend */}
                <Card className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="w-5 h-5 text-blue-600" />
                      Calendar Legend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                        <span>Unavailable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                        <span>Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <span>Past</span>
                      </div>
                      {multiDateMode && selectedDates.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedDates([])}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Unselect All
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Calendar - Taking up 90% of space */}
                <div className="flex flex-col flex-1 space-y-4">
                  {/* Multi-date selection toggle */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Checkbox 
                      checked={multiDateMode}
                      onCheckedChange={(checked) => setMultiDateMode(checked === true)}
                      id="multi-date"
                    />
                    <label htmlFor="multi-date" className="text-sm font-medium cursor-pointer">
                      Select multiple dates
                    </label>
                    {multiDateMode && selectedDates.length > 0 && (
                      <div className="ml-auto">
                        <Button 
                          size="sm" 
                          onClick={handleConfirmDates}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Confirm {selectedDates.length} Dates
                        </Button>
                      </div>
                    )}
                  </div>



                  {/* Enhanced Calendar taking up 90% of space */}
                  <div className="flex-1 flex flex-col" style={{ minHeight: '600px' }}>
                    <Calendar
                      mode={multiDateMode ? "multiple" : "single"}
                      selected={multiDateMode ? selectedDates : selectedDates[0]}
                      onSelect={multiDateMode ? (dates) => setSelectedDates(dates || []) : handleDateSelect}
                      disabled={(date) => {
                        const availability = getDateAvailability(date, selectedTalent);
                        return !availability.available;
                      }}
                      modifiers={{
                        available: (date) => getDateAvailability(date, selectedTalent).status === 'available',
                        unavailable: (date) => getDateAvailability(date, selectedTalent).status === 'unavailable',
                        booked: (date) => getDateAvailability(date, selectedTalent).status === 'booked',
                        weekend: (date) => getDateAvailability(date, selectedTalent).status === 'weekend',
                        past: (date) => getDateAvailability(date, selectedTalent).status === 'past',
                        selected: (date) => selectedDates.some(d => isSameDay(d, date)),
                      }}
                      modifiersStyles={{
                        available: { 
                          backgroundColor: '#dcfce7', 
                          color: '#166534', 
                          border: '2px solid #bbf7d0',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        },
                        unavailable: { 
                          backgroundColor: '#fecaca', 
                          color: '#dc2626', 
                          border: '2px solid #fca5a5',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        },
                        booked: { 
                          backgroundColor: '#fed7aa', 
                          color: '#ea580c', 
                          border: '2px solid #fdba74',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        },
                        weekend: { 
                          backgroundColor: '#fecaca', 
                          color: '#dc2626', 
                          border: '2px solid #fca5a5',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        },
                        past: { 
                          backgroundColor: '#e5e7eb', 
                          color: '#6b7280',
                          borderRadius: '12px',
                          fontWeight: '500',
                          fontSize: '1.1rem'
                        },
                        selected: { 
                          backgroundColor: '#3b82f6', 
                          color: 'white', 
                          fontWeight: 'bold',
                          border: '2px solid #1d4ed8',
                          borderRadius: '12px',
                          fontSize: '1.2rem',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                        },
                      }}
                      style={{
                        width: '100%'
                      } as React.CSSProperties}
                      className={`w-full ${isMobile ? '' : 'max-w-none'}`}
                      classNames={{
                        months: "w-full",
                        month: "w-full space-y-4",
                        caption: "flex justify-center pt-1 relative items-center text-xl font-bold text-gray-800 pb-4",
                        caption_label: "text-2xl font-bold",
                        nav: "space-x-1 flex items-center",
                        nav_button: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "grid grid-cols-7 gap-2 w-full mb-2",
                        head_cell: "text-center font-bold text-gray-700 text-lg py-2 w-full",
                        row: "grid grid-cols-7 gap-2 w-full mt-2",
                        cell: "w-full aspect-square relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                        day: "w-full h-full min-h-[70px] text-lg font-semibold flex items-center justify-center border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none",
                        day_range_end: "day-range-end",
                        day_selected: "bg-blue-500 text-white font-bold border-2 border-blue-700 shadow-lg",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>

                  {/* Calendar Summary - Below Calendar */}
                  {selectedDates.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 mt-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Selected Dates Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Dates Selected:</p>
                          <p className="font-medium text-blue-700">{selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date Range:</p>
                          <p className="font-medium text-blue-700">{formatDateRange(selectedDates)}</p>
                        </div>
                        {selectedTalent && (
                          <>
                            <div>
                              <p className="text-gray-600">Talent:</p>
                              <p className="font-medium text-blue-700">{getDisplayName(selectedTalent)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total Price:</p>
                              <p className="font-bold text-green-600">
                                ${calculateTotalPrice() * selectedDates.length}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      {selectedDates.length > 0 && (selectedTalent || selectedTalents.length > 0) && (!multiDateMode || selectedDates.length === 1) && (
                        <Button 
                          onClick={() => setShowBookingDialog(true)}
                          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Continue Booking
                          {multiTalentMode && selectedTalents.length > 1 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded">
                              {selectedTalents.length} talents
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Your Booking</DialogTitle>
              <DialogDescription>
                Please provide your contact information and event details to complete your booking.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guestEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Wedding Reception" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wedding">Wedding</SelectItem>
                            <SelectItem value="corporate">Corporate Event</SelectItem>
                            <SelectItem value="private-party">Private Party</SelectItem>
                            <SelectItem value="concert">Concert</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="venueName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Event venue name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="venueAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full venue address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expectedAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Attendees</FormLabel>
                        <FormControl>
                          <Input placeholder="Approximate number of guests" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Budget</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., $5000"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Booking Summary in Form */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">Booking Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Talent:</p>
                      <p className="font-medium">{selectedTalent ? getDisplayName(selectedTalent) : 'No talent selected'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dates:</p>
                      <p className="font-medium">{formatDateRange(selectedDates)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Add-ons:</p>
                      <p className="font-medium">{selectedAddOns.length} selected</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Price:</p>
                      <p className="font-bold text-green-600 text-lg">
                        ${calculateTotalPrice() * selectedDates.length}
                      </p>
                      {selectedDates.length > 1 && (
                        <p className="text-xs text-gray-500">
                          ${calculateTotalPrice()} × {selectedDates.length} dates
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special requirements or additional information..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!user && (
                  <FormField
                    control={form.control}
                    name="createAccount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Create an account to track my bookings
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowBookingDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBookingMutation.isPending}>
                    {createBookingMutation.isPending ? 'Submitting...' : 'Submit Booking'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}