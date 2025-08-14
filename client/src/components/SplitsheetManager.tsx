import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileMusic, Users, Percent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Splitsheet {
  id: number;
  songTitle?: string;
  status: string;
  createdAt: Date;
  participants?: any[];
}

interface Participant {
  name: string;
  role: string;
  percentage: number;
  email?: string;
}

export default function SplitsheetManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSplitsheet, setNewSplitsheet] = useState({
    songTitle: '',
    participants: [] as Participant[]
  });
  const [currentParticipant, setCurrentParticipant] = useState({
    name: '',
    role: 'songwriter',
    percentage: 0,
    email: ''
  });

  const queryClient = useQueryClient();

  const { data: splitsheets, isLoading } = useQuery({
    queryKey: ['/api/splitsheets'],
    queryFn: () => apiRequest('/api/splitsheets')
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/splitsheets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/splitsheets'] });
      setIsCreateOpen(false);
      setNewSplitsheet({ songTitle: '', participants: [] });
    }
  });

  const addParticipant = () => {
    if (!currentParticipant.name || currentParticipant.percentage <= 0) return;
    
    setNewSplitsheet(prev => ({
      ...prev,
      participants: [...prev.participants, { ...currentParticipant }]
    }));
    
    setCurrentParticipant({ name: '', role: 'songwriter', percentage: 0, email: '' });
  };

  const totalPercentage = newSplitsheet.participants.reduce((sum, p) => sum + p.percentage, 0);

  const handleCreate = () => {
    if (!newSplitsheet.songTitle || totalPercentage !== 100) return;
    createMutation.mutate(newSplitsheet);
  };

  if (isLoading) return <div>Loading splitsheets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Splitsheet Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Splitsheet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Splitsheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="songTitle">Song Title</Label>
                <Input
                  id="songTitle"
                  value={newSplitsheet.songTitle}
                  onChange={(e) => setNewSplitsheet(prev => ({ ...prev, songTitle: e.target.value }))}
                  placeholder="Enter song title..."
                />
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Add Participants
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="participantName">Name</Label>
                    <Input
                      id="participantName"
                      value={currentParticipant.name}
                      onChange={(e) => setCurrentParticipant(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Participant name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="participantEmail">Email</Label>
                    <Input
                      id="participantEmail"
                      type="email"
                      value={currentParticipant.email}
                      onChange={(e) => setCurrentParticipant(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="participantRole">Role</Label>
                    <Select
                      value={currentParticipant.role}
                      onValueChange={(value) => setCurrentParticipant(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="songwriter">Songwriter</SelectItem>
                        <SelectItem value="producer">Producer</SelectItem>
                        <SelectItem value="composer">Composer</SelectItem>
                        <SelectItem value="performer">Performer</SelectItem>
                        <SelectItem value="publisher">Publisher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="participantPercentage">Percentage (%)</Label>
                    <Input
                      id="participantPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={currentParticipant.percentage}
                      onChange={(e) => setCurrentParticipant(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <Button onClick={addParticipant} variant="outline" size="sm">
                  Add Participant
                </Button>
              </div>

              {newSplitsheet.participants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Current Participants:</h4>
                  {newSplitsheet.participants.map((participant, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{participant.name} ({participant.role})</span>
                      <Badge>{participant.percentage}%</Badge>
                    </div>
                  ))}
                  <div className="text-sm text-gray-600">
                    Total: {totalPercentage}% {totalPercentage === 100 ? '✓' : '(Must equal 100%)'}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCreate} 
                disabled={createMutation.isPending || totalPercentage !== 100 || !newSplitsheet.songTitle}
                className="w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Splitsheet'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(splitsheets) && splitsheets.length > 0 ? (
          splitsheets.map((splitsheet: Splitsheet) => (
            <Card key={splitsheet.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileMusic className="w-5 h-5" />
                  {splitsheet.songTitle || `Splitsheet #${splitsheet.id}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant={splitsheet.status === 'pending' ? 'secondary' : 'default'}>
                    {splitsheet.status}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Percent className="w-4 h-4" />
                    {splitsheet.participants?.length || 0} participants
                  </div>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(splitsheet.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <FileMusic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No splitsheets found. Create your first splitsheet!</p>
          </div>
        )}
      </div>
    </div>
  );
}