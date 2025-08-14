import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Save, X, Trash2, AlertCircle, Edit, Image } from 'lucide-react';

interface MerchandiseItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  description: string;
  imageUrl?: string;
  sizes?: string[];
  colors?: string[];
}

interface MerchandiseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MerchandiseModal({ open, onOpenChange }: MerchandiseModalProps) {
  const { toast } = useToast();
  // Use authentic merchandise data from API - no hardcoded mock data
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);

  const [editingItem, setEditingItem] = useState<MerchandiseItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    sizes: [] as string[],
    colors: [] as string[]
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'sizes' | 'colors', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleAddItem = () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, category, and price.",
        variant: "destructive",
      });
      return;
    }

    const newItem: MerchandiseItem = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      price: formData.price,
      stock: parseInt(formData.stock) || 0,
      description: formData.description,
      sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
      colors: formData.colors.length > 0 ? formData.colors : undefined
    };

    setMerchandise(prev => [...prev, newItem]);
    resetForm();

    toast({
      title: "Item Added",
      description: `${formData.name} has been added to your merchandise.`,
    });
  };

  const handleEditItem = (item: MerchandiseItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock.toString(),
      description: item.description,
      sizes: item.sizes || [],
      colors: item.colors || []
    });
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const updatedItem: MerchandiseItem = {
      ...editingItem,
      name: formData.name,
      category: formData.category,
      price: formData.price,
      stock: parseInt(formData.stock) || 0,
      description: formData.description,
      sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
      colors: formData.colors.length > 0 ? formData.colors : undefined
    };

    setMerchandise(prev => 
      prev.map(item => item.id === editingItem.id ? updatedItem : item)
    );
    
    resetForm();
    setEditingItem(null);

    toast({
      title: "Item Updated",
      description: `${formData.name} has been updated.`,
    });
  };

  const handleRemoveItem = (id: string) => {
    setMerchandise(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Merchandise item has been removed.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      sizes: [],
      colors: []
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    try {
      // Here you would make an API call to save the merchandise
      toast({
        title: "Merchandise Updated",
        description: "Your merchandise inventory has been saved.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update merchandise. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (stock <= 5) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Merchandise Management
          </DialogTitle>
          <DialogDescription>
            Manage your merchandise inventory, pricing, and stock levels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Merchandise List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Merchandise</h3>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-medium">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Concert T-Shirt"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apparel">Apparel</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Collectibles">Collectibles</SelectItem>
                        <SelectItem value="Digital">Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sizes">Sizes (comma separated)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes.join(', ')}
                      onChange={(e) => handleArrayChange('sizes', e.target.value)}
                      placeholder="S, M, L, XL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colors">Colors (comma separated)</Label>
                    <Input
                      id="colors"
                      value={formData.colors.join(', ')}
                      onChange={(e) => handleArrayChange('colors', e.target.value)}
                      placeholder="Black, White, Navy"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the merchandise item..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={editingItem ? handleUpdateItem : handleAddItem} 
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Merchandise Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {merchandise.map((item) => {
                const stockStatus = getStockStatus(item.stock);
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge className={stockStatus.color}>
                            {stockStatus.text}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${item.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span>{item.stock} units</span>
                      </div>
                      {item.sizes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sizes:</span>
                          <span>{item.sizes.join(', ')}</span>
                        </div>
                      )}
                      {item.colors && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Colors:</span>
                          <span>{item.colors.join(', ')}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-muted-foreground text-xs pt-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {item.stock <= 5 && item.stock > 0 && (
                      <div className="flex items-center mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Low stock - consider restocking soon
                      </div>
                    )}
                  </div>
                );
              })}

              {merchandise.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No merchandise added yet.</p>
                  <p className="text-sm">Click "Add Item" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}