import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Edit, Trash2, UserPlus, Search, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserManagementModal from './UserManagementModal';

interface UserListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserListModal({ open, onOpenChange }: UserListModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [userData, setUserData] = useState<any | undefined>();
  const [userEditMode, setUserEditMode] = useState<'edit' | 'create' | 'view'>('edit');

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    enabled: open
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (deleteUserId: string) => apiRequest(`/api/users/${deleteUserId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been removed from the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: `Failed to delete user: ${error}`,
        variant: "destructive",
      });
      setDeleteUserId(null);
    }
  });

  // Filter users based on search
  const filteredUsers = users.filter((user: any) => {
    const query = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'default';
      case 'managed artist':
      case 'managed musician':
      case 'managed professional': return 'secondary';
      case 'artist':
      case 'musician': 
      case 'professional': return 'outline';
      default: return 'default';
    }
  };
  
// Helper function to get role display names
const getRoleDisplayName = (roleId: number): string => {
  const roleNames = {
    1: 'Superadmin',
    2: 'Admin', 
    3: 'Managed Artist',
    4: 'Artist',
    5: 'Managed Musician',
    6: 'Musician',
    7: 'Managed Professional',
    8: 'Professional',
    9: 'Fan'
  };
  return roleNames[roleId as keyof typeof roleNames] || `Role ${roleId}`;
};

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage All Platform Users</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <Button 
              onClick={() => {
                setUserData(undefined);
                setUserEditMode('create');
                setUserManagementOpen(true);
              }}
              data-testid="button-create-user"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(getRoleDisplayName(user.roleId))}>
                          {getRoleDisplayName(user.roleId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'outline' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserData(user);
                              setUserEditMode('view');
                              setUserManagementOpen(true);
                            }}
                            data-testid={`button-view-user-${user.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserData(user);
                              setUserEditMode('edit');
                              setUserManagementOpen(true);
                            }}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={getRoleDisplayName(user.roleId) == 'Superadmin'}
                            onClick={() => setDeleteUserId(user.id)}
                            data-testid={`button-delete-user-${user.id.toString()}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Management Modal for Create/Edit/View */}
      <UserManagementModal
        open={userManagementOpen}
        onOpenChange={setUserManagementOpen}
        userData={userData}
        mode={userEditMode}
      />
    </>
  );
}