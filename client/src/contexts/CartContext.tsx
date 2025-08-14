import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  type: 'song' | 'album' | 'merchandise' | 'service';
  itemId: number | string;
  title: string;
  artist: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];
  cartCount: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  addToCart: (item: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('waitumusic-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('waitumusic-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const itemId = `${newItem.type}-${newItem.itemId}`;
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add new item with validated price
        const validatedItem = { 
          ...newItem, 
          id: itemId,
          price: Number(newItem.price) || 0 
        };
        return [...prevItems, validatedItem];
      }
    });

    // Trigger cart animation in navigation
    setTimeout(() => {
      const cartIcon = document.querySelector('.cart-icon');
      if (cartIcon) {
        cartIcon.classList.add('animate-cart-bounce');
        setTimeout(() => cartIcon.classList.remove('animate-cart-bounce'), 600);
      }
    }, 100);
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + ((Number(item.price) || 0) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const cartCount = getTotalItems();
  
  const addToCart = (item: any) => {
    // Map the item to match CartItem structure
    const cartItem = {
      type: item.type || 'merchandise',
      itemId: item.id,
      title: item.name || item.title,
      artist: item.artist || '',
      price: item.price || 0,
      quantity: item.quantity || 1,
      imageUrl: item.imageUrl
    };
    addItem(cartItem);
  };

  return (
    <CartContext.Provider value={{
      items,
      cartItems: items,
      cartCount,
      addItem,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}