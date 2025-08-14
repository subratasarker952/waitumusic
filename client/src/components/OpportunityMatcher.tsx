import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin, 
  DollarSign, 
  Mail, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  User,
  Award,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface OpportunityMatch {
  opportunity_id: number;
  opportunity_title: string;
  opportunity_description: string;
  organizer_name: string;
  contact_email: string;
  application_process: string;
  credibility_score: number;
  match_score: number;
  match_reasons: string[];
  category: string;
  deadline: string;
  amount: string;
  location: string;
  compensation_type: string;
  requirements: string;
  tags: string;
  url: string;
}

interface Recommendations {
  matches: OpportunityMatch[];
  insights: string[];
  next_actions: string[];
  profile_tips: string[];
  user_id: number;
  generated_at: string;
}

interface ProfileScore {
  success: boolean;
  profile_completeness: number;
  user_profile: any;
  managed_status: boolean;
  experience_level: string;
}

export default function OpportunityMatcher() {
  const [activeTab, setActiveTab] = useState('matches');
  const queryClient = useQueryClient();

  // Fetch personalized recommendations
  const { data: recommendations, isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery({
    queryKey: ['/api/opportunity-matching/recommendations'],
    queryFn: async () => {
      const response = await apiRequest('/api/opportunity-matching/recommendations', { method: 'POST' });
      // Handle the response structure with success flag
      if (response && response.success) {
        return {
          matches: response.matches || [],
          insights: response.insights || [],
          next_actions: response.next_actions || [],
          profile_tips: response.profile_tips || [],
          user_id: response.user_id || 0,
          generated_at: response.generated_at || new Date().toISOString()
        };
      }
      return { matches: [], insights: [], next_actions: [], profile_tips: [], user_id: 0, generated_at: new Date().toISOString() };
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch profile score
  const { data: profileScore, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/opportunity-matching/profile-score'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/opportunity-matching/profile-score/me');
        // Handle the response structure with success flag
        if (response && response.success) {
          return {
            success: response.success,
            profile_completeness: response.profile_completeness || 0,
            user_profile: response.user_profile || {},
            managed_status: response.managed_status || false,
            experience_level: response.experience_level || 'beginner'
          };
        }
        return { success: false, profile_completeness: 0, user_profile: {}, managed_status: false, experience_level: 'beginner' };
      } catch (error) {
        return { success: false, profile_completeness: 0, user_profile: {}, managed_status: false, experience_level: 'beginner' };
      }
    }
  });

  // Ensure safe data access with proper structure validation
  const safeRecommendations = (recommendations && recommendations.matches) ? recommendations : { 
    matches: [], 
    insights: [], 
    next_actions: [], 
    profile_tips: [], 
    user_id: 0, 
    generated_at: new Date().toISOString() 
  };
  
  const safeProfileScore = (profileScore && typeof profileScore.profile_completeness === 'number') ? profileScore : { 
    success: false, 
    profile_completeness: 0, 
    user_profile: {}, 
    managed_status: false, 
    experience_level: 'beginner' 
  };

  // Debug log to check data
  console.log('OpportunityMatcher Fixed API Response Data:', { 
    recommendations, 
    profileScore, 
    safeRecommendations, 
    safeProfileScore,
    recommendationsLoading,
    profileLoading,
    bothLoading: recommendationsLoading && profileLoading
  });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getCredibilityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">High Trust</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">Verified</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">Standard</Badge>;
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const refreshMatches = () => {
    refetchRecommendations();
    queryClient.invalidateQueries({ queryKey: ['/api/opportunity-matching'] });
  };

  // Show loading state only if both queries are still loading
  if (recommendationsLoading && profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Finding your perfect opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Profile Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Completeness</p>
                <p className="text-2xl font-bold">{safeProfileScore.profile_completeness || 0}%</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={safeProfileScore.profile_completeness || 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quality Matches</p>
                <p className="text-2xl font-bold">{safeRecommendations.matches.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">60%+ compatibility</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {safeProfileScore.managed_status ? 'Managed' : 'Independent'}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{safeProfileScore.experience_level || 'Getting started'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matches">Matches ({safeRecommendations.matches.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="profile">Profile Tips</TabsTrigger>
        </TabsList>

        {/* Opportunity Matches */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Opportunity Matches</h3>
            <Button variant="outline" onClick={refreshMatches}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {safeRecommendations.matches.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-medium mb-2">No High-Quality Matches Found</h3>
                <p className="text-gray-600 mb-4">Complete your profile or check back later for new opportunities</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {safeRecommendations.matches.map((match: OpportunityMatch) => (
                <Card key={match.opportunity_id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{match.opportunity_title}</CardTitle>
                      <Badge className={`ml-2 ${getMatchScoreColor(match.match_score)}`}>
                        {match.match_score}% Match
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{match.organizer_name}</span>
                      {getCredibilityBadge(match.credibility_score)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{match.opportunity_description}</p>
                    
                    {/* Match Reasons */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Why this matches:</p>
                      <div className="space-y-1">
                        {(match.match_reasons || []).slice(0, 3).map((reason: string, index: number) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Opportunity Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{match.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{match.compensation_type} - {match.amount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDeadline(match.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{match.category}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Mail className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={match.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Source
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Your Opportunity Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(safeRecommendations.insights || []).map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Next Actions */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRight className="h-5 w-5 mr-2" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(safeRecommendations.next_actions || []).map((action: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tips */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Improvement Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(safeRecommendations.profile_tips || []).map((tip: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {new Date(safeRecommendations.generated_at).toLocaleString()}
      </div>
    </div>
  );
}