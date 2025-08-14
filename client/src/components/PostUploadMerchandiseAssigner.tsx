import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Package, Music, Link, CheckCircle, Clock, Users, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Album {
  id: number;
  title: string;
  artistUserId: number;
  coverImageUrl?: string;
  releaseDate?: string;
  createdAt: string;
}

interface Merchandise {
  id: number;
  name: string;
  description?: string;
  price: string;
  artistUserId: number;
  imageUrl?: string;
  category: string;
  isActive: boolean;
}

interface MerchandiseAssignment {
  id: number;
  albumId: number;
  merchandiseId: number;
  assignedBy: number;
  assignmentNotes?: string;
  createdAt: string;
  album: Album;
  merchandise: Merchandise;
}

interface PostUploadMerchandiseAssignerProps {
  albumId: number;
  artistUserId: number;
  onAssignmentComplete?: () => void;
}

export const PostUploadMerchandiseAssigner: React.FC<PostUploadMerchandiseAssignerProps> = ({
  albumId,
  artistUserId,
  onAssignmentComplete
}) => {
  const [selectedMerchandise, setSelectedMerchandise] = useState<number[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [showAssigner, setShowAssigner] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get album details
  const { data: album, isLoading: albumLoading } = useQuery({
    queryKey: ['/api/albums', albumId],
    queryFn: () => apiRequest(`/api/albums/${albumId}`)
  });

  // Get available merchandise for this artist
  const { data: merchandise = [], isLoading: merchLoading } = useQuery({
    queryKey: ['/api/merchandise/artist', artistUserId],
    queryFn: () => apiRequest(`/api/merchandise/artist/${artistUserId}`)
  });

  // Get existing assignments for this album
  const { data: existingAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/album-merchandise-assignments', albumId],
    queryFn: () => apiRequest(`/api/album-merchandise-assignments?albumId=${albumId}`)
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: (assignmentData: any) => apiRequest('/api/album-merchandise-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    }),
    onSuccess: () => {
      toast({
        title: "Assignment Created",
        description: "Merchandise successfully linked to album"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/album-merchandise-assignments'] });
      setSelectedMerchandise([]);
      setAssignmentNotes('');
      onAssignmentComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to link merchandise to album",
        variant: "destructive"
      });
    }
  });

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId: number) => apiRequest(`/api/album-merchandise-assignments/${assignmentId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: "Assignment Removed",
        description: "Merchandise unlinked from album"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/album-merchandise-assignments'] });
    }
  });

  const handleCreateAssignments = () => {
    if (selectedMerchandise.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one merchandise item",
        variant: "destructive"
      });
      return;
    }

    // Create individual assignments for each selected merchandise
    selectedMerchandise.forEach(merchandiseId => {
      createAssignmentMutation.mutate({
        albumId,
        merchandiseId,
        assignmentNotes: assignmentNotes.trim() || undefined
      });
    });
  };

  const getAssignedMerchandiseIds = () => {
    return existingAssignments.map((assignment: MerchandiseAssignment) => assignment.merchandiseId);
  };

  const getAvailableMerchandise = () => {
    const assignedIds = getAssignedMerchandiseIds();
    return merchandise.filter((merch: Merchandise) => !assignedIds.includes(merch.id) && merch.isActive);
  };

  if (albumLoading || merchLoading || assignmentsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Loading merchandise assignment system...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableMerchandise = getAvailableMerchandise();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Link className="h-5 w-5" />
          <span>Album-Merchandise Linking</span>
        </CardTitle>
        <CardDescription>
          Connect merchandise items to "{album?.title}" for cross-promotion and bundling opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Album Info */}
        <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
          <Music className="h-8 w-8 text-primary" />
          <div>
            <h4 className="font-semibold">{album?.title}</h4>
            <p className="text-sm text-muted-foreground">
              Uploaded {album?.createdAt ? new Date(album.createdAt).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        {/* Existing Assignments */}
        {existingAssignments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Connected Merchandise ({existingAssignments.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {existingAssignments.map((assignment: MerchandiseAssignment) => (
                <Card key={assignment.id} className="p-3">
                  <div className="flex items-start justify-between space-x-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{assignment.merchandise.name}</p>
                      <p className="text-xs text-muted-foreground">${assignment.merchandise.price}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {assignment.merchandise.category}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                      disabled={removeAssignmentMutation.isPending}
                      className="text-xs"
                    >
                      Unlink
                    </Button>
                  </div>
                  {assignment.assignmentNotes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{assignment.assignmentNotes}"
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Assignment Interface */}
        {availableMerchandise.length > 0 ? (
          <div className="space-y-4">
            <Dialog open={showAssigner} onOpenChange={setShowAssigner}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Package className="h-4 w-4 mr-2" />
                  Link New Merchandise ({availableMerchandise.length} available)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Link Merchandise to Album</DialogTitle>
                  <DialogDescription>
                    Select merchandise items to associate with "{album?.title}" for promotional opportunities
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Merchandise Selection */}
                  <div className="space-y-3">
                    <Label>Available Merchandise</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {availableMerchandise.map((merch: Merchandise) => (
                        <Card 
                          key={merch.id} 
                          className={`p-3 cursor-pointer transition-colors ${
                            selectedMerchandise.includes(merch.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            setSelectedMerchandise(prev => 
                              prev.includes(merch.id)
                                ? prev.filter(id => id !== merch.id)
                                : [...prev, merch.id]
                            );
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{merch.name}</p>
                              <p className="text-xs text-muted-foreground">${merch.price}</p>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {merch.category}
                              </Badge>
                            </div>
                            {selectedMerchandise.includes(merch.id) && (
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          {merch.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {merch.description}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Assignment Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="assignmentNotes">Assignment Notes (Optional)</Label>
                    <Textarea
                      id="assignmentNotes"
                      placeholder="Add notes about this merchandise connection (e.g., 'Bundle discount available', 'Limited edition tie-in')..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAssigner(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateAssignments}
                      disabled={selectedMerchandise.length === 0 || createAssignmentMutation.isPending}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Link Selected ({selectedMerchandise.length})
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No Available Merchandise</p>
            <p className="text-sm">
              {merchandise.length === 0 
                ? "Create merchandise items first to enable album linking"
                : "All merchandise items are already linked to this album"
              }
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          <span className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{existingAssignments.length} linked</span>
          </span>
          <span className="flex items-center space-x-1">
            <Package className="h-3 w-3" />
            <span>{availableMerchandise.length} available</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};