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
import { stringify } from 'querystring';
import { allInstruments } from '@shared/schema';

type Role = {
  id: number;
  name: string;
};

type Instrument = {
  id: number;
  name: string;
  type: string;
  roleId: number; // <-- adjust if your field is named differently
};

type FormData = {
  roles: string[]; // since you’re storing role ids as strings in state
};


interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData?: any;
  mode?: 'edit' | 'create' | 'view';
}

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

export default function UserManagementModal({
  open,
  onOpenChange,
  userData,
  mode = 'edit'
}: UserManagementModalProps) {

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    roles: [] as string[],
    primaryTalentId: null,
    status: '',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user data if editing existing user
  // const { data: userData, isLoading: isLoadingUser } = useQuery({
  //   queryKey: ['/api/users', userId],
  //   enabled: !!userId && mode !== 'create',
  //   select: (users: any[]) => users.find(u => u.id.toString() === userId)
  // });


  // Fetch available roles
  const { data: roles = [] } = useQuery({
    queryKey: ['/api/roles']
  });

  const { data: availableInstruments = [] } = useQuery<Instrument[]>({
    queryKey: ["/api/instruments"]
  });

  const filteredInstruments = availableInstruments.filter((instrument: Instrument) => {
    const roles = formData.roles.map(Number);

    // If any role is 7 or 8 → Professional
    if (roles.some(r => [7, 8].includes(r))) {
      return instrument.type === "Professional";
    }

    // If any role is 3 or 4 → Vocal
    if (roles.some(r => [3, 4].includes(r))) {
      return instrument.type === "Vocal";
    }

    // If any role is 5 or 6 → everything except Professional & Vocal
    if (roles.some(r => [5, 6].includes(r))) {
      return !["Professional", "Vocal"].includes(instrument.type);
    }

    // Any other roles (1,2,9, etc.) → nothing
    return false;
  });


  // Update form data when user data is loaded
  useEffect(() => {
    if (userData && mode !== 'create') {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        roles: userData.roles?.map((r: any) => r.id.toString()) || [],
        primaryTalentId: userData.primaryTalentId || 1,
        status: userData.status || 'active',
        password: '',
        confirmPassword: ''
      });
      console.log(formData)
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        fullName: '',
        email: '',
        roles: [],
        primaryTalentId: null,
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
      queryClient.invalidateQueries({ queryKey: ['/api/artists'] });
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
    mutationFn: (data: any) => apiRequest(`/api/admin/users/${userData.id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/artists'] });
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
    if (!formData.fullName || !formData.email || !formData.roles) {
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
          roles: formData.roles.map(r => parseInt(r)),
          primaryTalentId: parseInt(formData.primaryTalentId || "1")
        });
      } else {
        await updateUserMutation.mutateAsync({
          fullName: formData.fullName,
          email: formData.email,
          roles: formData.roles.map(r => parseInt(r)),
          status: formData.status,
          primaryTalentId: parseInt(formData.primaryTalentId || "1")
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
      case 'Superadmin':
      case 'Admin':
        return <Shield className="h-4 w-4" />;
      case 'Managed_artist':
      case 'artist':
        return <Music className="h-4 w-4" />;
      case 'Managed_musician':
      case 'Musician':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Superadmin':
        return 'bg-red-100 text-red-800';
      case 'Admin':
        return 'bg-blue-100 text-blue-800';
      case 'Managed_artist':
      case 'Artist':
        return 'bg-purple-100 text-purple-800';
      case 'Managed_musician':
      case 'Musician':
        return 'bg-green-100 text-green-800';
      case 'Managed_professional':
      case 'Professional':
        return 'bg-orange-100 text-orange-800';
      case 'Fan':
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
                <Label htmlFor="roles">Roles *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Array.isArray(roles) &&
                    roles.map((role: any) => (
                      <label key={role.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={role.id}
                          checked={formData.roles.includes(role.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                roles: [...prev.roles, role.id.toString()]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                roles: prev.roles.filter(r => r !== role.id.toString())
                              }));
                            }
                          }}
                          disabled={mode === 'view'}
                        />
                        {role.name}
                      </label>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Primary Talent Id</Label>
                <Select
                  value={String(formData.primaryTalentId || "")}
                  onValueChange={(value) => handleInputChange('primaryTalentId', value)}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInstruments
                      .sort((a: Instrument, b: Instrument) => a.name.localeCompare(b.name))
                      .map((instrument: Instrument) => (
                        <SelectItem key={instrument.id} value={String(instrument.id)}>
                          {instrument.name} - {instrument.type}
                        </SelectItem>
                      ))}
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
                      <Badge className={getRoleColor(getRoleDisplayName(userData.roleId))}>
                        {getRoleIcon(getRoleDisplayName(userData.roleId))}
                        <span className="ml-1 capitalize">{getRoleDisplayName(userData.roleId)}</span>
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