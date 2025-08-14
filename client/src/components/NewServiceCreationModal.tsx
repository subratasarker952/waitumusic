import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Clock, Tag, Briefcase } from 'lucide-react';

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

interface NewServiceCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewServiceCreationModal({ open, onOpenChange }: NewServiceCreationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<'category' | 'details'>('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    basePrice: '',
    duration: '',
    unit: 'session'
  });

  // Fetch service categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/service-categories'],
    queryFn: async () => {
      const response = await fetch('/api/service-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (newService: any) => {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New Wai'tuMusic service created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/all'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setStep('category');
    setSelectedCategoryId('');
    setServiceData({
      name: '',
      description: '',
      basePrice: '',
      duration: '',
      unit: 'session'
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setStep('details');
  };

  const handleCreateService = () => {
    if (!serviceData.name || !serviceData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in service name and description",
        variant: "destructive",
      });
      return;
    }

    const newService = {
      name: serviceData.name,
      description: serviceData.description,
      categoryId: parseInt(selectedCategoryId),
      basePrice: serviceData.basePrice ? parseFloat(serviceData.basePrice) : null,
      duration: serviceData.duration ? parseInt(serviceData.duration) : null,
      unit: serviceData.unit
    };

    createServiceMutation.mutate(newService);
  };

  const selectedCategory = categories?.find((cat: ServiceCategory) => cat.id.toString() === selectedCategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Wai'tuMusic Service
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a service that will be managed directly by Wai'tuMusic without user assignment
          </p>
        </DialogHeader>

        {/* Step 1: Category Selection */}
        {step === 'category' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4" />
              <h3 className="font-medium">Select Service Category</h3>
            </div>

            {categoriesLoading ? (
              <div className="text-center py-8">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories?.map((category: ServiceCategory) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleCategorySelect(category.id.toString())}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        >
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {step === 'details' && (
          <div className="space-y-6">
            {/* Selected Category Display */}
            {selectedCategory && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: selectedCategory.color || '#3B82F6' }}
                    >
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <Badge variant="secondary">{selectedCategory.name}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCategory.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('category')}
                      className="ml-auto"
                    >
                      Change Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Service Details Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-name">Service Name *</Label>
                <Input
                  id="service-name"
                  value={serviceData.name}
                  onChange={(e) => setServiceData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <Label htmlFor="service-description">Service Description *</Label>
                <Textarea
                  id="service-description"
                  value={serviceData.description}
                  onChange={(e) => setServiceData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this service includes"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="service-price" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Base Price (USD)
                  </Label>
                  <Input
                    id="service-price"
                    type="number"
                    step="0.01"
                    value={serviceData.basePrice}
                    onChange={(e) => setServiceData(prev => ({ ...prev, basePrice: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="service-duration" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration
                  </Label>
                  <Input
                    id="service-duration"
                    type="number"
                    value={serviceData.duration}
                    onChange={(e) => setServiceData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="60"
                  />
                </div>

                <div>
                  <Label htmlFor="service-unit">Unit</Label>
                  <Select
                    value={serviceData.unit}
                    onValueChange={(value) => setServiceData(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="session">Per Session</SelectItem>
                      <SelectItem value="hour">Per Hour</SelectItem>
                      <SelectItem value="day">Per Day</SelectItem>
                      <SelectItem value="week">Per Week</SelectItem>
                      <SelectItem value="month">Per Month</SelectItem>
                      <SelectItem value="project">Per Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('category')}
              >
                Back to Categories
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateService}
                  disabled={createServiceMutation.isPending}
                >
                  {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}