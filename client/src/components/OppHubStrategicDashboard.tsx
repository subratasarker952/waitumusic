import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Music, 
  Heart,
  Mail,
  Award,
  Zap,
  BarChart3,
  BrainCircuit,
  Rocket
} from 'lucide-react';

interface GrowthMetrics {
  total_revenue: {
    current: number;
    target: number;
    progress: number;
  };
  artist_bookings: {
    lili_octave: {
      current: number;
      target: number;
      progress: number;
    };
  };
  social_media: {
    total_followers: number;
    target: number;
    progress: number;
    platforms: {
      instagram: number;
      tiktok: number;
      youtube: number;
      twitter: number;
    };
  };
  brand_partnerships: {
    secured: number;
    target: number;
    in_pipeline: number;
  };
  sync_licensing: {
    placements: number;
    target: number;
    submissions: number;
  };
  email_list: {
    subscribers: number;
    target: number;
    progress: number;
  };
}

interface OpportunityMatch {
  id: string;
  title: string;
  category: string;
  estimated_revenue: number;
  match_score: number;
  deadline: string;
  requirements: string[];
  contact_info: string;
  application_url: string;
}

export default function OppHubStrategicDashboard() {
  const { toast } = useToast();
  const [selectedArtist, setSelectedArtist] = useState('lilioctave');

  // Fetch growth metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<GrowthMetrics>({
    queryKey: ['/api/opphub/growth-metrics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch opportunity matches
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<{
    matched_opportunities: OpportunityMatch[];
    total_matches: number;
  }>({
    queryKey: ['/api/opphub/opportunity-matching', selectedArtist],
    queryFn: () => apiRequest('/api/opphub/opportunity-matching', {
      method: 'POST',
      body: { artist_id: selectedArtist }
    }).then(res => res.json())
  });

  // Generate market research mutation
  const generateResearchMutation = useMutation({
    mutationFn: (data: { artist_id: string; research_type: string }) =>
      apiRequest('/api/opphub/market-research', {
        method: 'POST',
        body: data
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Market Research Generated",
        description: "AI analysis complete. Check your dashboard for insights.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opphub/growth-metrics'] });
    }
  });

  // Generate pitch mutation
  const generatePitchMutation = useMutation({
    mutationFn: (data: { 
      artist_id: string; 
      opportunity_id: string; 
      pitch_type: string 
    }) =>
      apiRequest('/api/opphub/generate-pitch', {
        method: 'POST',
        body: data
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Pitch Generated",
        description: "AI-powered pitch ready for review and customization.",
      });
    }
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US').format(num);

  if (metricsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            OppHub Strategic Growth
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Multi-Million Dollar Growth Strategy Dashboard
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Rocket className="h-4 w-4 mr-2" />
          12-Month Target: $2M+
        </Badge>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics?.total_revenue.current || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  Target: {formatCurrency(metrics?.total_revenue.target || 2000000)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
            <Progress 
              value={(metrics?.total_revenue.progress || 0) * 100} 
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Lí-Lí Octave Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics?.artist_bookings.lili_octave.current || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  Target: {formatCurrency(metrics?.artist_bookings.lili_octave.target || 300000)}
                </p>
              </div>
              <Music className="h-8 w-8 text-purple-500" />
            </div>
            <Progress 
              value={(metrics?.artist_bookings.lili_octave.progress || 0) * 100} 
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Social Media Followers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(metrics?.social_media.total_followers || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  Target: {formatNumber(metrics?.social_media.target || 100000)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <Progress 
              value={(metrics?.social_media.progress || 0) * 100} 
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Brand Partnerships
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics?.brand_partnerships.secured || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Target: {metrics?.brand_partnerships.target || 5}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {metrics?.brand_partnerships.in_pipeline || 0} in pipeline
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Revenue Opportunities</TabsTrigger>
          <TabsTrigger value="research">Market Research</TabsTrigger>
          <TabsTrigger value="analytics">Growth Analytics</TabsTrigger>
          <TabsTrigger value="automation">AI Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Matched Revenue Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opportunitiesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities?.matched_opportunities.map((opp) => (
                    <div key={opp.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{opp.title}</h3>
                          <p className="text-sm text-gray-600">
                            {opp.category} • Match Score: {(opp.match_score * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">
                            {formatCurrency(opp.estimated_revenue)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(opp.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {opp.requirements.map((req, index) => (
                            <Badge key={index} variant="outline">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-600">
                          Contact: {opp.contact_info}
                        </div>
                        <Button
                          onClick={() => generatePitchMutation.mutate({
                            artist_id: selectedArtist,
                            opportunity_id: opp.id,
                            pitch_type: opp.category
                          })}
                          disabled={generatePitchMutation.isPending}
                        >
                          <BrainCircuit className="h-4 w-4 mr-2" />
                          Generate AI Pitch
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                AI Market Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => generateResearchMutation.mutate({
                    artist_id: selectedArtist,
                    research_type: 'competitive_analysis'
                  })}
                  disabled={generateResearchMutation.isPending}
                  className="p-6 h-auto flex-col space-y-2"
                >
                  <TrendingUp className="h-8 w-8" />
                  <span>Competitive Analysis</span>
                  <span className="text-sm opacity-75">
                    Analyze similar artists' success
                  </span>
                </Button>

                <Button
                  onClick={() => generateResearchMutation.mutate({
                    artist_id: selectedArtist,
                    research_type: 'trend_analysis'
                  })}
                  disabled={generateResearchMutation.isPending}
                  className="p-6 h-auto flex-col space-y-2"
                >
                  <Zap className="h-8 w-8" />
                  <span>Trend Analysis</span>
                  <span className="text-sm opacity-75">
                    Identify emerging opportunities
                  </span>
                </Button>

                <Button
                  onClick={() => generateResearchMutation.mutate({
                    artist_id: selectedArtist,
                    research_type: 'brand_opportunities'
                  })}
                  disabled={generateResearchMutation.isPending}
                  className="p-6 h-auto flex-col space-y-2"
                >
                  <Heart className="h-8 w-8" />
                  <span>Brand Opportunities</span>
                  <span className="text-sm opacity-75">
                    Find matching brand partnerships
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics?.social_media.platforms || {}).map(([platform, followers]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{platform}</span>
                      <span className="font-bold">{formatNumber(followers)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Licensing Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Placements Secured</span>
                    <span className="font-bold text-emerald-600">
                      {metrics?.sync_licensing.placements || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Submissions Made</span>
                    <span className="font-bold">
                      {metrics?.sync_licensing.submissions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Target Placements</span>
                    <span className="font-bold text-gray-600">
                      {metrics?.sync_licensing.target || 10}
                    </span>
                  </div>
                  <Progress 
                    value={((metrics?.sync_licensing.placements || 0) / (metrics?.sync_licensing.target || 10)) * 100}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2" />
                AI Automation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Active Automation</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                      <span>Opportunity Scanning</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <span>Market Research</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Scheduled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <span>Pitch Generation</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        On-Demand
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Next Actions</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Social Media Content</p>
                      <p className="text-sm text-gray-600">
                        Generate viral content strategy for Lí-Lí Octave
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Brand Outreach</p>
                      <p className="text-sm text-gray-600">
                        Target ethical beauty and wellness brands
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Festival Applications</p>
                      <p className="text-sm text-gray-600">
                        Submit to Caribbean and world music festivals
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}