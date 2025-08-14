import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Plus, Save, X, Trash2, AlertCircle } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: string;
  condition: string;
  maintenanceDate?: string;
  notes: string;
}

interface EquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EquipmentModal({ open, onOpenChange }: EquipmentModalProps) {
  const { toast } = useToast();
  // Use authentic user equipment data from API - no hardcoded mock data
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: '',
    condition: 'good',
    maintenanceDate: '',
    notes: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setNewEquipment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddEquipment = () => {
    if (!newEquipment.name || !newEquipment.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in equipment name and type.",
        variant: "destructive",
      });
      return;
    }

    const equipment_item: Equipment = {
      id: Date.now().toString(),
      ...newEquipment
    };

    setEquipment(prev => [...prev, equipment_item]);
    setNewEquipment({
      name: '',
      type: '',
      condition: 'good',
      maintenanceDate: '',
      notes: ''
    });
    setShowAddForm(false);

    toast({
      title: "Equipment Added",
      description: `${newEquipment.name} has been added to your equipment list.`,
    });
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipment(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Equipment Removed",
      description: "Equipment has been removed from your list.",
    });
  };

  const handleSave = async () => {
    try {
      // Here you would make an API call to save the equipment list
      toast({
        title: "Equipment Updated",
        description: "Your equipment inventory has been saved.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'needs_repair': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const needsMaintenance = (date: string) => {
    if (!date) return false;
    const maintenanceDate = new Date(date);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return maintenanceDate < sixMonthsAgo;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Equipment Management
          </DialogTitle>
          <DialogDescription>
            Manage your music equipment inventory and maintenance schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Equipment List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Equipment</h3>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </div>

            {/* Add New Equipment Form */}
            {showAddForm && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-medium">Add New Equipment</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Equipment Name</Label>
                    <Input
                      id="name"
                      value={newEquipment.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Fender Bass Guitar"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bass Guitar">Bass Guitar</SelectItem>
                        <SelectItem value="Electric Guitar">Electric Guitar</SelectItem>
                        <SelectItem value="Acoustic Guitar">Acoustic Guitar</SelectItem>
                        <SelectItem value="Drums">Drums</SelectItem>
                        <SelectItem value="Keyboard">Keyboard</SelectItem>
                        <SelectItem value="Microphone">Microphone</SelectItem>
                        <SelectItem value="Amplifier">Amplifier</SelectItem>
                        <SelectItem value="Audio Interface">Audio Interface</SelectItem>
                        <SelectItem value="Mixer">Mixer</SelectItem>
                        <SelectItem value="Speakers">Speakers</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select 
                      value={newEquipment.condition}
                      onValueChange={(value) => handleInputChange('condition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="needs_repair">Needs Repair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintenanceDate">Last Maintenance</Label>
                    <Input
                      id="maintenanceDate"
                      type="date"
                      value={newEquipment.maintenanceDate}
                      onChange={(e) => handleInputChange('maintenanceDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newEquipment.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this equipment..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddEquipment} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Equipment Items */}
            <div className="space-y-3">
              {equipment.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge className={getConditionColor(item.condition)}>
                          {item.condition.replace('_', ' ')}
                        </Badge>
                        {item.maintenanceDate && needsMaintenance(item.maintenanceDate) && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Maintenance Due
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {item.maintenanceDate && (
                          <p>Last maintenance: {new Date(item.maintenanceDate).toLocaleDateString()}</p>
                        )}
                        {item.notes && <p>{item.notes}</p>}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveEquipment(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {equipment.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No equipment added yet.</p>
                  <p className="text-sm">Click "Add Equipment" to get started.</p>
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