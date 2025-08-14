import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import MobileBookingDashboard from '@/components/MobileBookingDashboard';
import MobileBookingCalendar from '@/components/MobileBookingCalendar';
import MobileBookingForm from '@/components/MobileBookingForm';
import { useMobile } from '@/hooks/use-mobile';

type BookingStep = 'dashboard' | 'calendar' | 'form';

export default function MobileBooking() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('dashboard');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useMobile();

  const { data: artists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['/api/artists'],
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      if (user) {
        // Authenticated booking
        const bookingData = {
          ...data,
          selectedDates: selectedDates.map(date => date.toISOString()),
          bookerUserId: user.id,
          isGuestBooking: false
        };
        return await apiRequest('/api/bookings', 'POST', bookingData);
      } else {
        // Guest booking - map to expected fields
        const bookingData = {
          guestName: data.contactName,
          guestEmail: data.contactEmail,
          guestPhone: data.contactPhone,
          primaryArtistUserId: data.primaryArtistUserId,
          eventName: data.eventName,
          eventType: data.eventType,
          eventDate: selectedDates.length > 0 ? selectedDates[0].toISOString() : null,
          venueName: data.venueName,
          venueAddress: data.venueAddress,
          requirements: data.requirements,
          totalBudget: data.totalBudget,
          createAccount: data.createAccount || false,
          password: data.password || null,
        };
        return await apiRequest('/api/bookings/guest', 'POST', bookingData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Your booking request has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setCurrentStep('dashboard');
      setSelectedDates([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateBooking = () => {
    setCurrentStep('calendar');
    setSelectedDates([]);
  };

  const handleCalendarComplete = () => {
    if (selectedDates.length === 0) {
      toast({
        title: "No dates selected",
        description: "Please select at least one date for your booking.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('form');
  };

  const handleFormSubmit = (formData: any) => {
    createBookingMutation.mutate(formData);
  };

  const handleBackFromForm = () => {
    setCurrentStep('calendar');
  };

  const handleBackFromCalendar = () => {
    setCurrentStep('dashboard');
    setSelectedDates([]);
  };

  // Show mobile-optimized view on mobile devices
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {currentStep === 'dashboard' && (
          <MobileBookingDashboard onCreateBooking={handleCreateBooking} />
        )}
        
        {currentStep === 'calendar' && (
          <MobileBookingCalendar
            selectedDates={selectedDates}
            onDateSelect={setSelectedDates}
            multiSelect={true}
            onClose={selectedDates.length > 0 ? handleCalendarComplete : handleBackFromCalendar}
          />
        )}
        
        {currentStep === 'form' && (
          <MobileBookingForm
            selectedDates={selectedDates}
            artists={artists}
            onSubmit={handleFormSubmit}
            onBack={handleBackFromForm}
            isLoading={createBookingMutation.isPending}
          />
        )}
      </div>
    );
  }

  // Fallback to regular booking page for desktop
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mobile Booking</h1>
        <p className="text-gray-600 mb-8">
          Access this page on a mobile device for the optimized booking experience, or use the main Booking page for desktop.
        </p>
        <MobileBookingDashboard onCreateBooking={handleCreateBooking} />
      </div>
    </div>
  );
}