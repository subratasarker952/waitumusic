import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Star,
  Target,
  Activity,
  DollarSign,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Music,
  Headphones,
  Briefcase,
  Eye,
  MessageSquare,
  Award,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserEngagementMetrics {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  stageNames?: string[];
  profileCompleteness: number;
  platformActivityScore: number;
  opportunityEngagement: number;
  socialMediaActivity: number;
  bookingSuccessRate: number;
  revenueGenerated: number;
  lastLoginDate: Date;
  totalLogins: number;
  profileViews: number;
  opportunitiesAppliedTo: number;
  opportunitiesWon: number;
  collaborationsCompleted: number;
  socialMediaFollowers: number;
  engagementRate: number;
  trajectoryScore: number;
  forecastedPotential: number;
  recommendedActions: string[];
  performanceStatus: 'exceeding' | 'on-track' | 'needs-attention' | 'critical';
  riskFactors: string[];
  strengthAreas: string[];
}

interface PerformanceInsights {
  totalManagedUsers: number;
  averageTrajectoryScore: number;
  usersExceeding: number;
  usersOnTrack: number;
  usersNeedingAttention: number;
  usersCritical: number;
  topRiskFactors: Array<{factor: string, count: number}>;
  opportunityApplicationRate: number;
  averageRevenueGenerated: number;
}

const ManagedUsersAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trajectoryScore');
  const [selectedUser, setSelectedUser] = useState<UserEngagementMetrics | null>(null);

  // Fetch managed users analytics
  const { data: managedUsersData, isLoading: usersLoading, refetch } = useQuery<UserEngagementMetrics[]>({
    queryKey: ['/api/managed-users/analytics'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch performance insights
  const { data: performanceInsights, isLoading: insightsLoading } = useQuery<PerformanceInsights>({
    queryKey: ['/api/managed-users/performance-insights'],
    refetchInterval: 300000,
  });

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!managedUsersData) return [];
    
    let filtered = managedUsersData.filter(user => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.stageNames && user.stageNames.some(name => 
          name.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      
      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      // Performance filter
      const matchesPerformance = performanceFilter === 'all' || user.performanceStatus === performanceFilter;
      
      return matchesSearch && matchesRole && matchesPerformance;
    });
    
    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trajectoryScore':
          return b.trajectoryScore - a.trajectoryScore;
        case 'forecastedPotential':
          return b.forecastedPotential - a.forecastedPotential;
        case 'revenueGenerated':
          return b.revenueGenerated - a.revenueGenerated;
        case 'lastActivity':
          return new Date(b.lastLoginDate).getTime() - new Date(a.lastLoginDate).getTime();
        case 'opportunityEngagement':
          return b.opportunityEngagement - a.opportunityEngagement;
        default:
          return b.trajectoryScore - a.trajectoryScore;
      }
    });
    
    return filtered;
  }, [managedUsersData, searchQuery, roleFilter, performanceFilter, sortBy]);

  const getPerformanceStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeding':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'on-track':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'needs-attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-track':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'managed_artist':
        return <Music className="h-4 w-4" />;
      case 'managed_musician':
        return <Headphones className="h-4 w-4" />;
      case 'managed_professional':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (usersLoading || insightsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      {performanceInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Managed Users</p>
                  <p className="text-2xl font-bold">{performanceInsights.totalManagedUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Trajectory Score</p>
                  <p className="text-2xl font-bold">{performanceInsights.averageTrajectoryScore}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(performanceInsights.averageRevenueGenerated)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opportunity Rate</p>
                  <p className="text-2xl font-bold">{performanceInsights.opportunityApplicationRate}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Status Summary */}
      {performanceInsights && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-600">Exceeding</span>
                </div>
                <p className="text-2xl font-bold">{performanceInsights.usersExceeding}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-600">On Track</span>
                </div>
                <p className="text-2xl font-bold">{performanceInsights.usersOnTrack}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-semibold text-yellow-600">Needs Attention</span>
                </div>
                <p className="text-2xl font-bold">{performanceInsights.usersNeedingAttention}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-semibold text-red-600">Critical</span>
                </div>
                <p className="text-2xl font-bold">{performanceInsights.usersCritical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Managed Users Analytics</CardTitle>
          <CardDescription>
            Comprehensive performance tracking and trajectory forecasting for all managed talent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or stage name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="managed_artist">Managed Artists</SelectItem>
                <SelectItem value="managed_musician">Managed Musicians</SelectItem>
                <SelectItem value="managed_professional">Managed Professionals</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="exceeding">Exceeding</SelectItem>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="needs-attention">Needs Attention</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trajectoryScore">Trajectory Score</SelectItem>
                <SelectItem value="forecastedPotential">Forecasted Potential</SelectItem>
                <SelectItem value="revenueGenerated">Revenue Generated</SelectItem>
                <SelectItem value="lastActivity">Last Activity</SelectItem>
                <SelectItem value="opportunityEngagement">Opportunity Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.userId} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.stageNames && user.stageNames.length > 0 
                              ? user.stageNames[0] 
                              : user.fullName
                            }
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPerformanceStatusColor(user.performanceStatus)}`}
                          >
                            {getPerformanceStatusIcon(user.performanceStatus)}
                            <span className="ml-1 capitalize">{user.performanceStatus.replace('-', ' ')}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Trajectory</p>
                        <p className="font-bold text-lg">{user.trajectoryScore}</p>
                        <Progress value={user.trajectoryScore} className="h-2 mt-1" />
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Potential</p>
                        <p className="font-bold text-lg">{user.forecastedPotential}</p>
                        <Progress value={user.forecastedPotential} className="h-2 mt-1" />
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-bold text-sm">{formatCurrency(user.revenueGenerated)}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Opportunities</p>
                        <p className="font-bold text-lg">{user.opportunitiesAppliedTo}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Social Followers</p>
                        <p className="font-bold text-sm">{user.socialMediaFollowers.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Last Active</p>
                        <p className="font-bold text-xs">{formatDate(user.lastLoginDate)}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>

                  {/* Risk Factors & Recommendations */}
                  {(user.riskFactors.length > 0 || user.recommendedActions.length > 0) && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.riskFactors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-2">Risk Factors:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.riskFactors.slice(0, 3).map((risk, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {user.recommendedActions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-600 mb-2">Recommended Actions:</p>
                          <div className="space-y-1">
                            {user.recommendedActions.slice(0, 2).map((action, index) => (
                              <p key={index} className="text-xs text-muted-foreground">
                                • {action}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No managed users found</h3>
              <p className="text-muted-foreground">
                {searchQuery || roleFilter !== 'all' || performanceFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No managed users are currently in the system.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal/Panel would go here */}
      {selectedUser && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {selectedUser.stageNames?.[0] || selectedUser.fullName}
                </CardTitle>
                <CardDescription>Detailed Analytics & Trajectory Forecast</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Detailed metrics would go here */}
              <div className="space-y-4">
                <h4 className="font-semibold">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Profile Completeness</span>
                    <span className="font-medium">{selectedUser.profileCompleteness}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Platform Activity</span>
                    <span className="font-medium">{selectedUser.platformActivityScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Opportunity Engagement</span>
                    <span className="font-medium">{selectedUser.opportunityEngagement}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">All Recommended Actions</h4>
                <div className="space-y-2">
                  {selectedUser.recommendedActions.map((action, index) => (
                    <p key={index} className="text-sm">• {action}</p>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Strength Areas</h4>
                <div className="space-y-1">
                  {selectedUser.strengthAreas.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="text-xs mr-1">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManagedUsersAnalyticsDashboard;