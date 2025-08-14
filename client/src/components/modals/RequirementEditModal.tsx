import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface RequirementEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: any;
  userId: number;
  requirementType: 'hospitality' | 'technical' | 'performance';
}

export default function RequirementEditModal({ 
  isOpen, 
  onClose, 
  requirement, 
  userId, 
  requirementType 
}: RequirementEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    requirementType: requirement?.requirementType || requirement?.specType || '',
    requirementName: requirement?.requirementName || requirement?.specName || '',
    specifications: requirement?.specifications || requirement?.specValue || '',
    isRequired: requirement?.isRequired ?? true
  });

  const getApiEndpoint = () => {
    const baseUrl = `/api/users/${userId}`;
    switch (requirementType) {
      case 'hospitality':
        return `${baseUrl}/hospitality-requirements/${requirement.id}`;
      case 'technical':
        return `${baseUrl}/technical-requirements/${requirement.id}`;
      case 'performance':
        return `${baseUrl}/performance-specs/${requirement.id}`;
      default:
        throw new Error('Invalid requirement type');
    }
  };

  const getQueryKey = () => {
    switch (requirementType) {
      case 'hospitality':
        return ['/api/users', userId, 'hospitality-requirements'];
      case 'technical':
        return ['/api/users', userId, 'technical-requirements'];
      case 'performance':
        return ['/api/users', userId, 'performance-specs'];
      default:
        return [];
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(getApiEndpoint(), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${requirementType.charAt(0).toUpperCase() + requirementType.slice(1)} requirement updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: getQueryKey() });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to update ${requirementType} requirement`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.requirementType || !formData.requirementName) {
      toast({
        title: "Validation Error",
        description: "Type and name are required fields",
        variant: "destructive",
      });
      return;
    }

    // Format data based on requirement type
    const submitData = requirementType === 'performance' 
      ? {
          specType: formData.requirementType,
          specName: formData.requirementName,
          specValue: formData.specifications
        }
      : {
          requirementType: formData.requirementType,
          requirementName: formData.requirementName,
          specifications: formData.specifications,
          isRequired: formData.isRequired
        };

    updateMutation.mutate(submitData);
  };

  const getTypeOptions = () => {
    switch (requirementType) {
      case 'hospitality':
        return [
          { value: 'catering', label: 'Catering' },
          { value: 'accommodation', label: 'Accommodation' },
          { value: 'transportation', label: 'Transportation' },
          { value: 'green_room', label: 'Green Room' },
          { value: 'security', label: 'Security' },
          { value: 'other', label: 'Other' }
        ];
      case 'technical':
        return [
          { value: 'equipment', label: 'Equipment' },
          { value: 'stage_setup', label: 'Stage Setup' },
          { value: 'lighting', label: 'Lighting' },
          { value: 'sound', label: 'Sound' },
          { value: 'power', label: 'Power' },
          { value: 'other', label: 'Other' }
        ];
      case 'performance':
        return [
          { value: 'duration', label: 'Duration' },
          { value: 'break_requirements', label: 'Break Requirements' },
          { value: 'setup_time', label: 'Setup Time' },
          { value: 'sound_check', label: 'Sound Check' },
          { value: 'setlist', label: 'Setlist' },
          { value: 'other', label: 'Other' }
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit {requirementType.charAt(0).toUpperCase() + requirementType.slice(1)} Requirement
          </DialogTitle>
          <DialogDescription>
            Update your {requirementType} requirement details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.requirementType}
              onValueChange={(value) => setFormData({ ...formData, requirementType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {getTypeOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.requirementName}
              onChange={(e) => setFormData({ ...formData, requirementName: e.target.value })}
              placeholder="Enter requirement name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifications">
              {requirementType === 'performance' ? 'Value' : 'Specifications'}
            </Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              placeholder={
                requirementType === 'performance' 
                  ? "Enter specification value" 
                  : "Enter detailed specifications"
              }
              rows={3}
            />
          </div>

          {requirementType !== 'performance' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={formData.isRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
              />
              <Label htmlFor="required">Required</Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}