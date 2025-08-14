import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Users, Music, UserCheck, Settings, Plus, Trash2 } from 'lucide-react';

interface Booking {
  id: number;
  eventType: string;
  eventDate: string;
  venueLocation: string;
  totalCost: number;
  status: string;
  primaryArtistUserId: number;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  role?: string;
}

interface BookingAssignment {
  id: number;
  bookingId: number;
  assignedUserId: number;
  assignmentRole: string;
  assignedUserName: string;
  assignedBy: number;
  isActive: boolean;
  createdAt: string;
}

interface AdminAssignment {
  id: number;
  adminUserId: number;
  managedUserId: number;
  assignmentType: string;
  adminName: string;
  managedUserName: string;
  isActive: boolean;
}

interface ArtistMusicianAssignment {
  id: number;
  managedTalentId: number;
  assigneeId: number;
  assignmentType: string;
  talentName: string;
  assigneeName: string;
  isActive: boolean;
}

interface ServiceAssignment {
  id: number;
  serviceId: number;
  assignedUserId: number;
  assignmentRate: number;
  isActive: boolean;
}

const MultiBookingCapabilitiesDemo: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    assignedUserId: '',
    assignmentRole: ''
  });

  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest('/api/bookings');
      return response as Booking[];
    }
  });

  // Fetch users for assignment
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/users');
      return response as User[];
    }
  });

  // Fetch booking assignments for selected booking
  const { data: bookingAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/booking-assignments', selectedBookingId],
    queryFn: async () => {
      if (!selectedBookingId) return [];
      const response = await apiRequest(`/api/booking-assignments?bookingId=${selectedBookingId}`);
      return response as BookingAssignment[];
    },
    enabled: !!selectedBookingId
  });

  // Fetch assignment statistics
  const { data: assignmentStats } = useQuery({
    queryKey: ['/api/assignment-stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/assignment-stats');
      return response as {
        totalAssignments: number;
        adminAssignments: number;
        bookingAssignments: number;
        artistMusicianAssignments: number;
        serviceAssignments: number;
      };
    }
  });

  // Fetch admin assignments
  const { data: adminAssignments } = useQuery({
    queryKey: ['/api/admin-assignments'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin-assignments');
      return response as AdminAssignment[];
    }
  });

  // Fetch artist-musician assignments
  const { data: artistMusicianAssignments } = useQuery({
    queryKey: ['/api/artist-musician-assignments'],
    queryFn: async () => {
      const response = await apiRequest('/api/artist-musician-assignments');
      return response as ArtistMusicianAssignment[];
    }
  });

  // Create booking assignment mutation
  const createBookingAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      return apiRequest('/api/booking-assignments', {
        method: 'POST',
        body: JSON.stringify(assignmentData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Assignment Created",
        description: "Successfully assigned talent to booking"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/booking-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assignment-stats'] });
      setNewAssignment({ assignedUserId: '', assignmentRole: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
    }
  });

  // Remove booking assignment mutation
  const removeBookingAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest(`/api/booking-assignments/${assignmentId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Assignment Removed",
        description: "Successfully removed assignment"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/booking-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assignment-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove assignment",
        variant: "destructive"
      });
    }
  });

  const handleCreateAssignment = () => {
    if (!selectedBookingId || !newAssignment.assignedUserId || !newAssignment.assignmentRole) {
      toast({
        title: "Missing Information",
        description: "Please select booking, user, and role",
        variant: "destructive"
      });
      return;
    }

    createBookingAssignmentMutation.mutate({
      bookingId: selectedBookingId,
      assignedUserId: parseInt(newAssignment.assignedUserId),
      assignmentRole: newAssignment.assignmentRole
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'primary_artist': return 'bg-blue-500';
      case 'supporting_artist': return 'bg-green-500';
      case 'musician': return 'bg-purple-500';
      case 'backup_vocalist': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (bookingsLoading || usersLoading) {
    return <div className="p-4">Loading assignment management system...</div>;
  }

  const managedUsers = Array.isArray(users) ? users.filter(user => [3, 5, 7].includes(user.roleId)) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Multi-Booking Assignment Management</h1>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentStats?.totalAssignments || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Admin Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{assignmentStats?.adminAssignments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Booking Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{assignmentStats?.bookingAssignments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Talent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{assignmentStats?.artistMusicianAssignments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Service Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{assignmentStats?.serviceAssignments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Booking Management */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Booking Capabilities</CardTitle>
          <CardDescription>
            Assign multiple managed artists and musicians to single bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Selection */}
          <div>
            <Label htmlFor="booking-select">Select Booking</Label>
            <Select value={selectedBookingId?.toString() || ''} onValueChange={(value) => setSelectedBookingId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a booking..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(bookings) ? bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id.toString()}>
                    {booking.eventType} - {new Date(booking.eventDate).toLocaleDateString()} - {booking.venueLocation}
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Current Assignments for Selected Booking */}
          {selectedBookingId && (
            <div className="space-y-2">
              <h3 className="font-semibold">Current Assignments</h3>
              {assignmentsLoading ? (
                <p>Loading assignments...</p>
              ) : bookingAssignments?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {bookingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(assignment.assignmentRole)}>
                          {assignment.assignmentRole.replace('_', ' ')}
                        </Badge>
                        <span className="font-medium">{assignment.assignedUserName}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBookingAssignmentMutation.mutate(assignment.id)}
                        disabled={removeBookingAssignmentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No assignments yet</p>
              )}
            </div>
          )}

          {/* Add New Assignment */}
          {selectedBookingId && (
            <div className="space-y-2">
              <h3 className="font-semibold">Add New Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label>Select Managed Talent</Label>
                  <Select value={newAssignment.assignedUserId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, assignedUserId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose talent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {managedUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assignment Role</Label>
                  <Select value={newAssignment.assignmentRole} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, assignmentRole: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary_artist">Primary Artist</SelectItem>
                      <SelectItem value="supporting_artist">Supporting Artist</SelectItem>
                      <SelectItem value="musician">Musician</SelectItem>
                      <SelectItem value="backup_vocalist">Backup Vocalist</SelectItem>
                      <SelectItem value="session_musician">Session Musician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateAssignment}
                    disabled={createBookingAssignmentMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Assignments Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Admin Assignments Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminAssignments?.length ? (
            <div className="space-y-2">
              {adminAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>
                    <strong>{assignment.adminName}</strong> → {assignment.managedUserName}
                  </span>
                  <Badge variant="outline">{assignment.assignmentType}</Badge>
                </div>
              ))}
              {adminAssignments.length > 5 && (
                <p className="text-sm text-gray-500">...and {adminAssignments.length - 5} more</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No admin assignments</p>
          )}
        </CardContent>
      </Card>

      {/* Artist-Musician Assignments Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Talent Collaboration Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          {artistMusicianAssignments?.length ? (
            <div className="space-y-2">
              {artistMusicianAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>
                    <strong>{assignment.talentName}</strong> ← {assignment.assigneeName}
                  </span>
                  <Badge variant="outline">{assignment.assignmentType}</Badge>
                </div>
              ))}
              {artistMusicianAssignments.length > 5 && (
                <p className="text-sm text-gray-500">...and {artistMusicianAssignments.length - 5} more</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No talent assignments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiBookingCapabilitiesDemo;