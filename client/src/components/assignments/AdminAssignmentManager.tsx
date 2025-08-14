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
import { Users, Calendar, Plus, Trash2, UserCheck } from 'lucide-react';

export default function AdminAssignmentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<'booking' | 'managed_talent'>('booking');

  // Fetch data
  const { data: admins } = useQuery({
    queryKey: ['/api/users/admins']
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings/all'],
    enabled: assignmentType === 'booking'
  });

  const { data: managedTalent } = useQuery({
    queryKey: ['/api/users/managed'],
    enabled: assignmentType === 'managed_talent'
  });

  const { data: adminAssignments, isLoading } = useQuery({
    queryKey: ['/api/assignments/admin']
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignment: any) => {
      return apiRequest('POST', '/api/assignments/admin', assignment);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Admin assignment created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/admin'] });
      setSelectedAdminId('');
      setSelectedTargetId('');
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create admin assignment",
        variant: "destructive"
      });
    }
  });

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest('DELETE', `/api/assignments/admin/${assignmentId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Admin assignment removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/admin'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to remove admin assignment",
        variant: "destructive"
      });
    }
  });

  const handleCreateAssignment = () => {
    if (!selectedAdminId || !selectedTargetId) {
      toast({
        title: "Missing Information",
        description: "Please select both an admin and a target",
        variant: "destructive"
      });
      return;
    }

    createAssignmentMutation.mutate({
      adminUserId: parseInt(selectedAdminId),
      targetType: assignmentType,
      targetId: parseInt(selectedTargetId)
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading admin assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Assign Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Assignment Type</label>
              <Select value={assignmentType} onValueChange={(value: 'booking' | 'managed_talent') => setAssignmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking Oversight</SelectItem>
                  <SelectItem value="managed_talent">Managed Talent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Select Admin</label>
              <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose admin" />
                </SelectTrigger>
                <SelectContent>
                  {admins?.map((admin: any) => (
                    <SelectItem key={admin.id} value={admin.id.toString()}>
                      {admin.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                {assignmentType === 'booking' ? 'Select Booking' : 'Select Managed Talent'}
              </label>
              <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${assignmentType === 'booking' ? 'booking' : 'talent'}`} />
                </SelectTrigger>
                <SelectContent>
                  {assignmentType === 'booking' 
                    ? bookings?.map((booking: any) => (
                        <SelectItem key={booking.id} value={booking.id.toString()}>
                          {booking.eventName} - {booking.clientName}
                        </SelectItem>
                      ))
                    : managedTalent?.map((talent: any) => (
                        <SelectItem key={talent.id} value={talent.id.toString()}>
                          {talent.fullName} ({talent.role})
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateAssignment}
                disabled={createAssignmentMutation.isPending}
                className="w-full"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Current Admin Assignments ({adminAssignments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminAssignments?.length > 0 ? (
            <div className="space-y-3">
              {adminAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{assignment.adminName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {assignment.targetType === 'booking' ? (
                          <>
                            <Calendar className="w-3 h-3" />
                            <span>Booking: {assignment.targetName}</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3" />
                            <span>Talent: {assignment.targetName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {assignment.targetType.replace('_', ' ')}
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
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No admin assignments found</p>
              <p className="text-sm">Create assignments to manage admin oversight</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}