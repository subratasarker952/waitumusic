import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Edit, Trash2, Plus, Users, Database, BarChart3, Calendar, FileText, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EndpointPermission {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  allowedRoles: number[];
  description: string;
  category: 'user' | 'admin' | 'content' | 'booking' | 'system' | 'analytics';
}

interface AuthorizationRule {
  id: string;
  name: string;
  category: string;
  endpoints: EndpointPermission[];
  isActive: boolean;
  lastModified: string;
  modifiedBy: number;
}

const categoryIcons = {
  user: Users,
  admin: Shield,
  content: FileText,
  booking: Calendar,
  system: Settings,
  analytics: BarChart3
};

const methodColors = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-orange-100 text-orange-800',
  PATCH: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800'
};

export default function AuthorizationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<AuthorizationRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch authorization rules
  const { data: authRules = [], isLoading } = useQuery({
    queryKey: ['/api/admin/authorization-rules'],
    queryFn: () => apiRequest('/api/admin/authorization-rules')
  });

  // Fetch available roles for dropdowns
  const { data: roles = [] } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: () => apiRequest('/api/roles')
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<AuthorizationRule> }) =>
      apiRequest(`/api/admin/authorization-rules/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates)
      }),
    onSuccess: () => {
      toast({ title: 'Authorization rule updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authorization-rules'] });
    },
    onError: () => {
      toast({ title: 'Failed to update authorization rule', variant: 'destructive' });
    }
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/authorization-rules/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: 'Authorization rule deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authorization-rules'] });
    },
    onError: () => {
      toast({ title: 'Failed to delete authorization rule', variant: 'destructive' });
    }
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (rule: Omit<AuthorizationRule, 'id' | 'lastModified' | 'modifiedBy'>) =>
      apiRequest('/api/admin/authorization-rules', {
        method: 'POST',
        body: JSON.stringify(rule)
      }),
    onSuccess: () => {
      toast({ title: 'Authorization rule created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authorization-rules'] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to create authorization rule', variant: 'destructive' });
    }
  });

  const filteredRules = selectedCategory === 'all' 
    ? authRules 
    : authRules.filter((rule: AuthorizationRule) => rule.category === selectedCategory);

  const categories = [...new Set(authRules.map((rule: AuthorizationRule) => rule.category))];

  const toggleRuleStatus = (rule: AuthorizationRule) => {
    updateRuleMutation.mutate({
      id: rule.id,
      updates: { isActive: !rule.isActive }
    });
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r: any) => r.id === roleId);
    return role?.name || `Role ${roleId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Authorization Management</h2>
          <p className="text-gray-600">Centralized control of all API endpoint permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Authorization Rule</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-gray-600">
              Create new authorization rules through the API or contact system administrator.
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{authRules.length}</div>
            <div className="text-sm text-gray-600">Total Rules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {authRules.filter((r: AuthorizationRule) => r.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Rules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {authRules.reduce((acc: number, rule: AuthorizationRule) => acc + rule.endpoints.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Endpoints</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules Management</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoint Matrix</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || Shield;
              const categoryRules = authRules.filter((rule: AuthorizationRule) => rule.category === category);
              const activeRules = categoryRules.filter((rule: AuthorizationRule) => rule.isActive);
              
              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5" />
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rules</span>
                        <span className="font-medium">{categoryRules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active</span>
                        <span className="font-medium text-green-600">{activeRules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Endpoints</span>
                        <span className="font-medium">
                          {categoryRules.reduce((acc, rule) => acc + rule.endpoints.length, 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredRules.map((rule: AuthorizationRule) => {
              const Icon = categoryIcons[rule.category as keyof typeof categoryIcons] || Shield;
              
              return (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {rule.name}
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRuleStatus(rule)}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Authorization Rule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{rule.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRuleMutation.mutate(rule.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        {rule.endpoints.length} endpoints • Last modified: {new Date(rule.lastModified).toLocaleDateString()}
                      </div>
                      
                      <div className="space-y-2">
                        {rule.endpoints.map((endpoint, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={methodColors[endpoint.method]}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm">{endpoint.endpoint}</code>
                              <span className="text-sm text-gray-600">{endpoint.description}</span>
                            </div>
                            <div className="flex gap-1">
                              {endpoint.allowedRoles.map(roleId => (
                                <Badge key={roleId} variant="outline" className="text-xs">
                                  {getRoleName(roleId)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Permission Matrix</CardTitle>
              <p className="text-sm text-gray-600">
                Complete overview of all endpoints and their role permissions
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left">Method</th>
                      <th className="border p-2 text-left">Endpoint</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Allowed Roles</th>
                      <th className="border p-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authRules.flatMap((rule: AuthorizationRule) => 
                      rule.endpoints.map((endpoint, index) => (
                        <tr key={`${rule.id}-${index}`} className={!rule.isActive ? 'opacity-50' : ''}>
                          <td className="border p-2">
                            <Badge className={methodColors[endpoint.method]}>
                              {endpoint.method}
                            </Badge>
                          </td>
                          <td className="border p-2">
                            <code className="text-sm">{endpoint.endpoint}</code>
                          </td>
                          <td className="border p-2 text-sm">{endpoint.description}</td>
                          <td className="border p-2">
                            <div className="flex gap-1 flex-wrap">
                              {endpoint.allowedRoles.map(roleId => (
                                <Badge key={roleId} variant="outline" className="text-xs">
                                  {getRoleName(roleId)}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="border p-2">
                            <Badge variant="secondary">{endpoint.category}</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role: any) => {
              const roleEndpoints = authRules.flatMap((rule: AuthorizationRule) =>
                rule.endpoints.filter(endpoint => endpoint.allowedRoles.includes(role.id))
              );
              
              return (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {role.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Access to {roleEndpoints.length} endpoints
                      </div>
                      <div className="space-y-1">
                        {Object.entries(
                          roleEndpoints.reduce((acc, endpoint) => {
                            acc[endpoint.category] = (acc[endpoint.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}