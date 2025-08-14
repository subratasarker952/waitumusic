import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  Lightbulb,
  Star,
  ArrowRight,
  Sparkles,
  BarChart3,
  Heart,
  Music
} from 'lucide-react';

interface CareerRecommendation {
  id: string;
  type: 'opportunity' | 'strategy' | 'development' | 'collaboration';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionSteps: string[];
  expectedOutcome: string;
  timeframe: string;
  confidence: number;
  tags: string[];
}

interface CareerInsights {
  careerStage: string;
  strengths: string[];
  growthAreas: string[];
  marketOpportunities: string[];
  recommendedActions: string[];
  networkingScore: number;
  engagementScore: number;
  bookingTrend: 'increasing' | 'stable' | 'declining';
  revenueProjection: number;
}

export default function CareerRecommendationWidget() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's career recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/recommendations/career', user?.id],
    enabled: !!user
  });

  // Fetch career insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/recommendations/insights', user?.id],
    enabled: !!user
  });

  const refreshRecommendations = async () => {
    setRefreshing(true);
    try {
      const response = await apiRequest(`/api/recommendations/refresh/${user?.id}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Recommendations Updated",
          description: "Your career recommendations have been refreshed with the latest data."
        });
        // Refresh the query data
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh recommendations.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'strategy': return <Target className="h-4 w-4" />;
      case 'development': return <Lightbulb className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter((rec: CareerRecommendation) => rec.type === selectedCategory);

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Career Recommendations</h3>
              <p className="text-muted-foreground">Sign in to get personalized career insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if user is managed or admin/superadmin
  const isManaged = role?.includes('managed_') || false;
  const isAdminOrSuperadmin = role === 'admin' || role === 'superadmin';
  
  if (!isManaged && !isAdminOrSuperadmin) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Advanced Features for Managed Users</h3>
              <p className="text-muted-foreground">
                Advanced career recommendations are exclusively available for managed artists, musicians, and professionals. 
                Contact us to learn about our management services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Career Recommendations
          </h2>
          <p className="text-muted-foreground">
            Personalized insights to accelerate your music career
          </p>
        </div>
        <Button 
          onClick={refreshRecommendations} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? 'Updating...' : 'Refresh'}
        </Button>
      </div>

      {/* Career Insights Overview */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Career Stage</p>
                  <p className="text-lg font-bold">{insights.careerStage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Engagement Score</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={insights.engagementScore} className="w-16" />
                    <span className="text-lg font-bold">{insights.engagementScore}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Network Score</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={insights.networkingScore} className="w-16" />
                    <span className="text-lg font-bold">{insights.networkingScore}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Booking Trend</p>
                  <p className="text-lg font-bold capitalize">{insights.bookingTrend}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="opportunity">Opportunities</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {recommendationsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredRecommendations.length > 0 ? (
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation: CareerRecommendation) => (
                <Card key={recommendation.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(recommendation.type)}
                        <h4 className="font-semibold">{recommendation.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">
                          {recommendation.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{recommendation.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Action Steps:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {recommendation.actionSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Expected Outcome:</p>
                        <p className="text-sm text-muted-foreground">{recommendation.expectedOutcome}</p>
                        <p className="text-sm font-medium mt-2">Timeframe:</p>
                        <p className="text-sm text-muted-foreground">{recommendation.timeframe}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {recommendation.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your profile and engage with the platform to get personalized recommendations.
              </p>
              <Button onClick={refreshRecommendations}>
                Generate Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.recommendedActions.map((action, index) => (
                <Button key={index} variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <p className="font-medium">{action}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}