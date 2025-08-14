import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CuratorManagement } from '@/components/CuratorManagement';
import { 
  Music, 
  ShoppingCart, 
  Play, 
  Package,
  Tag,
  Sparkles,
  Gift,
  Users,
  TrendingUp,
  Star,
  Heart,
  DollarSign,
  Search,
  Filter,
  SortAsc,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface StoreCurrency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: string;
  isActive: boolean;
}

interface Song {
  id: number;
  title: string;
  artistUserId: number;
  price: string;
  isFree: boolean;
  coverArtUrl?: string;
  previewStartSeconds: number;
  durationSeconds: number;
  artist?: {
    stageName: string;
    genre: string;
  };
}

interface Bundle {
  id: number;
  name: string;
  description: string;
  artistUserId: number;
  imageUrl?: string;
  artist?: {
    stageName: string;
    genre: string;
  };
  items: any[];
  discountConditions: any[];
}

interface Artist {
  userId: number;
  stageName: string;
  stageNames?: any[];
  primaryGenre?: string;
  secondaryGenres?: any[];
  topGenres?: any[];
  socialMediaHandles?: any[];
  basePrice?: string;
  managementTierId?: number;
  isManaged?: boolean;
  bookingFormPictureUrl?: string;
  performingRightsOrganization?: string;
  ipiNumber?: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
    roleId: number;
  };
  profile?: {
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    socialLinks?: any;
    websiteUrl?: string;
    phoneNumber?: string;
  };
}

interface StoreData {
  songs: Song[];
  bundles: Bundle[];
  currencies: StoreCurrency[];
}

export default function Store() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedTab, setSelectedTab] = useState('songs');
  const [sortBy, setSortBy] = useState('random');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [viewMode, setViewMode] = useState<'content' | 'profile'>('content');
  const { addItem } = useCart();
  const { toast } = useToast();
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Check if user is admin or superadmin for curator access
  const canAccessCuratorManagement = user?.roleId === 1 || user?.roleId === 2;

  // Handle URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam) {
      switch (filterParam) {
        case 'music':
          setSelectedTab('songs');
          break;
        case 'merch':
        case 'merchandise':
          setSelectedTab('bundles'); // Using bundles for merchandise for now
          break;
        case 'artist':
        case 'artists':
          setSelectedTab('artists');
          break;
        default:
          setSelectedTab('songs');
      }
    }
  }, [location]);

  // Function to randomize array order
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Sorting functions
  const sortItems = (items: any[], type: 'songs' | 'artists' | 'bundles') => {
    const itemsCopy = [...items];
    
    // For artists, always prioritize managed artists first, then managed musicians
    if (type === 'artists') {
      itemsCopy.sort((a, b) => {
        const aManaged = isArtistManaged(a.userId);
        const bManaged = isArtistManaged(b.userId);
        
        // Managed artists come first
        if (aManaged && !bManaged) return -1;
        if (!aManaged && bManaged) return 1;
        
        // Within each group (managed/unmanaged), apply the selected sorting
        switch (sortBy) {
          case 'alphabetical':
            return a.stageName.localeCompare(b.stageName);
          case 'popularity':
            return a.stageName.localeCompare(b.stageName);
          case 'random':
          default:
            return Math.random() - 0.5;
        }
      });
      
      return itemsCopy;
    }
    
    // For non-artists, use regular sorting
    switch (sortBy) {
      case 'alphabetical':
        return itemsCopy.sort((a, b) => {
          const nameA = type === 'artists' ? a.stageName : (a.title || a.name);
          const nameB = type === 'artists' ? b.stageName : (b.title || b.name);
          return nameA.localeCompare(nameB);
        });
      case 'price-low':
        return itemsCopy.sort((a, b) => {
          const priceA = parseFloat(a.price || '0');
          const priceB = parseFloat(b.price || '0');
          return priceA - priceB;
        });
      case 'price-high':
        return itemsCopy.sort((a, b) => {
          const priceA = parseFloat(a.price || '0');
          const priceB = parseFloat(b.price || '0');
          return priceB - priceA;
        });
      case 'popularity':
        // For now, sort by artist name as a proxy for popularity
        return itemsCopy.sort((a, b) => {
          const artistA = a.artist?.stageName || a.stageName || '';
          const artistB = b.artist?.stageName || b.stageName || '';
          return artistA.localeCompare(artistB);
        });
      case 'random':
      default:
        return shuffleArray(itemsCopy);
    }
  };

  // Filter functions
  const filterItems = (items: any[], type: 'songs' | 'artists' | 'bundles') => {
    // let filtered = [...items];
    let filtered = [...(items ?? [])];


    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchableText = type === 'artists' 
          ? `${item.stageName} ${item.bio || ''} ${item.genre || ''}`
          : `${item.title || item.name} ${item.artist?.stageName || ''} ${item.description || ''}`;
        return searchableText.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(item => {
        const genre = item.genre || item.artist?.genre || '';
        return genre.toLowerCase().includes(genreFilter.toLowerCase());
      });
    }

    // Price filter
    if (priceFilter !== 'all' && type !== 'artists') {
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price || '0');
        switch (priceFilter) {
          case 'free':
            return item.isFree || price === 0;
          case 'under-10':
            return price > 0 && price < 10;
          case 'under-25':
            return price >= 10 && price < 25;
          case 'over-25':
            return price >= 25;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Get all unique genres from songs and artists
  const getAllGenres = () => {
    const genres = new Set<string>();
    storeData?.songs?.forEach(song => {
      if (song.artist?.genre) genres.add(song.artist.genre);
    });
    artists?.forEach(artist => {
      if (artist.genre) genres.add(artist.genre);
    });
    return Array.from(genres).sort();
  };

  const { data: storeData, isLoading } = useQuery<StoreData>({
    queryKey: ['/api/store-data'],
  });

  const { data: currencies = [] } = useQuery<StoreCurrency[]>({
    queryKey: ['/api/store-currencies'],
  });

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
  });

  // Get artist's content (songs and merchandise)
  const getArtistContent = (artistUserId: number) => {
    const artistSongs = storeData?.songs?.filter(song => song.artistUserId === artistUserId) || [];
    const artistBundles = storeData?.bundles?.filter(bundle => bundle.artistUserId === artistUserId) || [];
    return { songs: artistSongs, bundles: artistBundles };
  };

  // Check if artist is managed (has content)
  const isArtistManaged = (artistUserId: number) => {
    const content = getArtistContent(artistUserId);
    return content.songs.length > 0 || content.bundles.length > 0;
  };

  // Handle artist card click
  const handleArtistClick = (artist: Artist) => {
    if (isArtistManaged(artist.userId)) {
      setSelectedArtist(artist);
      setViewMode('content');
      setSelectedTab('artist-detail');
    }
  };

  // Handle view profile click
  const handleViewProfile = (artist: Artist) => {
    setSelectedArtist(artist);
    setViewMode('profile');
    setSelectedTab('artist-detail');
  };

  // Handle back to artists
  const handleBackToArtists = () => {
    setSelectedArtist(null);
    setSelectedTab('artists');
  };

  // Convert price based on selected currency
  const convertPrice = (usdPrice: string, currency: string) => {
    if (currency === 'USD') return parseFloat(usdPrice);
    
    const currencyData = currencies.find(c => c.code === currency);
    if (!currencyData) return parseFloat(usdPrice);
    
    return parseFloat(usdPrice) * parseFloat(currencyData.exchangeRate);
  };

  const formatPrice = (price: number, currency: string) => {
    const currencyData = currencies.find(c => c.code === currency);
    const symbol = currencyData?.symbol || '$';
    return `${symbol}${price.toFixed(2)}`;
  };

  const handleAddToCart = (item: any, type: 'song' | 'bundle') => {
    const convertedPrice = convertPrice(item.price || '0', selectedCurrency);
    addItem({
      id: item.id,
      name: item.title || item.name,
      price: convertedPrice,
      type,
      quantity: 1,
      currency: selectedCurrency
    });
    
    toast({
      title: "Added to Cart",
      description: `${item.title || item.name} has been added to your cart`,
    });
  };

  const calculateBundleDiscount = (bundle: Bundle) => {
    if (!bundle.items || bundle.items.length === 0) return 0;
    
    // Calculate total original price
    const originalTotal = bundle.items.reduce((sum, item) => {
      if (item.details?.price) {
        return sum + parseFloat(item.details.price);
      }
      return sum;
    }, 0);

    // Apply discount conditions
    let discountAmount = 0;
    bundle.discountConditions.forEach(condition => {
      if (condition.isActive) {
        if (condition.discountType === 'percentage' && condition.percentageAmount) {
          discountAmount += originalTotal * (parseFloat(condition.percentageAmount) / 100);
        } else if (condition.discountType === 'fixed' && condition.fixedAmount) {
          discountAmount += parseFloat(condition.fixedAmount);
        }
      }
    });

    return Math.min(discountAmount, originalTotal * 0.9); // Max 90% discount
  };

  const getBundlePrice = (bundle: Bundle) => {
    if (!bundle.items || bundle.items.length === 0) return 0;
    
    const originalTotal = bundle.items.reduce((sum, item) => {
      if (item.details?.price) {
        return sum + parseFloat(item.details.price);
      }
      return sum;
    }, 0);

    const discount = calculateBundleDiscount(bundle);
    return Math.max(originalTotal - discount, 0);
  };

  const getDiscountPercentage = (bundle: Bundle) => {
    if (!bundle.items || bundle.items.length === 0) return 0;
    
    const originalTotal = bundle.items.reduce((sum, item) => {
      if (item.details?.price) {
        return sum + parseFloat(item.details.price);
      }
      return sum;
    }, 0);

    const discount = calculateBundleDiscount(bundle);
    return originalTotal > 0 ? Math.round((discount / originalTotal) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Wai'tuMusic Store
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover amazing music, exclusive merchandise, and special bundles from our talented artists
            </p>
            
            {/* Currency Selector */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-sm text-gray-300">Currency:</span>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-xs">
                Payments processed in USD
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtering and Sorting Controls */}
        <div className="mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-lg border">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search songs, artists, bundles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-600" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {getAllGenres().map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter */}
            {selectedTab !== 'artists' && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="under-10">Under $10</SelectItem>
                    <SelectItem value="under-25">$10 - $25</SelectItem>
                    <SelectItem value="over-25">Over $25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className={`grid w-full ${
            selectedTab === 'artist-detail' 
              ? (canAccessCuratorManagement ? 'grid-cols-6' : 'grid-cols-5')
              : (canAccessCuratorManagement ? 'grid-cols-5' : 'grid-cols-4')
          } mb-8`}>
            <TabsTrigger value="songs" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Songs ({storeData?.songs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="bundles" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Bundles ({storeData?.bundles?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Artists ({artists?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Featured
            </TabsTrigger>
            {canAccessCuratorManagement && (
              <TabsTrigger value="curator-management" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Curator Network
              </TabsTrigger>
            )}
            {selectedTab === 'artist-detail' && selectedArtist && (
              <TabsTrigger value="artist-detail" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {selectedArtist.stageName}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Songs Tab */}
          <TabsContent value="songs">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Music Catalog</h2>
              <p className="text-gray-600">Discover individual tracks from our amazing artists</p>
              <p className="text-sm text-gray-500 mt-1">
                Showing {sortItems(filterItems(storeData?.songs || [], 'songs'), 'songs').length} of {storeData?.songs?.length || 0} songs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortItems(filterItems(storeData?.songs || [], 'songs'), 'songs').map((song) => (
                <Card key={song.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      {song.coverArtUrl ? (
                        <img 
                          src={song.coverArtUrl} 
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-12 h-12 text-white" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="secondary" className="rounded-full w-12 h-12 p-0">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-sm font-medium line-clamp-2">{song.title}</CardTitle>
                    <p className="text-xs text-gray-500">{song.artist?.stageName}</p>
                    {song.artist?.genre && (
                      <Badge variant="outline" className="text-xs w-fit">{song.artist.genre}</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      {song.isFree ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          FREE
                        </Badge>
                      ) : (
                        <span className="font-bold text-lg">
                          {formatPrice(convertPrice(song.price, selectedCurrency), selectedCurrency)}
                        </span>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => handleAddToCart(song, 'song')}
                        className="flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Special Bundles</h2>
              <p className="text-gray-600">Amazing deals combining songs and merchandise</p>
              <p className="text-sm text-gray-500 mt-1">
                Showing {sortItems(filterItems(storeData?.bundles || [], 'bundles'), 'bundles').length} of {storeData?.bundles?.length || 0} bundles
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortItems(filterItems(storeData?.bundles || [], 'bundles'), 'bundles').map((bundle) => {
                const originalPrice = bundle.items?.reduce((sum, item) => {
                  if (item.details?.price) {
                    return sum + parseFloat(item.details.price);
                  }
                  return sum;
                }, 0) || 0;
                const bundlePrice = getBundlePrice(bundle);
                const discountPercent = getDiscountPercentage(bundle);
                
                return (
                  <Card key={bundle.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        {bundle.imageUrl ? (
                          <img 
                            src={bundle.imageUrl} 
                            alt={bundle.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-white" />
                        )}
                        {discountPercent > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-500 text-white">
                              {discountPercent}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold">{bundle.name}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
                      <p className="text-xs text-gray-500">by {bundle.artist?.stageName}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="font-medium mb-1">Includes {bundle.items?.length || 0} items:</p>
                          <ul className="text-xs text-gray-600">
                            {bundle.items?.slice(0, 3).map((item, idx) => (
                              <li key={idx}>• {item.details?.title || item.details?.name || 'Item'}</li>
                            ))}
                            {bundle.items?.length > 3 && (
                              <li>• And {bundle.items.length - 3} more...</li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            {discountPercent > 0 && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(convertPrice(originalPrice.toString(), selectedCurrency), selectedCurrency)}
                              </p>
                            )}
                            <p className="font-bold text-lg">
                              {formatPrice(convertPrice(bundlePrice.toString(), selectedCurrency), selectedCurrency)}
                            </p>
                          </div>
                          <Button 
                            onClick={() => handleAddToCart({...bundle, price: bundlePrice.toString()}, 'bundle')}
                            className="flex items-center gap-1"
                          >
                            <Gift className="w-4 h-4" />
                            Add Bundle
                          </Button>
                        </div>

                        {bundle.discountConditions?.some(c => c.isActive && c.conditionType) && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Special Conditions Apply
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Artists Tab */}
          <TabsContent value="artists">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Our Artists</h2>
              <p className="text-gray-600">Managed artists with content appear first. Click on managed artist cards to view their catalog.</p>
              <p className="text-sm text-gray-500 mt-1">
                Showing {sortItems(filterItems(artists, 'artists'), 'artists')?.length} of {artists?.length || 0} artists
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortItems(filterItems(artists, 'artists'), 'artists')?.map((artist) => (
                <Card 
                  key={artist.userId} 
                  className={`group transition-all duration-300 hover:-translate-y-1 ${
                    isArtistManaged(artist.userId) 
                      ? 'hover:shadow-lg cursor-pointer hover:border-blue-300' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => isArtistManaged(artist.userId) && handleArtistClick(artist)}
                >
                  <CardHeader className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      {artist.profile?.avatarUrl ? (
                        <img 
                          src={artist.profile.avatarUrl} 
                          alt={artist.stageName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-12 h-12 text-gray-500" />
                      )}
                      {isArtistManaged(artist.userId) && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-3">
                            <Play className="w-5 h-5 text-gray-800" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm font-medium line-clamp-2">{artist.stageName}</CardTitle>
                    {artist.primaryGenre && (
                      <Badge variant="outline" className="text-xs w-fit">{artist.primaryGenre}</Badge>
                    )}
                    {artist.profile?.bio && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{artist.profile.bio}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(artist);
                        }}
                      >
                        <Users className="w-3 h-3" />
                        View Profile
                      </Button>
                      <Button 
                        size="sm"
                        variant={isArtistManaged(artist.userId) ? "default" : "outline"}
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArtistClick(artist);
                        }}
                        disabled={!isArtistManaged(artist.userId)}
                      >
                        <Music className="w-3 h-3" />
                        {isArtistManaged(artist.userId) ? 'View Content' : 'No Content'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Artist Detail Tab */}
          {selectedArtist && (
            <TabsContent value="artist-detail">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBackToArtists}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Artists
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedArtist.stageName}</h2>
                    <p className="text-gray-600">
                      {selectedArtist.genre && <Badge variant="outline" className="mr-2">{selectedArtist.genre}</Badge>}
                      {viewMode === 'content' ? 'Complete catalog and merchandise' : 'Artist profile and information'}
                    </p>
                  </div>
                  
                  {/* Toggle between Profile and Content views */}
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'profile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('profile')}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Profile
                    </Button>
                    {isArtistManaged(selectedArtist.userId) && (
                      <Button
                        variant={viewMode === 'content' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('content')}
                        className="flex items-center gap-2"
                      >
                        <Music className="w-4 h-4" />
                        Content
                      </Button>
                    )}
                  </div>
                </div>
                
                {selectedArtist.bio && (
                  <p className="text-gray-600 mb-4 max-w-2xl">{selectedArtist.bio}</p>
                )}

                {(() => {
                  const content = getArtistContent(selectedArtist.userId);
                  return (
                    <p className="text-sm text-gray-500">
                      {content.songs.length} songs • {content.bundles.length} bundles available
                    </p>
                  );
                })()}
              </div>
              
              {viewMode === 'profile' ? (
                /* Profile View */
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                          {selectedArtist.profile?.avatarUrl ? (
                            <img 
                              src={selectedArtist.profile.avatarUrl} 
                              alt={selectedArtist.stageName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-16 h-16 text-gray-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{selectedArtist.stageName}</h3>
                        {selectedArtist.primaryGenre && (
                          <Badge variant="secondary" className="mb-3">{selectedArtist.primaryGenre}</Badge>
                        )}
                        <p className="text-gray-700 mb-4">{selectedArtist.profile?.bio || selectedArtist.bio || 'Artist profile information not available.'}</p>
                        
                        {/* Content Stats */}
                        {(() => {
                          const content = getArtistContent(selectedArtist.userId);
                          return (
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Music className="w-4 h-4" />
                                {content.songs.length} Songs
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {content.bundles.length} Bundles
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {isArtistManaged(selectedArtist.userId) ? 'Managed Artist' : 'Independent Artist'}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  {selectedArtist.socialMediaHandles && selectedArtist.socialMediaHandles.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Connect with {selectedArtist.stageName}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedArtist.socialMediaHandles.map((social: any, index: number) => (
                          <a
                            key={index}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                          >
                            <span className="capitalize">{social.platform}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info Sections */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Music className="w-5 h-5" />
                          Musical Style
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">

                          
                          {/* Primary Genre - Most prominently highlighted */}
                          {selectedArtist.primaryGenre && (
                            <div>
                              <Badge variant="default" className="font-bold text-base px-3 py-1 bg-blue-600 text-white">
                                {selectedArtist.primaryGenre}
                              </Badge>
                              <span className="text-xs text-gray-500 ml-2">Primary Genre</span>
                            </div>
                          )}
                          
                          {/* Top/Strong Genres - Secondarily highlighted */}
                          {selectedArtist.topGenres && selectedArtist.topGenres.length > 0 && (
                            <div>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {selectedArtist.topGenres.map((genre: any, index: number) => (
                                  <Badge key={index} variant="secondary" className="font-semibold text-sm px-2 py-1 bg-blue-100 text-blue-800">
                                    {typeof genre === 'string' ? genre : genre.name}
                                  </Badge>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">Strong Genres</span>
                            </div>
                          )}
                          
                          {/* Secondary Genres - Regular display */}
                          {selectedArtist.secondaryGenres && selectedArtist.secondaryGenres.length > 0 && (
                            <div>
                              <div className="flex flex-wrap gap-1 mb-1">
                                {selectedArtist.secondaryGenres.map((genre: any, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs font-normal">
                                    {typeof genre === 'string' ? genre : genre.name}
                                    {(typeof genre === 'object' && genre.isCustom) && <span className="ml-1">⭐</span>}
                                  </Badge>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">Other Genres</span>
                            </div>
                          )}
                          
                          {/* Show minimal text when no genre data is available */}
                          {(!selectedArtist.primaryGenre && !selectedArtist.topGenres?.length && !selectedArtist.secondaryGenres?.length) && (
                            <div className="text-center py-2">
                              <span className="text-gray-400 text-xs italic">No genre information available</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Artist Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {/* Management Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Artist Type:</span>
                            <Badge variant={selectedArtist.isManaged || isArtistManaged(selectedArtist.userId) ? "default" : "outline"}>
                              {selectedArtist.isManaged || isArtistManaged(selectedArtist.userId) ? 
                                `Managed by Wai'tuMusic` : 
                                'Independent Artist'}
                            </Badge>
                          </div>
                          
                          {/* Content Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Store Content:</span>
                            <Badge variant={(() => {
                              const content = getArtistContent(selectedArtist.userId);
                              const hasContent = content.songs.length > 0 || content.bundles.length > 0;
                              return hasContent ? "default" : "secondary";
                            })()}>
                              {(() => {
                                const content = getArtistContent(selectedArtist.userId);
                                const songCount = content.songs.length;
                                const bundleCount = content.bundles.length;
                                
                                if (songCount > 0 && bundleCount > 0) {
                                  return `${songCount} songs, ${bundleCount} bundles`;
                                } else if (songCount > 0) {
                                  return `${songCount} songs available`;
                                } else if (bundleCount > 0) {
                                  return `${bundleCount} bundles available`;
                                } else {
                                  return 'No content yet';
                                }
                              })()}
                            </Badge>
                          </div>
                          
                          {/* Management Tier (if managed) */}
                          {(selectedArtist.isManaged || isArtistManaged(selectedArtist.userId)) && selectedArtist.managementTierId && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Management Tier:</span>
                              <Badge variant="secondary">
                                Tier {selectedArtist.managementTierId}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Genre if available */}
                          {selectedArtist.primaryGenre && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Primary Genre:</span>
                              <Badge variant="outline">
                                {selectedArtist.primaryGenre}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Call to Action */}
                  {isArtistManaged(selectedArtist.userId) && (
                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">Explore {selectedArtist.stageName}'s Music</h3>
                          <p className="text-gray-600 mb-4">
                            {(() => {
                              const content = getArtistContent(selectedArtist.userId);
                              const songCount = content.songs.length;
                              const bundleCount = content.bundles.length;
                              
                              if (songCount > 0 && bundleCount > 0) {
                                return `Browse ${songCount} songs and ${bundleCount} special bundles from ${selectedArtist.stageName}`;
                              } else if (songCount > 0) {
                                return `Browse ${songCount} songs from ${selectedArtist.stageName}`;
                              } else if (bundleCount > 0) {
                                return `Browse ${bundleCount} special bundles from ${selectedArtist.stageName}`;
                              } else {
                                return `Explore ${selectedArtist.stageName}'s music catalog`;
                              }
                            })()}
                          </p>
                          <Button 
                            onClick={() => setViewMode('content')}
                            className="flex items-center gap-2"
                          >
                            <Music className="w-4 h-4" />
                            View Music Catalog
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* No content message for independent artists */}
                  {!isArtistManaged(selectedArtist.userId) && (
                    <Card className="bg-gray-50">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">{selectedArtist.stageName}</h3>
                          <p className="text-gray-500">
                            {selectedArtist.profile?.bio || selectedArtist.bio || "This artist's content is not currently available in our store."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                /* Content View */
                (() => {
                  const content = getArtistContent(selectedArtist.userId);
                  return (
                    <div className="space-y-8">
                      {/* Artist's Songs */}
                      {content.songs.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Music className="w-5 h-5" />
                          Songs ({content.songs.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {content.songs.map((song) => (
                            <Card key={song.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                              <CardHeader className="p-4">
                                <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                  {song.coverArtUrl ? (
                                    <img 
                                      src={song.coverArtUrl} 
                                      alt={song.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Music className="w-12 h-12 text-white" />
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button size="sm" variant="secondary" className="rounded-full w-12 h-12 p-0">
                                      <Play className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <CardTitle className="text-sm font-medium line-clamp-2">{song.title}</CardTitle>
                                <p className="text-xs text-gray-500">{selectedArtist.stageName}</p>
                                {selectedArtist.genre && (
                                  <Badge variant="outline" className="text-xs w-fit">{selectedArtist.genre}</Badge>
                                )}
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="flex items-center justify-between">
                                  {song.isFree ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      FREE
                                    </Badge>
                                  ) : (
                                    <span className="font-bold text-lg">
                                      {formatPrice(convertPrice(song.price, selectedCurrency), selectedCurrency)}
                                    </span>
                                  )}
                                  <Button 
                                    size="sm"
                                    onClick={() => handleAddToCart(song, 'song')}
                                    className="flex items-center gap-1"
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    Add
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Artist's Bundles/Merchandise */}
                    {content.bundles.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Bundles & Merchandise ({content.bundles.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {content.bundles.map((bundle) => {
                            const bundlePrice = getBundlePrice(bundle);
                            const discountPercent = getDiscountPercentage(bundle);
                            
                            return (
                              <Card key={bundle.id} className="group hover:shadow-lg transition-all duration-300">
                                <CardHeader className="p-4">
                                  <div className="aspect-video bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                    {bundle.imageUrl ? (
                                      <img 
                                        src={bundle.imageUrl} 
                                        alt={bundle.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-12 h-12 text-white" />
                                    )}
                                    {discountPercent > 0 && (
                                      <div className="absolute top-2 right-2">
                                        <Badge className="bg-red-500 text-white">
                                          {discountPercent}% OFF
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  <CardTitle className="text-lg font-bold">{bundle.name}</CardTitle>
                                  <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
                                  <p className="text-xs text-gray-500">by {selectedArtist.stageName}</p>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  <div className="space-y-3">
                                    <div className="text-sm">
                                      <p className="font-medium mb-1">Includes {bundle.items?.length || 0} items:</p>
                                      <ul className="text-xs text-gray-600">
                                        {bundle.items?.slice(0, 3).map((item, idx) => (
                                          <li key={idx}>• {item.details?.title || item.details?.name || 'Item'}</li>
                                        ))}
                                        {bundle.items?.length > 3 && (
                                          <li>• And {bundle.items.length - 3} more...</li>
                                        )}
                                      </ul>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-bold text-lg">
                                          {formatPrice(convertPrice(bundlePrice.toString(), selectedCurrency), selectedCurrency)}
                                        </p>
                                      </div>
                                      <Button 
                                        onClick={() => handleAddToCart({...bundle, price: bundlePrice.toString()}, 'bundle')}
                                        className="flex items-center gap-1"
                                      >
                                        <Gift className="w-4 h-4" />
                                        Add Bundle
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                      {/* No content message */}
                      {content.songs.length === 0 && content.bundles.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Content Available</h3>
                          <p className="text-gray-500">This artist doesn't have any songs or merchandise in the store yet.</p>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </TabsContent>
          )}

          {/* Featured Tab */}
          <TabsContent value="featured">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Featured Items</h2>
              <p className="text-gray-600">Handpicked favorites and trending content</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Featured Song */}
              {storeData?.songs?.slice(0, 1).map((song) => (
                <Card key={song.id} className="relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Music className="w-16 h-16 text-white" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{song.title}</h3>
                    <p className="text-gray-600 mb-4">by {song.artist?.stageName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {song.isFree ? 'FREE' : formatPrice(convertPrice(song.price, selectedCurrency), selectedCurrency)}
                      </span>
                      <Button 
                        size="lg"
                        onClick={() => handleAddToCart(song, 'song')}
                        className="flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Featured Bundle */}
              {storeData?.bundles?.slice(0, 1).map((bundle) => {
                const bundlePrice = getBundlePrice(bundle);
                const discountPercent = getDiscountPercentage(bundle);
                
                return (
                  <Card key={bundle.id} className="relative overflow-hidden">
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-orange-500 text-orange-900">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Hot Deal
                      </Badge>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center">
                      <Package className="w-16 h-16 text-white" />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{bundle.name}</h3>
                      <p className="text-gray-600 mb-4">{bundle.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          {discountPercent > 0 && (
                            <Badge className="bg-red-100 text-red-800 mb-2">
                              {discountPercent}% OFF
                            </Badge>
                          )}
                          <p className="text-2xl font-bold">
                            {formatPrice(convertPrice(bundlePrice.toString(), selectedCurrency), selectedCurrency)}
                          </p>
                        </div>
                        <Button 
                          size="lg"
                          onClick={() => handleAddToCart({...bundle, price: bundlePrice.toString()}, 'bundle')}
                          className="flex items-center gap-2"
                        >
                          <Gift className="w-4 h-4" />
                          Get Bundle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Curator Management Tab */}
          {canAccessCuratorManagement && (
            <TabsContent value="curator-management">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Curator Distribution Network</h2>
                <p className="text-gray-600">Manage curator outreach and distribution campaigns for post-release promotion</p>
              </div>
              
              <CuratorManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}