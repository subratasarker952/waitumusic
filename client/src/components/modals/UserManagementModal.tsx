import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User, Edit, Save, X, UserCheck, Shield, Music, Users } from 'lucide-react';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
  createdAt: string;
}

interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  mode?: 'edit' | 'create' | 'view';
}

export default function UserManagementModal({ 
  open, 
  onOpenChange, 
  userId, 
  mode = 'edit' 
}: UserManagementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'fan',
    status: 'active',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user data if editing existing user
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId && mode !== 'create',
    select: (users: any[]) => users.find(u => u.id.toString() === userId)
  });

  // Fetch available roles
  const { data: roles = [] } = useQuery({
    queryKey: ['/api/roles']
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData && mode !== 'create') {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        role: userData.role || 'fan',
        status: userData.status || 'active',
        password: '',
        confirmPassword: ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        fullName: '',
        email: '',
        role: 'fan',
        status: 'active',
        password: '',
        confirmPassword: ''
      });
    }
  }, [userData, mode]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user account has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: `Failed to create user: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update user: ${error}`,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName || !formData.email || !formData.role) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'create' && (!formData.password || formData.password !== formData.confirmPassword)) {
      toast({
        title: "Password Error",
        description: "Password is required and must match confirmation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createUserMutation.mutateAsync({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          roleId: parseInt(formData.role) // Convert role name to roleId
        });
      } else {
        await updateUserMutation.mutateAsync({
          fullName: formData.fullName,
          email: formData.email,
          roleId: parseInt(formData.role),
          status: formData.status
        });
      }
    } catch (error) {
      // Error handled by mutation onError
    } finally {
      setIsSubmitting(false);
    }

    if (mode === 'create' && (!formData.password || formData.password !== formData.confirmPassword)) {
      toast({
        title: "Password Error",
        description: "Password is required and passwords must match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would make an API call
      const action = mode === 'create' ? 'created' : 'updated';
      
      toast({
        title: `User ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        description: `${formData.fullName} has been successfully ${action}.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} user. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'managed_artist':
      case 'artist':
        return <Music className="h-4 w-4" />;
      case 'managed_musician':
      case 'musician':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'managed_artist':
      case 'artist':
        return 'bg-purple-100 text-purple-800';
      case 'managed_musician':
      case 'musician':
        return 'bg-green-100 text-green-800';
      case 'managed_professional':
      case 'professional':
        return 'bg-orange-100 text-orange-800';
      case 'fan':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New User';
      case 'view':
        return 'View User Details';
      case 'edit':
      default:
        return 'Edit User';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Create a new user account with appropriate role and permissions.'}
            {mode === 'edit' && 'Update user information, role, and account status.'}
            {mode === 'view' && 'View user account details and current status.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                  disabled={mode === 'view'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  disabled={mode === 'view'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fan">Fan</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="managed_artist">Managed Artist</SelectItem>
                    <SelectItem value="musician">Musician</SelectItem>
                    <SelectItem value="managed_musician">Managed Musician</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="managed_professional">Managed Professional</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password fields for new users */}
            {mode === 'create' && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Password Setup</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            )}

            {/* User Status Display */}
            {mode !== 'create' && userData && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Account Information</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Role</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(userData.role)}>
                        {getRoleIcon(userData.role)}
                        <span className="ml-1 capitalize">{userData.role.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(userData.status)}>
                        <span className="capitalize">{userData.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Member Since</Label>
                    <p className="text-xs mt-1">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {userData.lastLogin && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Last Login</Label>
                      <p className="text-xs mt-1">
                        {new Date(userData.lastLogin).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {mode !== 'view' && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        )}

        {mode === 'view' && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Close  
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}