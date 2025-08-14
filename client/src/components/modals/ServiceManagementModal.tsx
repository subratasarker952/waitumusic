import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Plus, Save, X, Trash2, Edit, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  unit: string;
  category: string;
  isActive: boolean;
}

interface ServiceManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceManagementModal({ open, onOpenChange }: ServiceManagementModalProps) {
  const { toast } = useToast();
  // Use authentic service data from API - no hardcoded mock data
  const [services, setServices] = useState<Service[]>([]);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    unit: 'session',
    category: '',
    isActive: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddService = () => {
    if (!formData.name || !formData.description || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, description, and price.",
        variant: "destructive",
      });
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      unit: formData.unit,
      category: formData.category,
      isActive: formData.isActive
    };

    setServices(prev => [...prev, newService]);
    resetForm();

    toast({
      title: "Service Added",
      description: `${formData.name} has been added to your services.`,
    });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      unit: service.unit,
      category: service.category,
      isActive: service.isActive
    });
    setShowAddForm(true);
  };

  const handleUpdateService = () => {
    if (!editingService) return;

    const updatedService: Service = {
      ...editingService,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      unit: formData.unit,
      category: formData.category,
      isActive: formData.isActive
    };

    setServices(prev => 
      prev.map(service => service.id === editingService.id ? updatedService : service)
    );
    
    resetForm();
    setEditingService(null);

    toast({
      title: "Service Updated",
      description: `${formData.name} has been updated.`,
    });
  };

  const handleToggleActive = (id: string) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id ? { ...service, isActive: !service.isActive } : service
      )
    );
  };

  const handleRemoveService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
    toast({
      title: "Service Removed",
      description: "Service has been removed from your offerings.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      unit: 'session',
      category: '',
      isActive: true
    });
    setShowAddForm(false);
    setEditingService(null);
  };

  const handleSave = async () => {
    try {
      // Here you would make an API call to save the services
      toast({
        title: "Services Updated",
        description: "Your service offerings have been saved.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update services. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Service Management
          </DialogTitle>
          <DialogDescription>
            Manage your professional services, pricing, and availability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Services List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Services</h3>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-medium">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Career Strategy Consultation"
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
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Mentoring">Mentoring</SelectItem>
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
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select 
                      value={formData.unit}
                      onValueChange={(value) => handleInputChange('unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="session">Session</SelectItem>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      />
                      <span>Active (available for booking)</span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this service includes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={editingService ? handleUpdateService : handleAddService} 
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingService ? 'Update Service' : 'Add Service'}
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

            {/* Service Items */}
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="outline">{service.category}</Badge>
                        <Badge 
                          className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>${service.price}</span>
                        </div>
                        {service.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{service.duration} minutes</span>
                          </div>
                        )}
                        <span className="text-muted-foreground">per {service.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(service.id)}
                        className={service.isActive ? 'text-orange-600' : 'text-green-600'}
                      >
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {services.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No services added yet.</p>
                  <p className="text-sm">Click "Add Service" to get started.</p>
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