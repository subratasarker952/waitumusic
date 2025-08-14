import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MessageCircle,
  CheckCircle,
  Star,
  Crown,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Music,
  Building,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { format, addDays, isSameDay, isBefore, startOfDay, isWeekend } from 'date-fns';

// Currency conversion rates (fetched from backend API)
const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  CAD: 1.25,
  AUD: 1.35,
  JPY: 110,
  CNY: 6.45,
  INR: 75,
  BRL: 5.2,
  MXN: 18.5,
  XCD: 2.70
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  XCD: 'EC$'
};

// Currency conversion utility function
const convertCurrency = (amountUSD: number, targetCurrency: string): number => {
  const rate = CURRENCY_RATES[targetCurrency as keyof typeof CURRENCY_RATES] || 1;
  return Math.round(amountUSD * rate);
};

const formatPrice = (amountUSD: number, currency: string): string => {
  const convertedAmount = convertCurrency(amountUSD, currency);
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '$';
  return `${symbol}${convertedAmount}`;
};

// Guest consultation booking schema
const guestConsultationSchema = z.object({
  // Guest contact information
  guestName: z.string().min(2, 'Full name is required'),
  guestEmail: z.string().email('Valid email is required'),
  guestPhone: z.string().optional(),

  // Consultation details
  consultationType: z.string().min(1, 'Please select consultation type'),
  consultationTopic: z.string().min(10, 'Please provide details about your consultation topic'),
  specificQuestions: z.string().optional(),
  backgroundInfo: z.string().optional(),
  preferredCommunicationMethod: z.string().min(1, 'Please select preferred communication method'),

  // Payment
  paymentMethod: z.string().optional(),

  // Account creation option
  createAccount: z.boolean().optional(),
  password: z.string().optional(),
});

// User consultation booking schema
const userConsultationSchema = z.object({
  consultationType: z.string().min(1, 'Please select consultation type'),
  consultationTopic: z.string().min(10, 'Please provide details about your consultation topic'),
  specificQuestions: z.string().optional(),
  backgroundInfo: z.string().optional(),
  preferredCommunicationMethod: z.string().min(1, 'Please select preferred communication method'),
  paymentMethod: z.string().optional(),
});

type GuestConsultationFormData = z.infer<typeof guestConsultationSchema>;
type UserConsultationFormData = z.infer<typeof userConsultationSchema>;

interface Professional {
  userId: number;
  basePrice: string;
  isManaged: boolean;
  services?: any;
  userType?: 'professional' | 'artist' | 'musician';
  roleId?: number; // Role ID for tab determination
  stageName?: string; // For artists
  genre?: string; // For artists  
  instruments?: any; // For musicians
  user?: {
    fullName: string;
    email: string;
    roleId?: number;
  };
  profile?: {
    bio: string;
    avatarUrl?: string;
  };
}

interface ConsultationType {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  consultant: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  period: 'morning' | 'afternoon';
}



const timeSlots: TimeSlot[] = [
  // Morning slots (9:00 AM - 12:00 PM)
  { time: '09:00', available: true, period: 'morning' },
  { time: '09:30', available: true, period: 'morning' },
  { time: '10:00', available: true, period: 'morning' },
  { time: '10:30', available: false, period: 'morning' },
  { time: '11:00', available: true, period: 'morning' },
  { time: '11:30', available: true, period: 'morning' },

  // Afternoon slots (1:00 PM - 6:00 PM)
  { time: '13:00', available: true, period: 'afternoon' },
  { time: '13:30', available: true, period: 'afternoon' },
  { time: '14:00', available: false, period: 'afternoon' },
  { time: '14:30', available: true, period: 'afternoon' },
  { time: '15:00', available: true, period: 'afternoon' },
  { time: '15:30', available: true, period: 'afternoon' },
  { time: '16:00', available: true, period: 'afternoon' },
  { time: '16:30', available: false, period: 'afternoon' },
  { time: '17:00', available: true, period: 'afternoon' },
  { time: '17:30', available: true, period: 'afternoon' },
];

// Date availability and pricing logic for consultation calendar
const getConsultationDateAvailability = (date: Date, professional: Professional | null) => {
  const today = startOfDay(new Date());
  const currentDate = startOfDay(date);

  // Past dates are disabled
  if (isBefore(currentDate, today)) {
    return { status: 'past', color: 'bg-gray-200 text-gray-400', available: false };
  }

  // Weekends are unavailable for consultations
  if (isWeekend(date)) {
    return { status: 'weekend', color: 'bg-red-100 text-red-600 border-red-200', available: false };
  }

  // Professional availability would be loaded from database
  // For now, assume availability based on business hours

  // High demand dates (premium pricing - purple)
  const dayOfMonth = date.getDate();
  if ([6, 13, 20, 27].includes(dayOfMonth)) {
    return { status: 'premium', color: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200', available: true };
  }

  // Available dates (green)
  return { status: 'available', color: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200', available: true };
};

export default function Consultation() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [originalTab, setOriginalTab] = useState<string>('services');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const queryClient = useQueryClient();
  const [location] = useLocation();
  // No router needed - we'll use window.location

  // Fetch all managed users with services (professionals, artists, musicians)
  const { data: managedUsersData, isLoading: professionalsLoading } = useQuery({
    queryKey: ['/api/managed-users-with-services'],
  });

  // Fetch consultation services from database
  const { data: consultationServices } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await apiRequest('/api/services');
      return response.json();
    }
  });

  // Fetch user consultation services (demo consultations)
  const { data: userConsultationServices } = useQuery({
    queryKey: ['/api/user-services'],
    queryFn: async () => {
      const response = await apiRequest('/api/user-services');
      return response.json();
    }
  });

  // CLEAN SEPARATION: Only show consultation services (from both sources)
  const baseConsultations = consultationServices?.filter((service: any) =>
    service.name.toLowerCase().includes('consultation')
  ) || [];

  console.log(managedUsersData, consultationServices, userConsultationServices, baseConsultations)
  // Filter user consultations by selected professional when autoselected
  const userConsultations = useMemo(() => {
    if (!userConsultationServices) return [];

    let filtered = userConsultationServices.filter((service: any) =>
      service.name.toLowerCase().includes('consultation')
    );

    // If a professional is autoselected, only show their consultations
    if (selectedProfessional) {
      filtered = filtered.filter((service: any) =>
        service.userId === selectedProfessional.userId
      );
    }

    return filtered;
  }, [userConsultationServices, selectedProfessional]);

  const consultationTypes = [...baseConsultations, ...userConsultations];

  console.log('Consultation filtering debug:', {
    selectedProfessionalId: selectedProfessional?.userId,
    totalUserServices: userConsultationServices?.length,
    filteredUserConsultations: userConsultations?.length,
    totalConsultationTypes: consultationTypes?.length
  });

  // Fetch user-specific services for selected professional
  const { data: userServices, isLoading: userServicesLoading } = useQuery({
    queryKey: ['/api/user-services'],
    enabled: !!selectedProfessional,
  });

  // Fetch roles for tab determination
  const { data: roles } = useQuery({
    queryKey: ['/api/roles'],
  });

  // Combine all managed users into a single array for professional selection
  const professionals = useMemo(() => {
    if (!managedUsersData) return [];

    const data = managedUsersData as any;
    return [
      ...(data.professionals || []).map((prof: any) => ({ ...prof, userType: 'professional' })),
      ...(data.artists || []).map((artist: any) => ({ ...artist, userType: 'artist' })),
      ...(data.musicians || []).map((musician: any) => ({ ...musician, userType: 'musician' }))
    ];
  }, [managedUsersData]);

  const form = useForm({
    resolver: zodResolver(guestConsultationSchema),
    defaultValues: {
      consultationType: '',
      professionalId: '',
      sessionDuration: '60',
      budget: '',
      description: '',
      preferredTime: '',
      contactMethod: 'video',
    },
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/consultations', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consultations'] });
      setCurrentStep(4); // Success step
    },
  });

  const handleSubmit = (data: any) => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const consultationData = {
      ...data,
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      selectedTime,
      professionalId: parseInt(data.professionalId),
    };

    createConsultationMutation.mutate(consultationData);
  };

  // Parse URL parameters for auto-selection and determine original tab
  useEffect(() => {
    if (!professionals.length) return;

    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);
    const professionalId = urlParams.get('professional');

    if (professionalId) {
      const professional = professionals.find((p: Professional) => p.userId.toString() === professionalId);
      if (professional) {
        setSelectedProfessional(professional);
        form.setValue('professionalId', professional.userId.toString());

        // Determine original tab based on role_id and userType
        let detectedTab = 'professionals'; // Default fallback
        const userRoleId = professional.roleId || professional.user?.roleId;
        const userType = professional.userType;

        // Primary detection: Use userType from API
        if (userType === 'artist') {
          detectedTab = 'artists';
        } else if (userType === 'musician') {
          detectedTab = 'musicians';
        } else if (userType === 'professional') {
          detectedTab = 'professionals';
        }

        // Secondary detection: Use role_id if userType not available
        if (roles && userRoleId && !userType) {
          // Role mapping based on role IDs:
          // Role mapping: 3,4 = artists; 5,6 = musicians; 7,8 = professionals

          if ([3, 4].includes(userRoleId)) {
            detectedTab = 'artists';
          } else if ([5, 6].includes(userRoleId)) {
            detectedTab = 'musicians';
          } else if ([7, 8].includes(userRoleId)) {
            detectedTab = 'professionals';
          }
        }
        console.log('Detected original tab for professional:', detectedTab, professional);
        setOriginalTab(detectedTab);

        // Check if professional has multiple services
        const professionalServices = professional.services || [];
        const hasMultipleServices = Array.isArray(professionalServices) ?
          professionalServices.length > 1 :
          (typeof professionalServices === 'string' ?
            (professionalServices.length > 0 && professionalServices !== '[]') : false);

        // Always show service selection step when a professional is pre-selected
        // This gives users context about what they're booking
        setCurrentStep(1);

        // If only one service, we could pre-select it here in the future
        if (!hasMultipleServices) {
          // For single service, user will see the service details and can confirm
          // This is less jarring than jumping directly to calendar
        }
      }
    }
  }, [professionals.length, roles]);

  // Auto-select professional when only one managed professional available
  const availableProfessionals = professionals.filter((prof: Professional) => prof.isManaged);

  // Auto-select logic when moving to step 2
  const handleStepTransition = (targetStep: number) => {
    // If professional is already selected (auto-selected) and moving to step 2, skip to step 3
    if (targetStep === 2 && selectedProfessional) {
      setCurrentStep(3);
      return;
    }

    if (targetStep === 2 && availableProfessionals.length === 1) {
      const singleProfessional = availableProfessionals[0];
      form.setValue('professionalId', singleProfessional.userId?.toString() || '');
      setSelectedProfessional(singleProfessional);
      // Go to step 2 to show professional selection (even if only one)
      // This provides context before moving to calendar
      setCurrentStep(2);
      return;
    }

    // Handle back navigation from step 3 when professional is pre-selected
    if (targetStep === 2 && currentStep === 3 && selectedProfessional) {
      setCurrentStep(1);
      return;
    }

    // Handle back navigation normally - don't skip steps
    if (targetStep === 2 && currentStep === 3) {
      setCurrentStep(2);
      return;
    }

    setCurrentStep(targetStep);
  };

  // Don't skip steps - always show service and professional selection for context
  const getEffectiveStep = (step: number) => {
    return step;
  };

  // Get consultation types based on selected professional or show all if none selected
  const getAvailableConsultationTypes = () => {
    if (selectedProfessional) {
      // For autoselected managed users, only show their assigned or self-created services
      let availableServices: string[] = [];

      // Check if professional has assigned services (from admin)
      if (selectedProfessional.services) {
        const services = Array.isArray(selectedProfessional.services)
          ? selectedProfessional.services
          : (typeof selectedProfessional.services === 'string' ?
            (selectedProfessional.services.startsWith('[') ?
              JSON.parse(selectedProfessional.services) :
              [selectedProfessional.services]) :
            []);
        availableServices = [...services];
      }

      // Add self-created services from user-services table
      if (userServices && selectedProfessional && Array.isArray(userServices)) {
        const userSpecificServices = userServices
          .filter((service: any) =>
            service.userId === selectedProfessional.userId &&
            service.categoryId === 5 // Consultation services only
          )
          .map((service: any) => service.name);

        availableServices = [...availableServices, ...userSpecificServices];
      }

      // If no services available, show default consultation types
      if (availableServices.length === 0) {
        return consultationTypes;
      }

      // Remove duplicates and map available services to consultation types
      const uniqueServices = [...new Set(availableServices)];
      return uniqueServices.map((service: string, index: number) => ({
        id: `service-${index}`,
        name: service,
        description: `Professional ${service.toLowerCase()} consultation with ${selectedProfessional.stageName || selectedProfessional.user?.fullName || 'Professional'}`,
        duration: '60 minutes',
        price: parseInt(selectedProfessional.basePrice) || 0,
        consultant: selectedProfessional.stageName || selectedProfessional.user?.fullName || 'Professional',
        icon: getServiceIcon(service)
      }));
    }

    // Default consultation types when no professional is selected
    return consultationTypes;
  };

  const getServiceIcon = (serviceName: string) => {
    const service = serviceName.toLowerCase();
    if (service.includes('business') || service.includes('consultation')) return FileText;
    if (service.includes('marketing') || service.includes('promotion')) return Star;
    if (service.includes('legal') || service.includes('contract')) return Shield;
    if (service.includes('development') || service.includes('artist')) return User;
    return Music; // Default icon
  };

  // Map database consultation services to display format
  const consultationTypesDisplay = consultationTypes.map((service: any) => {
    // Map service names to icons
    const iconMap: { [key: string]: any } = {
      'General Consultation': Star,
      'Marketing Strategy Consultation': Building,
      'Music Production Consultation': Music,
      'Business Development Consultation': DollarSign,
      'Legal & Business Consultation': Shield,
      'Performance Coaching Consultation': Crown,
    };

    return {
      id: service.name.toLowerCase().replace(/\s+/g, '-'),
      name: service.name,
      description: service.description,
      icon: iconMap[service.name] || Star,
      duration: `${service.duration} min`,
      basePrice: service.basePrice || service.price, // Handle both services and user_services
      basePriceUSD: service.basePrice || service.price // Store the numeric value for calculations
    };
  });

  const isDateDisabled = (date: Date) => {
    const availability = getConsultationDateAvailability(date, selectedProfessional);
    return !availability.available;
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {selectedProfessional ? `${selectedProfessional.stageName || selectedProfessional.user?.fullName || 'Professional'}'s Services` : 'Choose a Consultation'}
        </h3>
        <p className="text-gray-600 text-lg">
          {selectedProfessional
            ? `Select from ${selectedProfessional.stageName || selectedProfessional.user?.fullName || 'Professional'}'s available consultation services`
            : 'Select the type of professional guidance you need'
          }
        </p>

        {/* Currency Selector */}
        <div className="flex items-center justify-center mt-4 mb-2">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-700">Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-blue-600"
            >
              {Object.keys(CURRENCY_RATES).map(currency => (
                <option key={currency} value={currency}>
                  {CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS]} {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Prices shown in {selectedCurrency}. All payments processed in USD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultationTypesDisplay.map((type) => {
          const IconComponent = type.icon;
          const priceInSelectedCurrency = formatPrice(type.basePriceUSD, selectedCurrency);
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group ${form.watch('consultationType') === type.id
                  ? 'ring-4 ring-blue-500/30 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              onClick={() => {
                form.setValue('consultationType', type.id);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl transition-colors ${form.watch('consultationType') === type.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-600'
                    }`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-gray-800 mb-2">{type.name}</h4>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{type.description}</p>

                    {/* Facilitated by enhancement for user consultations */}
                    {type.facilitatedBy && (
                      <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">
                            Facilitated by {type.facilitatedBy}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <Badge variant="outline" className="font-medium">{type.duration}</Badge>
                      </div>
                      <span className="font-bold text-xl text-green-600">
                        {priceInSelectedCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProfessional && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedProfessional.profile?.avatarUrl} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {(selectedProfessional.stageName || selectedProfessional.user?.fullName || 'P').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-blue-800">
                  Professional Pre-selected: {selectedProfessional.stageName || selectedProfessional.user?.fullName || 'Professional'}
                </p>
                <p className="text-sm text-blue-600">
                  Choose your consultation type to continue
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProfessional(null);
                  form.setValue('professionalId', '');
                  setCurrentStep(1);
                }}
                className="text-gray-600 hover:text-gray-800 border-gray-300"
              >
                Unselect
              </Button>
              <Link href={`/services?tab=${originalTab}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 border-blue-300"
                >
                  Select Other
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => handleStepTransition(2)}
          disabled={!form.watch('consultationType')}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
        >
          {selectedProfessional ? 'Next: Schedule Session' : 'Next: Select Professional'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Professional Selection - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Select Your Professional
            </h3>
            <p className="text-gray-600 text-lg">Choose from our managed experts</p>
          </div>

          {professionalsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading professionals...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {professionals.filter((prof: Professional) => prof.isManaged).map((professional: Professional) => (
                <Card
                  key={professional.userId}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-102 ${form.watch('professionalId') === professional.userId?.toString()
                      ? 'ring-4 ring-blue-500/30 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  onClick={() => {
                    form.setValue('professionalId', professional.userId?.toString() || '');
                    setSelectedProfessional(professional);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                        <AvatarImage src={professional.profile?.avatarUrl || professional.bookingFormPictureUrl} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                          {(professional.stageName || professional.user?.fullName || 'User').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-xl text-gray-800">
                            {professional.stageName || professional.user?.fullName || 'Professional'}
                          </h4>
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1">
                            <Crown className="w-4 h-4 mr-1" />
                            Managed {professional.userType === 'artist' ? 'Artist' : professional.userType === 'musician' ? 'Musician' : 'Professional'}
                          </Badge>
                        </div>
                        {/* Show different info based on user type */}
                        {professional.userType === 'artist' && professional.genre && (
                          <p className="text-gray-600 mb-2 leading-relaxed">
                            <span className="font-medium">Genre:</span> {Array.isArray(professional.genre) ? professional.genre.join(', ') : professional.genre}
                          </p>
                        )}
                        {professional.userType === 'musician' && professional.instruments && (
                          <p className="text-gray-600 mb-2 leading-relaxed">
                            <span className="font-medium">Instruments:</span> {Array.isArray(professional.instruments) ? professional.instruments.join(', ') : professional.instruments}
                          </p>
                        )}
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {professional.profile?.bio ||
                            (professional.userType === 'artist' ? 'Talented managed artist available for consultation sessions' :
                              professional.userType === 'musician' ? 'Skilled managed musician offering professional consultation' :
                                'Experienced music industry professional with years of expertise')}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center text-yellow-500">
                              <Star className="w-5 h-5 mr-1 fill-current" />
                              <span className="font-semibold">4.9</span>
                            </div>
                            <div className="flex items-center text-green-600">
                              <Clock className="w-5 h-5 mr-1" />
                              <span className="font-medium">Available today</span>
                            </div>
                          </div>
                          <span className="font-bold text-2xl text-green-600">
                            {formatPrice(parseFloat(professional.basePrice.replace('$', '') || '125'), selectedCurrency)}/hr
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Session Details - 1/3 width - Only show when professional selected */}
        {selectedProfessional && (
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Session Duration</label>
                  <select
                    className="w-full p-3 border-2 border-blue-200 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={form.watch('sessionDuration')}
                    onChange={(e) => form.setValue('sessionDuration', e.target.value)}
                  >
                    {(() => {
                      const hourlyRateStr = selectedProfessional?.basePrice || '$125';
                      const hourlyRate = parseFloat(hourlyRateStr.replace('$', ''));
                      const durations = [
                        { minutes: 30, hours: 0.5 },
                        { minutes: 60, hours: 1 },
                        { minutes: 90, hours: 1.5 },
                        { minutes: 120, hours: 2 }
                      ];

                      return durations.map(({ minutes, hours }) => {
                        const priceUSD = Math.round(hourlyRate * hours);
                        const formattedPrice = formatPrice(priceUSD, selectedCurrency);
                        return (
                          <option key={minutes} value={minutes}>
                            {minutes} minutes - {formattedPrice}
                          </option>
                        );
                      });
                    })()}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Communication Method</label>
                  <select
                    className="w-full p-3 border-2 border-blue-200 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={form.watch('contactMethod')}
                    onChange={(e) => form.setValue('contactMethod', e.target.value)}
                  >
                    <option value="video">🎥 Video Call</option>
                    <option value="phone">📞 Phone Call</option>
                    <option value="in-person">🤝 In-Person Meeting</option>
                    <option value="chat">💬 Text Chat</option>
                  </select>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-gray-800 mb-2">Professional Terms</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 48-hour cancellation policy</li>
                    <li>• Session recordings available</li>
                    <li>• Follow-up notes included</li>
                    <li>• Flexible rescheduling options</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Back Button - Top */}
      <div className="flex justify-start mb-6">
        <Button
          variant="outline"
          onClick={() => {
            // Simple back navigation - go to previous step
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            }
          }}
          size="lg"
          className="px-6 py-3 text-lg"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Next Button - Bottom */}
      <div className="flex justify-end">
        <Button
          onClick={() => handleStepTransition(3)}
          disabled={!form.watch('professionalId')}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
        >
          Next: Schedule Session
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Schedule Your Session
        </h3>
        <p className="text-gray-600 text-lg">Choose your preferred date and time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Calendar */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <CalendarIcon className="w-6 h-6 mr-3" />
              Select Your Date
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Calendar Legend */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Calendar Legend</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-100 border-2 border-purple-200 rounded"></div>
                  <span>Premium Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-200 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              modifiers={{
                available: (date) => getConsultationDateAvailability(date, selectedProfessional).status === 'available',
                unavailable: (date) => getConsultationDateAvailability(date, selectedProfessional).status === 'unavailable',
                booked: (date) => getConsultationDateAvailability(date, selectedProfessional).status === 'booked',
                weekend: (date) => getConsultationDateAvailability(date, selectedProfessional).status === 'weekend',
                past: (date) => getConsultationDateAvailability(date, selectedProfessional).status === 'past',
                premium: (date) => getConsultationDateAvailability(date, selectedProfessional).status === 'premium',
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
                premium: {
                  backgroundColor: '#e9d5ff',
                  color: '#7c3aed',
                  border: '2px solid #c4b5fd',
                  borderRadius: '12px',
                  fontWeight: '600',
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
                width: '100%',
                '--rdp-cell-size': '100%',
                '--rdp-accent-color': '#3b82f6'
              }}
              className="w-full"
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
                day: "w-full h-full min-h-[50px] text-lg font-semibold flex items-center justify-center border border-gray-200 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer select-none",
                day_selected: "bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold border-2 border-blue-700 shadow-lg",
                day_today: "bg-blue-100 text-blue-800 border-blue-300",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none",
              }}
            />
          </CardContent>
        </Card>

        {/* Enhanced Time Slots */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Clock className="w-6 h-6 mr-3" />
              Available Times
              {selectedDate && (
                <span className="ml-3 text-lg font-normal bg-white/20 px-3 py-1 rounded-full">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!selectedDate ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Please select a date first</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    Morning Sessions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.filter(slot => slot.period === 'morning').map((slot) => (
                      <Button
                        key={`morning-${slot.time}`}
                        variant={selectedTime === slot.time ? 'default' : 'outline'}
                        className={`h-14 text-lg font-medium transition-all duration-200 ${selectedTime === slot.time
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                            : slot.available
                              ? 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                              : 'opacity-50 cursor-not-allowed bg-gray-100'
                          }`}
                        disabled={!slot.available}
                        onClick={() => {
                          setSelectedTime(slot.time);
                          form.setValue('preferredTime', slot.time);
                        }}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                    Afternoon Sessions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.filter(slot => slot.period === 'afternoon').map((slot) => (
                      <Button
                        key={`afternoon-${slot.time}`}
                        variant={selectedTime === slot.time ? 'default' : 'outline'}
                        className={`h-14 text-lg font-medium transition-all duration-200 ${selectedTime === slot.time
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                            : slot.available
                              ? 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                              : 'opacity-50 cursor-not-allowed bg-gray-100'
                          }`}
                        disabled={!slot.available}
                        onClick={() => {
                          setSelectedTime(slot.time);
                          form.setValue('preferredTime', slot.time);
                        }}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consultation Details Form */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">
            <MessageCircle className="w-6 h-6 mr-3" />
            Consultation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-lg font-semibold text-gray-700 block mb-3">
              What would you like to discuss?
            </label>
            <Textarea
              placeholder="Please describe your goals, challenges, or specific questions for this consultation session..."
              value={form.watch('description')}
              onChange={(e) => form.setValue('description', e.target.value)}
              className="min-h-[120px] text-lg p-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
              rows={5}
            />
          </div>

          <div>
            <label className="text-lg font-semibold text-gray-700 block mb-3">
              Budget Range (Optional)
            </label>
            <Input
              placeholder="e.g., $100-200 for this consultation"
              value={form.watch('budget')}
              onChange={(e) => form.setValue('budget', e.target.value)}
              className="text-lg p-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Back Button - Top */}
      <div className="flex justify-start mb-6">
        <Button
          variant="outline"
          onClick={() => {
            // Simple back navigation - go to previous step
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            }
          }}
          size="lg"
          className="px-6 py-3 text-lg"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Book Button - Bottom */}
      <div className="flex justify-end">
        <Button
          onClick={() => form.handleSubmit(handleSubmit)()}
          disabled={!selectedDate || !selectedTime || !form.watch('description')}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Book Consultation
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-8">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
        </div>

        <div>
          <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Consultation Successfully Booked!
          </h3>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Your consultation has been successfully scheduled. You'll receive a confirmation email with all the details and connection information.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 mr-3" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-700">Professional:</span>
                </div>
                <span className="font-bold text-gray-800">{selectedProfessional?.stageName || selectedProfessional?.user?.fullName || 'Professional'}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-700">Date:</span>
                </div>
                <span className="font-bold text-gray-800">{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-700">Time:</span>
                </div>
                <span className="font-bold text-gray-800">{selectedTime}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-700">Duration:</span>
                </div>
                <span className="font-bold text-gray-800">{form.watch('sessionDuration')} minutes</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-700">Method:</span>
                </div>
                <span className="font-bold text-gray-800 capitalize">{form.watch('contactMethod')}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-700">Service:</span>
                </div>
                <span className="font-bold text-gray-800">{consultationTypes.find(t => t.id === form.watch('consultationType'))?.name}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Confirmation email sent to your registered email address</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => {
            setCurrentStep(1);
            form.reset();
            setSelectedDate(undefined);
            setSelectedTime('');
            setSelectedProfessional(null);
          }}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
        >
          Book Another Consultation
        </Button>

        <Button
          variant="outline"
          onClick={() => window.history.back()}
          size="lg"
          className="px-8 py-3 text-lg border-2 border-blue-300 hover:bg-blue-50"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 mobile-safe">
      <div className="container mx-auto mobile-container py-4 sm:py-6 max-w-6xl">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Professional Consultation
            </h1>
            <p className="text-gray-600 text-lg">
              Get expert advice from industry professionals to advance your music career
            </p>
          </div>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="mb-6 sm:mb-12 px-2">
          <div className="flex items-center justify-between relative overflow-x-auto">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
            {[
              { step: 1, title: 'Choose Consultation', icon: FileText },
              { step: 2, title: 'Professional', icon: User },
              { step: 3, title: 'Schedule', icon: CalendarIcon },
              { step: 4, title: 'Confirmation', icon: CheckCircle },
            ].map((item, index) => (
              <div key={item.step} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shadow-lg ${currentStep >= item.step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white transform scale-110'
                    : 'bg-white text-gray-600 border-2 border-gray-200'
                  }`}>
                  {currentStep > item.step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <item.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`mt-2 text-sm font-medium ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                  {item.title}
                </span>
                {index < 3 && (
                  <div className={`absolute top-6 left-12 w-24 h-0.5 ${currentStep > item.step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}