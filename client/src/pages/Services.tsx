import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

// Currency conversion system
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

const convertCurrency = (amountUSD: number, targetCurrency: string): number => {
  const rate = CURRENCY_RATES[targetCurrency as keyof typeof CURRENCY_RATES] || 1;
  return Math.round(amountUSD * rate);
};

const formatPrice = (amountUSD: number, currency: string): string => {
  const convertedAmount = convertCurrency(amountUSD, currency);
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '$';
  return `${symbol}${convertedAmount}`;
};
import { 
  Music,
  Mic,
  Camera,
  Headphones,
  Guitar,
  Piano,
  Drum,
  Star,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  ShoppingCart
} from 'lucide-react';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [activeTab, setActiveTab] = useState('services');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const { addItem } = useCart();
  const { toast } = useToast();
  const [location] = useLocation();

  // Handle URL parameters for tab selection
  useEffect(() => {
    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);
    const tab = urlParams.get('tab');
    console.log('Services page - URL tab parameter:', tab);
    console.log('Services page - Window location search:', window.location.search);
    console.log('Services page - Wouter location:', location);
    if (tab && ['services', 'professionals', 'artists', 'musicians'].includes(tab)) {
      console.log('Services page - Setting active tab to:', tab);
      setActiveTab(tab);
    }
  }, [location]);

  // Use the new filtered endpoint that only returns managed users with services
  const { data: managedUsersData, isLoading: managedUsersLoading } = useQuery({
    queryKey: ['/api/managed-users-with-services'],
  });

  const { data: serviceCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/service-categories'],
  });

  const { data: adminServices = [], isLoading: adminServicesLoading } = useQuery({
    queryKey: ['/api/admin-services'],
  });

  const { data: userServices = [], isLoading: userServicesLoading } = useQuery({
    queryKey: ['/api/user-services'],
  });

  // Extract managed users with services - API already filters for users with services
  const managedProfessionals = (managedUsersData as any)?.professionals || [];
  const managedArtists = (managedUsersData as any)?.artists || [];
  const managedMusicians = (managedUsersData as any)?.musicians || [];



  // CLEAN SEPARATION: Only show core Wai'tuMusic services (exclude consultations)
  const coreWaituMusicServices = (adminServices as any[]).filter((service: any) => 
    !service.name.toLowerCase().includes('consultation')
  ) || [];
  
  const allServices = [
    ...coreWaituMusicServices.map((service: any) => ({ ...service, type: 'waitumusic_core' })),

  ];

  // Count services correctly - All Services tab shows admin + user services only
  const professionalServiceCount = managedProfessionals.length;
  const artistServiceCount = managedArtists.length;
  const musicianServiceCount = managedMusicians.length;
  const totalServices = allServices.length; // Only count admin + user services for "All Services" tab

  // Filter services based on search and filters
  const filteredServices = allServices.filter((service: any) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || service.categoryId === parseInt(categoryFilter);
    
    const matchesPrice = !priceFilter || 
                        (priceFilter === 'under50' && parseFloat(service.basePrice || service.price) < 50) ||
                        (priceFilter === '50to100' && parseFloat(service.basePrice || service.price) >= 50 && parseFloat(service.basePrice || service.price) <= 100) ||
                        (priceFilter === 'over100' && parseFloat(service.basePrice || service.price) > 100);

    return matchesSearch && matchesCategory && matchesPrice;
  })



  // Loading states
  const isLoading = managedUsersLoading || categoriesLoading || adminServicesLoading || userServicesLoading;

  const priceRanges = [
    { value: 'under50', label: 'Under $50' },
    { value: '50to100', label: '$50 - $100' },
    { value: 'over100', label: 'Over $100' }
  ];

  const handleAddToCart = (service: any) => {
    try {
      addItem({
        type: 'merchandise', // Using merchandise type for services
        itemId: service.id,
        title: service.name,
        artist: service.provider,
        price: service.price,
        quantity: 1,
      });
      
      toast({
        title: "Added to cart",
        description: `${service.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getServiceIcon = (iconName: any) => {
    const IconComponent = iconName;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Comprehensive Music Solutions
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-6">
            Essential music industry services exclusively provided by Wai'tuMusic - splitsheets, ISRC coding, and PRO registration
          </p>
          
          {/* Currency Selector */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-4 py-2 shadow-lg">
              <span className="text-sm font-medium text-white">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-white"
                style={{ backgroundColor: 'transparent' }}
              >
                {Object.keys(CURRENCY_RATES).map(currency => (
                  <option key={currency} value={currency} className="text-black">
                    {CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS]} {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-2">
            Prices shown in {selectedCurrency}. All payments processed in USD.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">
              Core Services ({totalServices})
            </TabsTrigger>
            <TabsTrigger value="professionals">
              Professionals ({managedProfessionals.length})
            </TabsTrigger>
            <TabsTrigger value="artists">
              Artists ({managedArtists.length})
            </TabsTrigger>
            <TabsTrigger value="musicians">
              Musicians ({managedMusicians.length})
            </TabsTrigger>
          </TabsList>

          {/* All Services Tab */}
          <TabsContent value="services" className="space-y-8">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {(serviceCategories as any[]).map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing {filteredServices.length} of {allServices.length} services
                </p>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Music className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {service.type === 'waitumusic_service' ? 'Wai\'tuMusic Service' : 
                             service.type === 'admin' ? 'WaiTu Music' : 'User Service'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {(serviceCategories as any[]).find((c: any) => c.id === service.categoryId)?.name}
                      </Badge>
                    </div>

                    {/* Service Details */}
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.description}
                    </p>

                    {/* Features */}
                    {service.features && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Includes:</p>
                        <div className="space-y-1">
                          {(Array.isArray(service.features) ? service.features : []).map((feature: string, index: number) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Service Info */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{service.duration ? `${service.duration}min` : service.unit || 'session'}</span>
                      </div>
                      {service.enableRating !== false && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span>4.8 (12)</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">
                          ${parseFloat(service.basePrice || service.price).toFixed(0)}
                        </span>
                        <span className="text-muted-foreground text-sm">/{service.unit || 'session'}</span>
                      </div>
                      <div className="space-x-2">
                        {service.type === 'waitumusic_service' && service.id === 'pro-registration-service' ? (
                          <Link to="/pro-registration">
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Start Registration
                            </Button>
                          </Link>
                        ) : service.type === 'waitumusic_service' && service.id === 'splitsheet-service' ? (
                          <Link to="/splitsheet">
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Create Splitsheet
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddToCart(service)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setPriceFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Managed Professionals</h2>
              <p className="text-muted-foreground">
                Click on any professional to book a consultation session with them directly.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : managedProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managedProfessionals.map((professional: any) => (
                  <Card key={professional.userId}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">
                        {professional.user?.fullName || professional.user?.name || 'Professional'}
                      </h3>
                      {professional.services && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {Array.isArray(professional.services) 
                            ? professional.services.join(', ')
                            : typeof professional.services === 'string' 
                              ? (() => {
                                  try {
                                    return JSON.parse(professional.services).join(', ');
                                  } catch {
                                    return professional.services;
                                  }
                                })()
                              : ''
                          }
                        </p>
                      )}
                      {professional.basePrice && (
                        <p className="text-lg font-bold mb-3">
                          From ${professional.basePrice}/hr
                        </p>
                      )}
                      <Link to={`/consultation?professional=${professional.userId}`}>
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Consultation
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No managed professionals available</h3>
                <p className="text-muted-foreground">
                  Check back later for professional services
                </p>
              </div>
            )}
          </TabsContent>

          {/* Artists Tab */}
          <TabsContent value="artists" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Managed Artists</h2>
              <p className="text-muted-foreground">
                Click on any artist to book a consultation session with them directly.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : managedArtists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managedArtists.map((artist: any) => (
                  <Card key={artist.userId}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Star className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">
                        {artist.stageName || artist.user?.fullName}
                      </h3>
                      {artist.genre && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {Array.isArray(artist.genre) 
                            ? artist.genre.join(', ')
                            : typeof artist.genre === 'string' 
                              ? (() => {
                                  try {
                                    return JSON.parse(artist.genre).join(', ');
                                  } catch {
                                    return artist.genre;
                                  }
                                })()
                              : artist.genre
                          }
                        </p>
                      )}
                      {artist.basePrice && (
                        <p className="text-lg font-bold mb-3">
                          From ${artist.basePrice}/session
                        </p>
                      )}
                      <Link to={`/consultation?professional=${artist.userId}`}>
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Consultation
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No managed artists available</h3>
                <p className="text-muted-foreground">
                  Check back later for artist consultation services
                </p>
              </div>
            )}
          </TabsContent>

          {/* Musicians Tab */}
          <TabsContent value="musicians" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Managed Musicians</h2>
              <p className="text-muted-foreground">
                Click on any musician to book a consultation session with them directly.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : managedMusicians.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managedMusicians.map((musician: any) => (
                  <Card key={musician.userId}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Music className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">
                        {musician.user?.fullName || musician.user?.name || 'Musician'}
                      </h3>
                      {musician.instruments && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {Array.isArray(musician.instruments) 
                            ? musician.instruments.join(', ')
                            : typeof musician.instruments === 'string' 
                              ? (() => {
                                  try {
                                    return JSON.parse(musician.instruments).join(', ');
                                  } catch {
                                    return musician.instruments;
                                  }
                                })()
                              : musician.instruments
                          }
                        </p>
                      )}
                      {musician.basePrice && (
                        <p className="text-lg font-bold mb-3">
                          From ${musician.basePrice}/session
                        </p>
                      )}
                      <Link to={`/consultation?professional=${musician.userId}`}>
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Consultation
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No managed musicians available</h3>
                <p className="text-muted-foreground">
                  Check back later for musician consultation bookings
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
