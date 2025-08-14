import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CreditCard,
  Music,
  Disc,
  Package
} from 'lucide-react';
import { Link } from 'wouter';

const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%
const PROCESSING_FEE_PERCENTAGE = 0.029; // 2.9%

export default function Cart() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getTotalPrice();
  const platformFee = subtotal * PLATFORM_FEE_PERCENTAGE;
  const processingFee = subtotal * PROCESSING_FEE_PERCENTAGE;
  const total = subtotal + platformFee + processingFee;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-4 h-4" />;
      case 'album': return <Disc className="w-4 h-4" />;
      case 'merchandise': return <Package className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would process the payment here
      alert('Payment successful! Your items will be available in your account.');
      clearCart();
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Browse our collection of music and merchandise to get started.
          </p>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/store?filter=artists">
                <Button className="w-full sm:w-auto">Browse Artists</Button>
              </Link>
              <Link href="/store?filter=music">
                <Button variant="outline" className="w-full sm:w-auto">Browse Music</Button>
              </Link>
              <Link href="/store?filter=merch">
                <Button variant="outline" className="w-full sm:w-auto">Browse Merch</Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <Link href="/store">
                <Button variant="secondary" className="w-full sm:w-auto">Visit Store</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({getTotalItems()} items)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getItemIcon(item.type)
                      )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.artist}</p>
                      <p className="font-medium mt-1">${(Number(item.price) || 0).toFixed(2)}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-8 text-center">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-medium">
                        ${((Number(item.price) || 0) * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Clear Cart */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee (5%)</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Processing Fee (2.9%)</span>
                  <span>${processingFee.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                
                <div className="text-xs text-gray-500 text-center">
                  <p>Secure payment powered by Stripe</p>
                  <p className="mt-1">100% of base price goes to artists</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}