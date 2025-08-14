import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

type RecipientCategory = {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
};

type InsertRecipientCategory = {
  name: string;
  displayName: string;
  description?: string;
  priority?: number;
  isActive?: boolean;
};

// Add/Edit Category Modal
function CategoryModal({ 
  isOpen, 
  onClose, 
  category,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  category?: RecipientCategory;
  onSave: (category: InsertRecipientCategory) => void;
}) {
  const [formData, setFormData] = useState<InsertRecipientCategory>({
    name: category?.name || '',
    displayName: category?.displayName || '',
    description: category?.description || '',
    priority: category?.priority || 5,
    isActive: category?.isActive ?? true
  });

  const handleSubmit = () => {
    if (formData.name && formData.displayName) {
      onSave(formData);
      setFormData({
        name: '',
        displayName: '',
        description: '',
        priority: 5,
        isActive: true
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            Create or modify recipient categories for newsletter and press release distribution.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name (Internal)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., radio_stations"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use lowercase with underscores (no spaces)
            </p>
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., Radio Stations"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority (1-10)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers = higher priority (fans always get priority 1)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active Category</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.name || !formData.displayName}
            >
              {category ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function RecipientCategoryManagement() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RecipientCategory | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query categories
  const { data: categories = [], isLoading } = useQuery<RecipientCategory[]>({
    queryKey: ['/api/recipient-categories'],
    queryFn: () => apiRequest('/api/recipient-categories').then(res => res.json()).then(data => data.success ? data.data : [])
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (category: InsertRecipientCategory) => {
      const response = await apiRequest('/api/recipient-categories', {
        method: 'POST',
        body: JSON.stringify(category)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipient-categories'] });
      toast({
        title: "Category Created",
        description: "New recipient category has been added successfully"
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: InsertRecipientCategory }) => {
      const response = await apiRequest(`/api/recipient-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipient-categories'] });
      toast({
        title: "Category Updated",
        description: "Recipient category has been updated successfully"
      });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/recipient-categories/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipient-categories'] });
      toast({
        title: "Category Deleted",
        description: "Recipient category has been removed successfully"
      });
    }
  });

  const handleSaveCategory = (categoryData: InsertRecipientCategory) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, updates: categoryData });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
    setEditingCategory(undefined);
  };

  const handleEditCategory = (category: RecipientCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Recipient Categories
            </CardTitle>
            <CardDescription>
              Manage recipient categories for newsletter and press release distribution
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingCategory(undefined);
              setShowCategoryModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recipient categories found</p>
            <p className="text-sm">Create your first category to organize your recipient database</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{category.displayName}</h4>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      Priority: {category.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Internal name: {category.name}
                  </p>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(undefined);
        }}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </Card>
  );
}