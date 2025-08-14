import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import { Music, Plus, Trash2, Users, UserCheck, Briefcase } from 'lucide-react';

export default function ArtistMusicianAssignmentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedManagedTalentId, setSelectedManagedTalentId] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<'musician' | 'professional'>('musician');
  const [assignmentContext, setAssignmentContext] = useState<'general' | 'booking'>('general');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  // Fetch data
  const { data: managedArtists } = useQuery({
    queryKey: ['/api/users/managed-artists']
  });

  const { data: managedMusicians } = useQuery({
    queryKey: ['/api/users/managed-musicians']
  });

  const { data: allMusicians } = useQuery({
    queryKey: ['/api/users/musicians'],
    enabled: assignmentType === 'musician'
  });

  const { data: unmanagedProfessionals } = useQuery({
    queryKey: ['/api/users/unmanaged-professionals'],
    enabled: assignmentType === 'professional'
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings/all'],
    enabled: assignmentContext === 'booking'
  });

  const { data: artistMusicianAssignments, isLoading } = useQuery({
    queryKey: ['/api/assignments/artist-musician']
  });

  // All managed talent (artists + musicians)
  const allManagedTalent = [
    ...(managedArtists || []).map((artist: any) => ({ ...artist, type: 'artist' })),
    ...(managedMusicians || []).map((musician: any) => ({ ...musician, type: 'musician' }))
  ];

  // Available assignees based on type
  const availableAssignees = assignmentType === 'musician' 
    ? allMusicians 
    : unmanagedProfessionals;

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignment: any) => {
      return apiRequest('POST', '/api/assignments/artist-musician', assignment);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Artist-Musician assignment created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/artist-musician'] });
      setSelectedManagedTalentId('');
      setSelectedAssigneeId('');
      setSelectedBookingId('');
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
    }
  });

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest('DELETE', `/api/assignments/artist-musician/${assignmentId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Assignment removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/artist-musician'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to remove assignment",
        variant: "destructive"
      });
    }
  });

  const handleCreateAssignment = () => {
    if (!selectedManagedTalentId || !selectedAssigneeId) {
      toast({
        title: "Missing Information",
        description: "Please select both managed talent and assignee",
        variant: "destructive"
      });
      return;
    }

    if (assignmentContext === 'booking' && !selectedBookingId) {
      toast({
        title: "Missing Information",
        description: "Please select a booking for booking-specific assignments",
        variant: "destructive"
      });
      return;
    }

    createAssignmentMutation.mutate({
      managedTalentId: parseInt(selectedManagedTalentId),
      assigneeId: parseInt(selectedAssigneeId),
      assignmentType,
      assignmentContext,
      bookingId: assignmentContext === 'booking' ? parseInt(selectedBookingId) : null
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading artist-musician assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Assign Musicians & Professionals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Managed Artists/Musicians can assign musicians and unmanaged professionals to themselves or bookings
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Assignment Type</label>
              <Select value={assignmentType} onValueChange={(value: 'musician' | 'professional') => setAssignmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="musician">Musician (Any)</SelectItem>
                  <SelectItem value="professional">Professional (Unmanaged)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Assignment Context</label>
              <Select value={assignmentContext} onValueChange={(value: 'general' | 'booking') => setAssignmentContext(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Assignment</SelectItem>
                  <SelectItem value="booking">Specific Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Managed Talent (Main)</label>
              <Select value={selectedManagedTalentId} onValueChange={setSelectedManagedTalentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select talent" />
                </SelectTrigger>
                <SelectContent>
                  {allManagedTalent.map((talent: any) => (
                    <SelectItem key={talent.id} value={talent.id.toString()}>
                      {talent.fullName} ({talent.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                Assign {assignmentType === 'musician' ? 'Musician' : 'Professional'}
              </label>
              <Select value={selectedAssigneeId} onValueChange={setSelectedAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${assignmentType}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableAssignees?.map((assignee: any) => (
                    <SelectItem key={assignee.id} value={assignee.id.toString()}>
                      {assignee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {assignmentContext === 'booking' && (
              <div>
                <label className="text-sm font-medium">Select Booking</label>
                <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose booking" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings?.map((booking: any) => (
                      <SelectItem key={booking.id} value={booking.id.toString()}>
                        {booking.eventName} - {new Date(booking.eventDate).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCreateAssignment}
              disabled={createAssignmentMutation.isPending}
              className="w-full md:w-auto"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Music className="w-4 h-4 mr-2" />
            Current Artist-Musician Assignments ({artistMusicianAssignments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {artistMusicianAssignments?.length > 0 ? (
            <div className="space-y-3">
              {artistMusicianAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{assignment.managedTalentName} → {assignment.assigneeName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {assignment.assignmentType === 'musician' ? (
                          <Music className="w-3 h-3" />
                        ) : (
                          <Briefcase className="w-3 h-3" />
                        )}
                        <span className="capitalize">{assignment.assignmentType}</span>
                        {assignment.bookingName && (
                          <>
                            <span>•</span>
                            <span>Booking: {assignment.bookingName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {assignment.assignmentContext}
                    </Badge>
                    <Button
                      onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                      disabled={removeAssignmentMutation.isPending}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No artist-musician assignments found</p>
              <p className="text-sm">Create assignments to manage talent collaborations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}