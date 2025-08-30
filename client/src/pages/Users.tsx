import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users as UsersIcon,
  UserCheck,
  Search,
  Filter,
  Edit,
  Eye,
  ArrowLeft,
  Music,
  Headphones,
  Briefcase,
  Heart,
  Shield,
  Crown
} from 'lucide-react';
import { useLocation } from 'wouter';
import AuthorizedRoute from '@/components/AuthorizedRoute';
import UserManagementModal from '@/components/modals/UserManagementModal';

const getRoleIcon = (roleId: number) => {
  switch (roleId) {
    case 1: return <Crown className="h-4 w-4 text-yellow-600" />;
    case 2: return <Shield className="h-4 w-4 text-blue-600" />;
    case 3: return <Music className="h-4 w-4 text-purple-600" />;
    case 4: return <Music className="h-4 w-4 text-purple-400" />;
    case 5: return <Headphones className="h-4 w-4 text-blue-600" />;
    case 6: return <Headphones className="h-4 w-4 text-blue-400" />;
    case 7: return <Briefcase className="h-4 w-4 text-green-600" />;
    case 8: return <Briefcase className="h-4 w-4 text-green-400" />;
    case 9: return <Heart className="h-4 w-4 text-pink-500" />;
    default: return <UsersIcon className="h-4 w-4 text-gray-500" />;
  }
};

const getRoleName = (roleId: number, dbRoles: any[]) => {
  const role = Array.isArray(dbRoles) ? dbRoles.find((r: any) => r.id === roleId) : null;
  return role ? role.name : 'Unknown';
};

const getRoleColor = (roleId: number) => {
  switch (roleId) {
    case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
    case 3: return 'bg-purple-100 text-purple-800 border-purple-200';
    case 4: return 'bg-purple-50 text-purple-600 border-purple-200';
    case 5: return 'bg-blue-100 text-blue-800 border-blue-200';
    case 6: return 'bg-blue-50 text-blue-600 border-blue-200';
    case 7: return 'bg-green-100 text-green-800 border-green-200';
    case 8: return 'bg-green-50 text-green-600 border-green-200';
    case 9: return 'bg-pink-100 text-pink-800 border-pink-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function Users() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  // Fetch roles from database
  const { data: dbRoles } = useQuery({
    queryKey: ['/api/roles'],
  });

  // Fetch all users
  const { data: users = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/users/all'],
    enabled: !!user && [1, 2].includes(user.roleId) // Only superadmins and admins
  });

  // Filter users based on search and role
  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || roleFilter === 'all' || u.roleId.toString() === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleViewUser = (userData: any) => {
    setSelectedUser(userData);
    setModalMode('view');
  };

  const handleEditUser = (userData: any) => {
    setSelectedUser(userData);
    setModalMode('edit');
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Badge variant="outline" className="text-primary border-primary">
            <Shield className="h-3 w-3 mr-1" />
            {user?.roleId === 1 ? 'Superadmin' : 'Admin'} Access
          </Badge>
        </div>
        {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Platform Users</h1>
            <p className="text-muted-foreground">Comprehensive user management system</p>
          </div>


        {/* Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              User Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Array.isArray(dbRoles) && dbRoles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setLocation('/register')} className="w-full">
                <UserCheck className="h-4 w-4 mr-2" />
                Create New User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              All Platform Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading users...</div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((userData: any) => (
                  <Card key={userData.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg truncate">
                              {userData.fullName || 'No Name'}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {userData.email}
                            </p>
                          </div>
                          <Badge className={getRoleColor(userData.roleId)}>
                            {getRoleIcon(userData.roleId)}
                            <span className="ml-1">{getRoleName(userData.roleId, dbRoles || [])}</span>
                          </Badge>
                        </div>

                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            Status: <span className={userData.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                              {userData.status || 'unknown'}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            ID: {userData.id}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUser(userData)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {(user?.roleId === 1 || (user?.roleId === 2 && ![1, 2].includes(userData.roleId))) && (
                            <Button
                              size="sm"
                              onClick={() => handleEditUser(userData)}
                              className="flex-1"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No users match your current filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <UserManagementModal
          open={!!selectedUser}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
            }
          }}
          userId={selectedUser.id?.toString()}
          mode={modalMode}
        />
      )}
    </div>
  );
}