import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Mic, Volume2, Users, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TechnicalRider {
  id: number;
  eventName?: string;
  status: string;
  stagePlot?: any[];
  monitorMixes?: any[];
  createdAt: Date;
}

export default function TechnicalRiderManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRider, setNewRider] = useState({
    eventName: '',
    venueType: 'indoor',
    bandSize: 4,
    requirements: '',
    stagePlot: [] as any[],
    monitorMixes: [] as any[]
  });

  const queryClient = useQueryClient();

  const { data: riders, isLoading } = useQuery({
    queryKey: ['/api/technical-riders'],
    queryFn: () => apiRequest('/api/technical-riders')
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/technical-riders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technical-riders'] });
      setIsCreateOpen(false);
      setNewRider({
        eventName: '',
        venueType: 'indoor',
        bandSize: 4,
        requirements: '',
        stagePlot: [],
        monitorMixes: []
      });
    }
  });

  const handleCreate = () => {
    if (!newRider.eventName) return;
    createMutation.mutate(newRider);
  };

  if (isLoading) return <div>Loading technical riders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Technical Rider Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Technical Rider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Technical Rider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={newRider.eventName}
                  onChange={(e) => setNewRider(prev => ({ ...prev, eventName: e.target.value }))}
                  placeholder="Concert, Festival, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venueType">Venue Type</Label>
                  <Select
                    value={newRider.venueType}
                    onValueChange={(value) => setNewRider(prev => ({ ...prev, venueType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor Venue</SelectItem>
                      <SelectItem value="outdoor">Outdoor Venue</SelectItem>
                      <SelectItem value="festival">Festival Stage</SelectItem>
                      <SelectItem value="club">Club/Bar</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bandSize">Band Size</Label>
                  <Input
                    id="bandSize"
                    type="number"
                    min="1"
                    max="20"
                    value={newRider.bandSize}
                    onChange={(e) => setNewRider(prev => ({ ...prev, bandSize: parseInt(e.target.value) || 4 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Technical Requirements</Label>
                <Textarea
                  id="requirements"
                  value={newRider.requirements}
                  onChange={(e) => setNewRider(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="PA system, monitor requirements, lighting, etc."
                  rows={4}
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Quick Setup Templates
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewRider(prev => ({
                      ...prev,
                      requirements: 'Standard 4-piece band setup:\n- Drum kit with mics\n- 2 guitar amps\n- Bass amp\n- 4 vocal mics\n- Monitor system'
                    }))}
                  >
                    4-Piece Band
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewRider(prev => ({
                      ...prev,
                      requirements: 'Solo acoustic setup:\n- 1 vocal mic\n- 1 guitar DI\n- Monitor wedge\n- Simple lighting'
                    }))}
                  >
                    Solo Acoustic
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewRider(prev => ({
                      ...prev,
                      requirements: 'DJ/Electronic setup:\n- 2 CDJ turntables\n- DJ mixer\n- Monitor speakers\n- Lighting controller'
                    }))}
                  >
                    DJ Setup
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewRider(prev => ({
                      ...prev,
                      requirements: 'Full band with horns:\n- Complete drum kit\n- 3 guitar/bass amps\n- 6-8 vocal mics\n- Saxophone/trumpet mics\n- In-ear monitors'
                    }))}
                  >
                    Full Band+
                  </Button>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Creating...' : 'Create Technical Rider'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(riders) && riders.length > 0 ? (
          riders.map((rider: TechnicalRider) => (
            <Card key={rider.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  {rider.eventName || `Technical Rider #${rider.id}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant={rider.status === 'active' ? 'default' : 'secondary'}>
                    {rider.status}
                  </Badge>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      {rider.stagePlot?.length || 0} inputs
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {rider.monitorMixes?.length || 0} monitors
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Created: {new Date(rider.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No technical riders found. Create your first rider!</p>
          </div>
        )}
      </div>
    </div>
  );
}