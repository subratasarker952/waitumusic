import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Icons
import { CreditCard, ShoppingCart, Music, Download, Lock, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_mock_key');

interface CartItem {
  id: number;
  type: 'song' | 'album' | 'merchandise';
  title: string;
  artist: string;
  price: number;
  currency: string;
  previewUrl?: string;
  downloadUrl?: string;
  isPaid: boolean;
}

interface StripeCheckoutFormProps {
  items: CartItem[];
  total: number;
  onSuccess: (paymentIntent: any) => void;
  onCancel: () => void;
}

function StripeCheckoutForm({ items, total, onSuccess, onCancel }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest('/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const paymentIntentResponse = await createPaymentIntentMutation.mutateAsync({
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          quantity: 1,
          price: item.price
        })),
        total: total * 100, // Convert to cents
        currency: 'usd',
        customer: customerInfo
      });

      const { client_secret: clientSecret } = paymentIntentResponse;

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: customerInfo.address
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your purchase has been completed. You now have access to the content."
        });
        onSuccess(result.paymentIntent);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Street Address"
            value={customerInfo.address.line1}
            onChange={(e) => setCustomerInfo(prev => ({
              ...prev,
              address: { ...prev.address, line1: e.target.value }
            }))}
            required
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Input
              placeholder="City"
              value={customerInfo.address.city}
              onChange={(e) => setCustomerInfo(prev => ({
                ...prev,
                address: { ...prev.address, city: e.target.value }
              }))}
              required
            />
            <Input
              placeholder="State"
              value={customerInfo.address.state}
              onChange={(e) => setCustomerInfo(prev => ({
                ...prev,
                address: { ...prev.address, state: e.target.value }
              }))}
              required
            />
            <Input
              placeholder="ZIP Code"
              value={customerInfo.address.postal_code}
              onChange={(e) => setCustomerInfo(prev => ({
                ...prev,
                address: { ...prev.address, postal_code: e.target.value }
              }))}
              required
            />
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {item.type === 'song' && <Music className="w-4 h-4" />}
                {item.type === 'album' && <Music className="w-4 h-4" />}
                {item.type === 'merchandise' && <ShoppingCart className="w-4 h-4" />}
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.artist}</p>
                </div>
              </div>
              <span className="font-bold">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="font-bold">Total:</span>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </h3>
        <div className="p-4 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

interface StripeCheckoutSystemProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onPaymentSuccess: (paymentIntent: any, items: CartItem[]) => void;
}

export default function StripeCheckoutSystem({
  isOpen,
  onClose,
  items,
  onPaymentSuccess
}: StripeCheckoutSystemProps) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handlePaymentSuccess = (paymentIntent: any) => {
    setCompletedPayment(paymentIntent);
    setPaymentSuccess(true);
    onPaymentSuccess(paymentIntent, items);
  };

  const handleClose = () => {
    setPaymentSuccess(false);
    setCompletedPayment(null);
    onClose();
  };

  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Payment Successful!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Thank you for your purchase!</h3>
              <p className="text-muted-foreground mb-4">
                Your payment has been processed successfully.
              </p>
              {completedPayment && (
                <div className="bg-muted p-3 rounded text-sm">
                  <p><strong>Transaction ID:</strong> {completedPayment.id}</p>
                  <p><strong>Amount:</strong> ${(completedPayment.amount / 100).toFixed(2)}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Your Downloads:</h4>
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{item.title}</span>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleClose} className="w-full">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm
            items={items}
            total={total}
            onSuccess={handlePaymentSuccess}
            onCancel={handleClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

// Helper hook for managing shopping cart
export function useShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.type === item.type && i.id === item.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (type: string, id: number) => {
    setCartItems(prev => prev.filter(item => !(item.type === type && item.id === id)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
    total,
    itemCount: cartItems.length
  };
}