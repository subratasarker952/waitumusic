import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface CartButtonProps {
  item: {
    id: number;
    type: 'album' | 'song' | 'merchandise';
    name: string;
    price: number;
    artist?: string;
  };
}

export function CartButton({ item }: CartButtonProps) {
  const { addToCart, cartItems, cartCount } = useCart();
  const { toast } = useToast();
  
  const isInCart = cartItems.some(cartItem => 
    cartItem.id === item.id && cartItem.type === item.type
  );

  const handleAddToCart = async () => {
    try {
      await addToCart({
        ...item,
        quantity: 1
      });
      
      // Force a re-render to update the cart count immediately
      window.dispatchEvent(new Event('cart-updated'));
      
      toast({
        title: "Added to Cart",
        description: `${item.name} has been added to your cart`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Listen for cart updates to ensure UI stays in sync
  useEffect(() => {
    const handleCartUpdate = () => {
      // This will trigger a re-render when cart is updated
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isInCart}
      variant={isInCart ? "secondary" : "default"}
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isInCart ? 'Added to Cart' : 'Add to Cart'}
    </Button>
  );
}