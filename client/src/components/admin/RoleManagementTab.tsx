import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit, Trash2, Users, Shield, Settings, 
  Check, X, Crown, UserCheck, Lock, Unlock
} from 'lucide-react';

import { 
  DASHBOARD_PERMISSIONS, 
  getUserPermissions,
  type UserRole, 
  type DashboardPermission 
} from '@shared/role-permissions';
import { apiRequest } from '@/lib/queryClient';

interface RoleManagementTabProps {
  userRole: string;
  userId: number;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  status: string;
  customRole?: string;
}

export default function RoleManagementTab({ userRole, userId }: RoleManagementTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Fetch roles from database
  const { data: dbRoles = [] } = useQuery({
    queryKey: ['/api/roles'],
    enabled: userRole === 'superadmin' || userRole === 'admin'
  });

  // Fetch custom roles
  const { data: customRoles = [] } = useQuery({
    queryKey: ['/api/admin/custom-roles'],
    enabled: userRole === 'superadmin' || userRole === 'admin'
  });

  // Fetch all users for role assignment
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: userRole === 'superadmin' || userRole === 'admin'
  });

  // Create custom role mutation
  const createRoleMutation = useMutation({
    mutationFn: (roleData: Omit<UserRole, 'id'>) => 
      apiRequest('/api/admin/custom-roles', { method: 'POST', body: roleData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-roles'] });
      setIsCreateRoleOpen(false);
      toast({ title: "Success", description: "Custom role created successfully" });
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, roleData }: { roleId: string, roleData: Partial<UserRole> }) =>
      apiRequest(`/api/admin/custom-roles/${roleId}`, { method: 'PATCH', body: roleData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-roles'] });
      setEditingRole(null);
      toast({ title: "Success", description: "Role updated successfully" });
    }
  });

  // Assign role to user mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number, roleId: string }) =>
      apiRequest(`/api/admin/users/${userId}/assign-role`, { method: 'POST', body: { roleId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUser(null);
      toast({ title: "Success", description: "Role assigned successfully" });
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) =>
      apiRequest(`/api/admin/custom-roles/${roleId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-roles'] });
      toast({ title: "Success", description: "Role deleted successfully" });
    }
  });

  // All available roles (database + custom)
  const allRoles = [...(Array.isArray(dbRoles) ? dbRoles : []), ...(Array.isArray(customRoles) ? customRoles : [])];

  // Group permissions by category
  const permissionsByCategory = DASHBOARD_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, DashboardPermission[]>);

  // Role creation form
  const RoleForm = ({ role, onSubmit, onCancel }: {
    role?: UserRole;
    onSubmit: (roleData: Omit<UserRole, 'id'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: role?.name || '',
      displayName: role?.displayName || '',
      description: role?.description || '',
      inheritFrom: role?.inheritFrom || '',
      permissions: role?.permissions || []
    });

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
      setFormData(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(p => p !== permissionId)
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        isDefault: false
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Role ID</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., custom_manager"
              required
            />
          </div>
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g., Custom Manager"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this role can do..."
          />
        </div>

        <div>
          <Label htmlFor="inheritFrom">Inherit From (Optional)</Label>
          <Select value={formData.inheritFrom} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, inheritFrom: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select a base role to inherit from" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No inheritance</SelectItem>
              {Array.isArray(dbRoles) && dbRoles.map((role: any) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Permissions</Label>
          <div className="mt-2 space-y-4">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                      <Badge variant={
                        permission.level === 'admin' ? 'destructive' :
                        permission.level === 'write' ? 'default' : 'secondary'
                      }>
                        {permission.level}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            {role ? 'Update Role' : 'Create Role'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Role Management</h2>
        <p className="text-muted-foreground">
          Create custom roles and assign them to users for granular access control.
        </p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList>
          <TabsTrigger value="roles">Custom Roles</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        </TabsList>

        {/* Custom Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Roles</CardTitle>
                  <CardDescription>
                    Create and manage custom roles with specific permissions
                  </CardDescription>
                </div>
                <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Custom Role</DialogTitle>
                    </DialogHeader>
                    <RoleForm
                      onSubmit={(roleData) => createRoleMutation.mutate(roleData)}
                      onCancel={() => setIsCreateRoleOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Default Roles */}
                <div>
                  <h3 className="font-medium mb-2">Default Roles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(dbRoles) && dbRoles.map((role: any) => (
                      <Card key={role.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{role.name}</CardTitle>
                            <Badge variant="outline">Database Role</Badge>
                          </div>
                          <CardDescription className="text-xs">
                            Role ID: {role.id}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-muted-foreground">
                            System Role
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Custom Roles */}
                {Array.isArray(customRoles) && customRoles.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Custom Roles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customRoles.map((role: UserRole) => (
                        <Card key={role.id} className="relative">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{role.displayName}</CardTitle>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingRole(role)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteRoleMutation.mutate(role.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription className="text-xs">
                              {role.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {role.permissions.length} permissions
                              </span>
                              {role.inheritFrom && (
                                <Badge variant="secondary" className="text-xs">
                                  Extends {role.inheritFrom}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Role Dialog */}
          {editingRole && (
            <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Role: {editingRole.displayName}</DialogTitle>
                </DialogHeader>
                <RoleForm
                  role={editingRole}
                  onSubmit={(roleData) => updateRoleMutation.mutate({ 
                    roleId: editingRole.id, 
                    roleData 
                  })}
                  onCancel={() => setEditingRole(null)}
                />
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* User Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>
                Assign roles to users for customized access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Custom Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(users) && users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {Array.isArray(dbRoles) ? dbRoles.find((r: any) => r.id === user.roleId)?.name || 'Unknown' : 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.customRole ? (
                          <Badge>{user.customRole}</Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          Assign Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Role Assignment Dialog */}
          {selectedUser && (
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Role to {selectedUser.fullName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select onValueChange={(value) => 
                    assignRoleMutation.mutate({ userId: selectedUser.id, roleId: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {allRoles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name || role.displayName} ({role.permissions?.length || 0} permissions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                View which roles have access to specific permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      {Array.isArray(dbRoles) && dbRoles.map((role: any) => (
                        <TableHead key={role.id} className="text-center min-w-[100px]">
                          {role.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DASHBOARD_PERMISSIONS.map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.category} • {permission.level}
                            </div>
                          </div>
                        </TableCell>
                        {Array.isArray(dbRoles) && dbRoles.map((role: any) => {
                          // For database roles, show placeholder permissions since we don't have permission mapping
                          return (
                            <TableCell key={role.id} className="text-center">
                              <span className="text-xs text-muted-foreground">DB Role</span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}