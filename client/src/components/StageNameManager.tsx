import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Star, Trash2, Crown, Music } from 'lucide-react';

interface StageName {
  name: string;
  isPrimary: boolean;
}

interface StageNameManagerProps {
  userType: 'artist' | 'musician';
  userId: number;
  initialStageNames?: StageName[];
  isFullyManaged?: boolean;
  onUpdate?: (stageNames: StageName[]) => void;
}

export default function StageNameManager({ 
  userType, 
  userId, 
  initialStageNames = [], 
  isFullyManaged = false,
  onUpdate 
}: StageNameManagerProps) {
  const [stageNames, setStageNames] = useState<StageName[]>(initialStageNames);
  const [newStageName, setNewStageName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setStageNames(initialStageNames);
  }, [initialStageNames]);

  const updateStageNamesMutation = useMutation({
    mutationFn: async (updatedStageNames: StageName[]) => {
      return apiRequest(`/api/${userType}s/${userId}/stage-names`, {
        method: 'PUT',
        body: JSON.stringify({ stageNames: updatedStageNames })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${userType}s`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${userType}s`, userId.toString()] });
      toast({
        title: "Stage names updated",
        description: "Your stage names have been successfully updated."
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update stage names. Please try again.",
        variant: "destructive"
      });
    }
  });

  const addStageName = () => {
    if (!newStageName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid stage name.",
        variant: "destructive"
      });
      return;
    }

    if (stageNames.some(sn => sn.name.toLowerCase() === newStageName.trim().toLowerCase())) {
      toast({
        title: "Duplicate name",
        description: "This stage name already exists.",
        variant: "destructive"
      });
      return;
    }

    const updatedStageNames = [
      ...stageNames,
      { 
        name: newStageName.trim(), 
        isPrimary: stageNames.length === 0 // First name is automatically primary
      }
    ];

    setStageNames(updatedStageNames);
    setNewStageName('');
    
    if (onUpdate) {
      onUpdate(updatedStageNames);
    }
    
    updateStageNamesMutation.mutate(updatedStageNames);
  };

  const removeStageName = (nameToRemove: string) => {
    if (stageNames.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one stage name.",
        variant: "destructive"
      });
      return;
    }

    const stageNameToRemove = stageNames.find(sn => sn.name === nameToRemove);
    const updatedStageNames = stageNames.filter(sn => sn.name !== nameToRemove);

    // If removing primary name, make the first remaining name primary
    if (stageNameToRemove?.isPrimary && updatedStageNames.length > 0) {
      updatedStageNames[0].isPrimary = true;
    }

    setStageNames(updatedStageNames);
    
    if (onUpdate) {
      onUpdate(updatedStageNames);
    }
    
    updateStageNamesMutation.mutate(updatedStageNames);
  };

  const setPrimary = (nameToSetPrimary: string) => {
    const updatedStageNames = stageNames.map(sn => ({
      ...sn,
      isPrimary: sn.name === nameToSetPrimary
    }));

    setStageNames(updatedStageNames);
    
    if (onUpdate) {
      onUpdate(updatedStageNames);
    }
    
    updateStageNamesMutation.mutate(updatedStageNames);
  };

  const primaryStageName = stageNames.find(sn => sn.isPrimary);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Stage Name Management
          {isFullyManaged && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Crown className="w-3 h-3 mr-1" />
              Fully Managed
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isFullyManaged 
            ? "As a fully managed " + userType + ", you can add multiple stage names and select which one is primary for bookings."
            : "Manage your stage names and select your primary performing name."
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Stage Name Display */}
        {primaryStageName && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="font-medium">Primary Stage Name</span>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                {primaryStageName.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This name will be used by default in booking contracts and official documents.
            </p>
          </div>
        )}

        {/* Stage Names List */}
        <div className="space-y-2">
          <Label>Your Stage Names ({stageNames.length})</Label>
          {stageNames.length > 0 ? (
            <div className="space-y-2">
              {stageNames.map((stageName, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    stageName.isPrimary ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {stageName.isPrimary ? (
                      <Crown className="h-4 w-4 text-primary" />
                    ) : (
                      <Star className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{stageName.name}</span>
                    {stageName.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!stageName.isPrimary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrimary(stageName.name)}
                        className="text-xs"
                      >
                        Set Primary
                      </Button>
                    )}
                    {stageNames.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStageName(stageName.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No stage names added yet</p>
            </div>
          )}
        </div>

        {/* Add New Stage Name */}
        {(isFullyManaged || stageNames.length === 0) && (
          <div className="space-y-2">
            <Label htmlFor="newStageName">Add New Stage Name</Label>
            <div className="flex gap-2">
              <Input
                id="newStageName"
                placeholder={`Enter ${userType} stage name...`}
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStageName()}
                className="flex-1"
              />
              <Button 
                onClick={addStageName}
                disabled={!newStageName.trim() || updateStageNamesMutation.isPending}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {!isFullyManaged && stageNames.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Multiple stage names are only available for fully managed {userType}s.
              </p>
            )}
          </div>
        )}

        {/* Booking Contract Information */}
        {isFullyManaged && stageNames.length > 1 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Crown className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Booking Contract Integration</p>
                <p className="text-blue-700 mt-1">
                  Your primary stage name will be used in booking contracts. Bookers and agents 
                  will be required to use this name through a checkbox confirmation in the booking agreement.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}