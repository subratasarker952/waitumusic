import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import { Calendar, Plus, Trash2, Users, Music, UserCheck } from 'lucide-react';

export default function BookingAssignmentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Fetch data
  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings/all']
  });

  const { data: managedArtists } = useQuery({
    queryKey: ['/api/users/managed-artists']
  });

  const { data: managedMusicians } = useQuery({
    queryKey: ['/api/users/managed-musicians']
  });

  // Fetch ALL users for assignment (not just managed talent)
  const { data: allUsers } = useQuery({
    queryKey: ['/api/users']
  });

  const { data: bookingAssignments, isLoading } = useQuery({
    queryKey: ['/api/assignments/booking']
  });

  // All managed talent for selection
  const allManagedTalent = [
    ...(Array.isArray(managedArtists) ? managedArtists : []).map((artist: any) => ({ ...artist, type: 'artist' })),
    ...(Array.isArray(managedMusicians) ? managedMusicians : []).map((musician: any) => ({ ...musician, type: 'musician' }))
  ];

  // Create user lookup map for all users (for assignment processing)
  const allUsersMap = new Map();
  if (Array.isArray(allUsers)) {
    allUsers.forEach((user: any) => {
      allUsersMap.set(user.id.toString(), user);
    });
  }

  // Removed old createAssignmentMutation - now using direct API calls with user consolidation

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest(`/api/assignments/booking/${assignmentId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Booking assignment removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/booking'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to remove booking assignment",
        variant: "destructive"
      });
    }
  });

  const handleTalentSelection = (talentId: string, checked: boolean) => {
    if (checked) {
      setSelectedTalentIds([...selectedTalentIds, talentId]);
    } else {
      setSelectedTalentIds(selectedTalentIds.filter(id => id !== talentId));
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedBookingId || selectedTalentIds.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a booking and at least one talent",
        variant: "destructive"
      });
      return;
    }

    // FIRST: Deactivate all existing assignments for this booking to prevent duplicates
    try {
      await apiRequest(`/api/assignments/booking/deactivate-all`, {
        method: 'POST',
        body: { bookingId: parseInt(selectedBookingId) }
      });
    } catch (error) {
      console.warn('Failed to deactivate existing assignments:', error);
    }
    
    // CRITICAL: Ensure primary artist gets an assignment record
    // Get the booking details to find the primary artist
    const bookingResponse = await apiRequest(`/api/bookings/${selectedBookingId}`);
    const booking = bookingResponse;
    
    // Group users by ID to consolidate multiple role assignments per user
    const userAssignments = new Map();
    
    // Add primary artist if they exist and aren't already in selected users
    if (booking?.primaryArtistUserId && !selectedTalentIds.includes(booking.primaryArtistUserId.toString())) {
      const primaryArtist = allUsersMap.get(booking.primaryArtistUserId.toString());
      if (primaryArtist) {
        userAssignments.set(booking.primaryArtistUserId.toString(), {
          userId: booking.primaryArtistUserId,
          assignmentType: 'artist',
          roles: ['Main Booked Talent'] // Special status for primary artist
        });
      }
    }
    
    selectedTalentIds.forEach(talentId => {
      const user = allUsersMap.get(talentId);
      if (user) {
        // Determine user type from role
        const userRole = user.roleId;
        let assignmentType = 'talent';
        let defaultRole = 'supporting_musician';
        
        // Map role IDs to types and default roles
        if (userRole === 3) { // artist
          assignmentType = 'artist';
          defaultRole = 'main_performer';
        } else if (userRole === 4) { // musician  
          assignmentType = 'musician';
          defaultRole = 'supporting_musician';
        } else if (userRole === 5) { // professional
          assignmentType = 'professional';
          defaultRole = 'sound_engineer';
        } else if (userRole === 6) { // musician (regular)
          assignmentType = 'musician';
          defaultRole = 'supporting_musician';
        } else if (userRole === 7) { // managed_professional
          assignmentType = 'professional';
          defaultRole = 'sound_engineer';
        }
        
        // Consolidate roles for the same user
        if (userAssignments.has(talentId)) {
          const existing = userAssignments.get(talentId);
          existing.roles.push(selectedRole || defaultRole);
        } else {
          userAssignments.set(talentId, {
            userId: parseInt(talentId),
            assignmentType: assignmentType,
            roles: [selectedRole || defaultRole]
          });
        }
      } else {
        console.warn(`User not found for ID: ${talentId}`);
      }
    });
    
    // Create one assignment per user with consolidated roles
    console.log('🔄 Creating assignments for users:', Array.from(userAssignments.keys()));
    
    const assignmentPromises = Array.from(userAssignments.entries()).map(async ([talentId, assignment]) => {
      const primaryRole = assignment.roles[0]; // Use first role as primary
      
      try {
        console.log(`🔄 Creating assignment for user ${assignment.userId} with role: ${primaryRole}`);
        
        const result = await apiRequest('/api/assignments/booking', {
          method: 'POST',
          body: {
            bookingId: parseInt(selectedBookingId),
            assignedUserId: assignment.userId,
            assignmentRole: primaryRole
          }
        });
        
        console.log(`✅ Successfully created assignment for user ${assignment.userId}:`, result);
        return result;
      } catch (error) {
        console.error(`❌ Failed to create assignment for user ${assignment.userId}:`, error);
        throw error;
      }
    });
    
    // Wait for all assignments to complete
    try {
      const results = await Promise.all(assignmentPromises);
      
      toast({
        title: "Success",
        description: `Created ${results.length} assignments successfully with user consolidation`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/booking'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      // Reset form
      setSelectedTalentIds([]);
      setSelectedRole('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create some assignments",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading booking assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Assign Talent to Booking
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Support for multiple managed artists and musicians per booking
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Select Booking</label>
              <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose booking" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(bookings) ? bookings : []).map((booking: any) => (
                    <SelectItem key={booking.id} value={booking.id.toString()}>
                      {booking.eventName} - {new Date(booking.eventDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Assignment Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_performer">Main Performer</SelectItem>
                  <SelectItem value="supporting_artist">Supporting Artist</SelectItem>
                  <SelectItem value="session_musician">Session Musician</SelectItem>
                  <SelectItem value="backup_vocalist">Backup Vocalist</SelectItem>
                  <SelectItem value="band_member">Band Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateAssignment}
                disabled={selectedTalentIds.length === 0}
                className="w-full"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Selected ({selectedTalentIds.length})
              </Button>
            </div>
          </div>

          {/* Select managed talent dropdown */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Managed Talent</label>
            <Select value={selectedTalentIds[0] || ""} onValueChange={(value) => setSelectedTalentIds([value])}>
              <SelectTrigger>
                <SelectValue placeholder="Choose managed talent" />
              </SelectTrigger>
              <SelectContent>
                {allManagedTalent.map((talent: any) => (
                  <SelectItem key={talent.id} value={talent.id.toString()}>
                    <div className="flex items-center space-x-2">
                      {talent.type === 'artist' ? <Music className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      <span>{talent.fullName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Current Booking Assignments ({Array.isArray(bookingAssignments) ? bookingAssignments.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(bookingAssignments) && bookingAssignments.length > 0 ? (
            <div className="space-y-3">
              {bookingAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{assignment.bookingName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{assignment.assignedUserName}</span>
                        <span>•</span>
                        <span className="capitalize">{assignment.assignmentRole?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {assignment.assignmentType}
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
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No booking assignments found</p>
              <p className="text-sm">Assign talent to bookings to manage performances</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}