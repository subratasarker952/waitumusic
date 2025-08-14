import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  ShoppingCart, Search, Filter, Star, Heart, Music,
  Shirt, Package, Gift, Headphones, X, Plus, Minus
} from 'lucide-react';

interface StoreBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function StoreBrowserModal({ isOpen, onClose, user }: StoreBrowserModalProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Fetch merchandise data
  const { data: merchandise, isLoading } = useQuery({
    queryKey: ['/api/merchandise'],
    queryFn: async () => {
      const response = await apiRequest('/api/merchandise');
      return await response.json();
    },
    enabled: isOpen,
  });

  // Fetch artists for filter
  const { data: artists } = useQuery({
    queryKey: ['/api/artists'],
    queryFn: async () => {
      const response = await apiRequest('/api/artists');
      return await response.json();
    },
    enabled: isOpen,
  });

  // Demo merchandise data for display
  const demoMerchandise = [
    {
      id: 1,
      name: "Lí-Lí Octave - Caribbean Waves T-Shirt",
      artist: "Lí-Lí Octave",
      category: "apparel",
      price: 25.00,
      description: "Premium cotton tee featuring Caribbean-inspired artwork",
      image: "🎵",
      stock: 15,
      featured: true
    },
    {
      id: 2,
      name: "JCro - Afrobeats Vinyl Collection",
      artist: "JCro",
      category: "music",
      price: 35.00,
      description: "Limited edition vinyl featuring latest Afrobeats hits",
      image: "💿",
      stock: 8,
      featured: true
    },
    {
      id: 3,
      name: "Princess Trinidad - Dancehall Hoodie",
      artist: "Princess Trinidad",
      category: "apparel",
      price: 45.00,
      description: "Comfortable hoodie with signature dancehall graphics",
      image: "👑",
      stock: 12,
      featured: false
    },
    {
      id: 4,
      name: "Janet Azzouz - Pop Dreams Poster Set",
      artist: "Janet Azzouz",
      category: "accessories",
      price: 15.00,
      description: "Set of 3 high-quality concert posters",
      image: "🎭",
      stock: 25,
      featured: false
    },
    {
      id: 5,
      name: "Wai'tuMusic - Studio Headphones",
      artist: "Wai'tuMusic",
      category: "accessories",
      price: 120.00,
      description: "Professional-grade studio monitoring headphones",
      image: "🎧",
      stock: 5,
      featured: true
    }
  ];

  // Use demo data if no real merchandise available
  const displayMerchandise = merchandise?.length ? merchandise : demoMerchandise;

  // Filter merchandise based on search and filters
  const filteredMerchandise = displayMerchandise.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesArtist = selectedArtist === 'all' || item.artist === selectedArtist;
    
    return matchesSearch && matchesCategory && matchesArtist;
  });

  // Get unique categories and artists for filters
  const categories = Array.from(new Set(displayMerchandise.map((item: any) => item.category)));
  const artistNames = Array.from(new Set(displayMerchandise.map((item: any) => item.artist)));

  const addToCart = (item: any) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    
    toast({
      title: "Added to Cart",
      description: `${item.name} added to your cart`,
    });
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Checkout Initiated",
      description: `Processing ${cartItems.length} items worth $${getTotalPrice().toFixed(2)}`,
    });
    
    // Clear cart after checkout
    setCartItems([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Wai'tuMusic Store
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
          {/* Main Store Area */}
          <div className="lg:col-span-3 space-y-4 overflow-y-auto">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search merchandise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                <SelectTrigger>
                  <SelectValue placeholder="Artist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Artists</SelectItem>
                  {artistNames.map((artist: string) => (
                    <SelectItem key={artist} value={artist}>
                      {artist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Featured Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMerchandise
                  .filter((item: any) => item.featured)
                  .map((item: any) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{item.image}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">{item.artist}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
                              <Badge variant="outline">{item.stock} left</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            disabled={item.stock === 0}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* All Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All Merchandise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMerchandise.map((item: any) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-3xl mb-2">{item.image}</div>
                        <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{item.artist}</p>
                        <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
                          <Badge variant="outline">{item.stock} left</Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={item.stock === 0}
                          className="w-full"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Shopping Cart Sidebar */}
          <div className="lg:col-span-1 border-l lg:border-l lg:pl-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart ({cartItems.length})
              </h3>

              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {cartItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="text-lg">{item.image}</div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-xs truncate">{item.name}</h5>
                              <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-xs">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-6 w-6 p-0 ml-auto"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Cart Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg text-green-600">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <Button onClick={handleCheckout} className="w-full">
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}