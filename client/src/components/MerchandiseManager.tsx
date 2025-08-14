import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Package, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Merchandise {
  id: number;
  name: string;
  description?: string;
  price: number;
  artistUserId: number;
  inventory?: number;
  imageUrl?: string;
  createdAt: Date;
}

export default function MerchandiseManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMerch, setNewMerch] = useState({
    name: '',
    description: '',
    price: 0,
    inventory: 0,
    imageUrl: '',
    categoryId: 1,
    artistUserId: 19
  });

  const queryClient = useQueryClient();

  const { data: merchandise, isLoading } = useQuery({
    queryKey: ['/api/merchandise'],
    queryFn: () => apiRequest('/api/merchandise')
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/merchandise-categories'],
    queryFn: () => apiRequest('/api/merchandise-categories')
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/merchandise', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/merchandise'] });
      setIsCreateOpen(false);
      setNewMerch({ name: '', description: '', price: 0, inventory: 0, imageUrl: '', categoryId: 1, artistUserId: 19 });
    },
    onError: (error) => {
      console.error('Merchandise creation error:', error);
    }
  });

  const handleCreate = () => {
    if (!newMerch.name || newMerch.price <= 0) return;
    createMutation.mutate(newMerch);
  };

  if (isLoading) return <div>Loading merchandise...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Merchandise Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Merchandise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Merchandise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newMerch.name}
                  onChange={(e) => setNewMerch(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="T-Shirt, Vinyl, etc."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMerch.description}
                  onChange={(e) => setNewMerch(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newMerch.price}
                    onChange={(e) => setNewMerch(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    value={newMerch.inventory}
                    onChange={(e) => setNewMerch(prev => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newMerch.imageUrl}
                  onChange={(e) => setNewMerch(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Creating...' : 'Create Merchandise'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(merchandise) && merchandise.length > 0 ? (
          merchandise.map((item: Merchandise) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${item.price}
                    </Badge>
                    {item.inventory !== undefined && (
                      <Badge variant={item.inventory > 10 ? 'default' : 'destructive'}>
                        Stock: {item.inventory}
                      </Badge>
                    )}
                  </div>
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No merchandise found. Create your first product!</p>
          </div>
        )}
      </div>
    </div>
  );
}