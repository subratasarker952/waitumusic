import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wrench, 
  Music, 
  Headphones,
  Mic,
  Guitar,
  Piano,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const equipmentSchema = z.object({
  name: z.string().min(2, "Equipment name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  model: z.string().min(1, "Model is required"),
  specifications: z.string().optional(),
  condition: z.string().min(1, "Please select condition"),
  maintenanceSchedule: z.string().optional(),
  notes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentManagerProps {
  user: any;
}

export default function EquipmentManager({ user }: EquipmentManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      model: "",
      specifications: "",
      condition: "",
      maintenanceSchedule: "",
      notes: ""
    }
  });

  // Fetch equipment list
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['/api/equipment', user.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/equipment?userId=${user.id}`);
      return await response.json();
    },
  });

  // Create equipment mutation
  const createEquipmentMutation = useMutation({
    mutationFn: async (data: EquipmentFormData) => {
      const response = await apiRequest('/api/equipment', {
        method: 'POST',
        body: JSON.stringify({ ...data, userId: user.id })
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      setIsAddModalOpen(false);
      form.reset();
      toast({
        title: "Equipment Added",
        description: "Equipment has been added to your inventory successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async (data: EquipmentFormData & { id: number }) => {
      const response = await apiRequest(`/api/equipment/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      setEditingEquipment(null);
      form.reset();
      toast({
        title: "Equipment Updated",
        description: "Equipment has been updated successfully.",
      });
    }
  });

  // Delete equipment mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: async (equipmentId: number) => {
      const response = await apiRequest(`/api/equipment/${equipmentId}`, {
        method: 'DELETE'
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      toast({
        title: "Equipment Deleted",
        description: "Equipment has been removed from your inventory.",
      });
    }
  });

  const onSubmit = (data: EquipmentFormData) => {
    if (editingEquipment) {
      updateEquipmentMutation.mutate({ ...data, id: editingEquipment.id });
    } else {
      createEquipmentMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingEquipment(item);
    form.reset({
      name: item.name,
      category: item.category,
      brand: item.brand,
      model: item.model,
      specifications: item.specifications || "",
      condition: item.condition,
      maintenanceSchedule: item.maintenanceSchedule || "",
      notes: item.notes || ""
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'instrument': return <Music className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'microphone': return <Mic className="h-4 w-4" />;
      case 'guitar': return <Guitar className="h-4 w-4" />;
      case 'keyboard': return <Piano className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const equipmentList = equipment || [
    {
      id: 1,
      name: "Studio Monitor Speakers",
      category: "Audio",
      brand: "KRK",
      model: "Rokit 8 G4",
      condition: "Excellent",
      maintenanceSchedule: "Quarterly",
      specifications: "8-inch woofer, 1-inch tweeter, 203W total power"
    },
    {
      id: 2,
      name: "Electric Guitar",
      category: "Instrument",
      brand: "Fender",
      model: "Stratocaster",
      condition: "Good",
      maintenanceSchedule: "Bi-annual",
      specifications: "Alder body, maple neck, rosewood fretboard"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Equipment Inventory</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage your instruments and audio equipment</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Electric Guitar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="instrument">Instrument</SelectItem>
                            <SelectItem value="audio">Audio Equipment</SelectItem>
                            <SelectItem value="microphone">Microphone</SelectItem>
                            <SelectItem value="keyboard">Keyboard/Piano</SelectItem>
                            <SelectItem value="guitar">Guitar</SelectItem>
                            <SelectItem value="drum">Drums/Percussion</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Fender" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Stratocaster" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Specifications</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Alder body, maple neck, rosewood fretboard..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Schedule</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="bi-annual">Bi-annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="as-needed">As Needed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this equipment..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingEquipment(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEquipmentMutation.isPending || updateEquipmentMutation.isPending}>
                    {editingEquipment ? 'Update' : 'Add'} Equipment
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipmentList.map((item:any) => (
          <Card key={item.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEquipmentMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Brand:</span>
                <span className="font-medium">{item.brand}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Model:</span>
                <span className="font-medium">{item.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Condition:</span>
                <Badge className={getConditionColor(item.condition)}>
                  {item.condition}
                </Badge>
              </div>
              {item.maintenanceSchedule && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance:</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {item.maintenanceSchedule}
                  </div>
                </div>
              )}
              {item.specifications && (
                <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                  {item.specifications}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {equipmentList.length === 0 && (
        <Card className="p-12 text-center">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Equipment Added</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Start building your equipment inventory</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Equipment
          </Button>
        </Card>
      )}

      {/* Edit Equipment Dialog */}
      <Dialog open={!!editingEquipment} onOpenChange={(open) => !open && setEditingEquipment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Same form fields as above but in edit mode */}
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingEquipment(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateEquipmentMutation.isPending}>
                  Update Equipment
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}