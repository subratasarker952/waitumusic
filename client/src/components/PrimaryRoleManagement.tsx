import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Users, Music, Mic } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { UserPrimaryRole, Role, InsertUserPrimaryRole } from '@shared/schema';
import { insertUserPrimaryRoleSchema } from '@shared/schema';

interface UserPrimaryRoleWithRole extends UserPrimaryRole {
  roleName: string;
}

const TYPICAL_ARTIST_ROLES = [
  { name: 'Lead Vocalist', description: 'Primary singer and frontperson' },
  { name: 'Backing Vocalist', description: 'Supporting vocals and harmonies' },
  { name: 'Singer-Songwriter', description: 'Performs original compositions' },
  { name: 'Rapper', description: 'Hip-hop and rap performer' },
  { name: 'MC/Host', description: 'Master of ceremonies and event host' },
  { name: 'Vocalist/Performer', description: 'General vocal performance' },
  { name: 'Solo Artist', description: 'Independent solo performer' },
  { name: 'Frontman/Frontwoman', description: 'Band leader and primary performer' }
];

const TYPICAL_MUSICIAN_ROLES = [
  { name: 'Guitarist', description: 'Electric or acoustic guitar player' },
  { name: 'Lead Guitarist', description: 'Primary guitar and solos' },
  { name: 'Rhythm Guitarist', description: 'Chord progressions and rhythm' },
  { name: 'Bass Guitarist', description: 'Bass guitar and low-end foundation' },
  { name: 'Drummer', description: 'Percussion and rhythm section' },
  { name: 'Keyboardist', description: 'Piano, keyboards, and synthesizers' },
  { name: 'Pianist', description: 'Acoustic and digital piano' },
  { name: 'Saxophonist', description: 'Saxophone performance' },
  { name: 'Trumpeter', description: 'Trumpet and brass performance' },
  { name: 'Violinist', description: 'Violin and string performance' },
  { name: 'Cellist', description: 'Cello performance' },
  { name: 'Percussionist', description: 'Various percussion instruments' },
  { name: 'DJ', description: 'Disc jockey and electronic music' },
  { name: 'Producer/Musician', description: 'Music production and performance' },
  { name: 'Multi-instrumentalist', description: 'Multiple instrument proficiency' },
  { name: 'Session Musician', description: 'Professional recording and live support' }
];

export function PrimaryRoleManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserPrimaryRoleWithRole | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch primary roles
  const { data: primaryRoles = [], isLoading: rolesLoading } = useQuery<UserPrimaryRoleWithRole[]>({
    queryKey: ['/api/primary-roles'],
  });

  // Fetch user roles for dropdown
  const { data: userRoles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  // Create primary role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: InsertUserPrimaryRole) => apiRequest('/api/primary-roles', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/primary-roles'] });
      setIsCreateModalOpen(false);
      toast({ title: 'Primary role created successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating primary role', 
        description: error.message || 'Failed to create primary role',
        variant: 'destructive' 
      });
    }
  });

  // Update primary role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<UserPrimaryRole> }) => 
      apiRequest(`/api/primary-roles/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/primary-roles'] });
      setEditingRole(null);
      toast({ title: 'Primary role updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating primary role', 
        description: error.message || 'Failed to update primary role',
        variant: 'destructive' 
      });
    }
  });

  // Delete primary role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/primary-roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/primary-roles'] });
      toast({ title: 'Primary role deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting primary role', 
        description: error.message || 'This role may be in use and cannot be deleted',
        variant: 'destructive' 
      });
    }
  });

  // Form for creating/editing roles
  const form = useForm<InsertUserPrimaryRole>({
    resolver: zodResolver(insertUserPrimaryRoleSchema),
    defaultValues: {
      name: '',
      roleId: 0,
      description: '',
      isDefault: false,
      sortOrder: 0
    }
  });

  const onSubmit = (data: InsertUserPrimaryRole) => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const handleEdit = (role: UserPrimaryRoleWithRole) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      roleId: role.roleId,
      description: role.description || '',
      isDefault: role.isDefault,
      sortOrder: role.sortOrder
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateFromTemplate = (template: { name: string; description: string }, roleId: number) => {
    form.reset({
      name: template.name,
      roleId,
      description: template.description,
      isDefault: false,
      sortOrder: 0
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingRole(null);
    form.reset();
  };

  // Filter roles by selected role ID
  const filteredRoles = selectedRoleId 
    ? primaryRoles.filter(role => role.roleId === selectedRoleId)
    : primaryRoles;

  // Get role categories for tabs
  const artistRoleIds = userRoles.filter(r => r.name.toLowerCase().includes('artist')).map(r => r.id);
  const musicianRoleIds = userRoles.filter(r => r.name.toLowerCase().includes('musician')).map(r => r.id);

  if (rolesLoading) {
    return <div className="flex items-center justify-center p-8">Loading primary roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Primary Role Management</h2>
          <p className="text-muted-foreground">
            Manage primary talent roles for artists and musicians. These roles define professional positions and can only be assigned to matching user types.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Primary Role
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Roles ({primaryRoles.length})</TabsTrigger>
          <TabsTrigger value="artist">
            <Mic className="h-4 w-4 mr-2" />
            Artist Roles ({primaryRoles.filter(r => artistRoleIds.includes(r.roleId)).length})
          </TabsTrigger>
          <TabsTrigger value="musician">
            <Music className="h-4 w-4 mr-2" />
            Musician Roles ({primaryRoles.filter(r => musicianRoleIds.includes(r.roleId)).length})
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Primary Roles</CardTitle>
                <Select onValueChange={(value) => setSelectedRoleId(value === 'all' ? null : Number(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All User Roles</SelectItem>
                    {userRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>User Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.roleName}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                      <TableCell>
                        {role.isDefault && <Badge variant="secondary">Default</Badge>}
                      </TableCell>
                      <TableCell>{role.sortOrder}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteRoleMutation.mutate(role.id)}
                            disabled={deleteRoleMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Artist Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>User Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {primaryRoles.filter(r => artistRoleIds.includes(r.roleId)).map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.roleName}</Badge>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteRoleMutation.mutate(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="musician" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Musician Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>User Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {primaryRoles.filter(r => musicianRoleIds.includes(r.roleId)).map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.roleName}</Badge>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteRoleMutation.mutate(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Artist Role Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TYPICAL_ARTIST_ROLES.map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Select onValueChange={(roleId) => handleCreateFromTemplate(template, Number(roleId))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Add to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.filter(r => r.name.toLowerCase().includes('artist')).map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Musician Role Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TYPICAL_MUSICIAN_ROLES.map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Select onValueChange={(roleId) => handleCreateFromTemplate(template, Number(roleId))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Add to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.filter(r => r.name.toLowerCase().includes('musician')).map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Role Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Primary Role' : 'Create Primary Role'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lead Vocalist, Guitarist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                        <SelectContent>
                          {userRoles.filter(r => 
                            r.name.toLowerCase().includes('artist') || 
                            r.name.toLowerCase().includes('musician')
                          ).map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe this role and its responsibilities" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}