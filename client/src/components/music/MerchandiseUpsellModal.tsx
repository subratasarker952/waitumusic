import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Star, Truck, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MerchandiseItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  inStock: boolean;
  bundleDiscount?: number;
}

interface MerchandiseUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchandiseIds: number[];
  currentSongTitle?: string;
  currentAlbumTitle?: string;
  onAddToCart: (items: MerchandiseItem[]) => void;
  onAddBundle: (songId: number, merchandiseIds: number[]) => void;
}

export default function MerchandiseUpsellModal({
  isOpen,
  onClose,
  merchandiseIds,
  currentSongTitle,
  currentAlbumTitle,
  onAddToCart,
  onAddBundle
}: MerchandiseUpsellModalProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showBundle, setShowBundle] = useState(false);

  // Fetch merchandise data
  const { data: merchandise = [], isLoading } = useQuery({
    queryKey: ['/api/merchandise', merchandiseIds],
    enabled: isOpen && merchandiseIds.length > 0,
  });

  useEffect(() => {
    if (merchandise.length > 1) {
      setShowBundle(true);
    }
  }, [merchandise]);

  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddSelected = () => {
    const selectedMerchandise = merchandise.filter((item: MerchandiseItem) => 
      selectedItems.includes(item.id)
    );
    onAddToCart(selectedMerchandise);
    onClose();
  };

  const handleAddBundle = () => {
    if (currentSongTitle && merchandise.length > 0) {
      onAddBundle(0, merchandiseIds); // Pass song ID and merchandise IDs
      onClose();
    }
  };

  const calculateBundlePrice = () => {
    const totalMerchandisePrice = merchandise.reduce((sum: number, item: MerchandiseItem) => sum + item.price, 0);
    const bundleDiscount = 0.15; // 15% bundle discount
    return totalMerchandisePrice * (1 - bundleDiscount);
  };

  const calculateSelectedPrice = () => {
    return merchandise
      .filter((item: MerchandiseItem) => selectedItems.includes(item.id))
      .reduce((sum: number, item: MerchandiseItem) => sum + item.price, 0);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Complete Your Experience
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {currentSongTitle && `Merchandise for "${currentSongTitle}"`}
            {currentAlbumTitle && ` from ${currentAlbumTitle}`}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bundle Offer */}
            {showBundle && merchandise.length > 1 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Complete Bundle Deal
                    </h3>
                    <p className="text-sm text-purple-700">
                      Get all {merchandise.length} items together and save 15%
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-purple-900">
                        ${calculateBundlePrice().toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${merchandise.reduce((sum: number, item: MerchandiseItem) => sum + item.price, 0).toFixed(2)}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Save 15%
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddBundle}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add Bundle
                  </Button>
                </div>
              </div>
            )}

            {/* Individual Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {merchandise.map((item: MerchandiseItem) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedItems.includes(item.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleItemToggle(item.id)}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-600">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.inStock ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs text-red-600">Out of Stock</span>
                      )}
                      {selectedItems.includes(item.id) && (
                        <Heart className="h-4 w-4 text-purple-600 fill-current" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedItems.length > 0 && (
                  <span>
                    {selectedItems.length} item(s) selected: ${calculateSelectedPrice().toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Maybe Later
                </Button>
                {selectedItems.length > 0 && (
                  <Button
                    onClick={handleAddSelected}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add Selected (${calculateSelectedPrice().toFixed(2)})
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}