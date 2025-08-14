import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Rocket, 
  Globe, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users,
  Calendar,
  Music,
  Award,
  Zap,
  Search,
  RefreshCw,
  BarChart3,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ScanStats {
  totalOpportunities: number;
  recentlyAdded: number;
  lastScanTime: string | null;
  categoryCounts: {
    festivals: number;
    grants: number;
    sync_licensing: number;
    competitions: number;
    showcases: number;
    collaborations: number;
  };
  regionCounts: {
    [key: string]: number;
  };
}

const OppHubAIScanner: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('scanner');
  const [filterCriteria, setFilterCriteria] = useState({
    categories: [],
    regions: [],
    compensationTypes: [],
    credibilityThreshold: 80,
    managedTalentOnly: false
  });
  const [promotionData, setPromotionData] = useState({
    targetMarkets: ['United States', 'Canada', 'United Kingdom', 'Europe'],
    budget: 50000,
    strategy: 'Multi-channel approach focusing on value proposition of consolidated opportunity discovery'
  });

  // Fetch scan status and statistics
  const { data: scanStats, isLoading: statsLoading } = useQuery<ScanStats>({
    queryKey: ['/api/opphub/scan-status'],
    refetchInterval: isScanning ? 5000 : 30000, // Poll more frequently while scanning
  });

  // Fetch OppHub sources information
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/opphub/sources'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch opportunity statistics
  const { data: oppStats, isLoading: oppStatsLoading } = useQuery({
    queryKey: ['/api/opphub/statistics'],
    refetchInterval: 30000,
  });

  // Fetch personalized report
  const { data: personalizedReport, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/opphub/personalized-report'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: () => apiRequest('/api/opphub/scan', { method: 'POST' }),
    onSuccess: (data) => {
      toast({ 
        title: 'AI Scanner Started', 
        description: data.message,
        variant: 'default'
      });
      setIsScanning(true);
      setScanProgress(0);
      
      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 2000);
      
      // Stop scanning indicator after 2 minutes
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(100);
        clearInterval(progressInterval);
        queryClient.invalidateQueries({ queryKey: ['/api/opphub/scan-status'] });
        queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
        toast({
          title: 'Scan Complete',
          description: 'OppHub has been populated with new opportunities!',
          variant: 'default'
        });
      }, 120000);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Scanner Error', 
        description: error.message || 'Failed to start AI scanner',
        variant: 'destructive'
      });
      setIsScanning(false);
      setScanProgress(0);
    }
  });

  // Promotion campaign mutation
  const promoteMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/opphub/promote', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      toast({ 
        title: 'Promotion Campaign Started', 
        description: `Self-promotion campaign initiated with projected reach of ${data.projectedReach?.toLocaleString()} users`,
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Promotion Error', 
        description: error.message || 'Failed to start promotion campaign',
        variant: 'destructive'
      });
    }
  });

  const startScan = () => {
    scanMutation.mutate();
  };

  const startPromotionCampaign = () => {
    promoteMutation.mutate(promotionData);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      festivals: Music,
      grants: Award,
      sync_licensing: Target,
      competitions: Award,
      showcases: Users,
      collaborations: Globe
    };
    const IconComponent = icons[category as keyof typeof icons] || Target;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-emerald-600" />
            OppHub AI Scanner
          </h2>
          <p className="text-gray-600">Autonomous opportunity discovery and self-promotion system</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/opphub/scan-status'] })}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scanner" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scanner">AI Scanner</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="promotion">Self-Promotion</TabsTrigger>
        </TabsList>

        {/* AI Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          {/* Scan Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                Web Scanning Control
              </CardTitle>
              <CardDescription>
                AI-powered scanning of international music industry websites for opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isScanning && (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <Brain className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    AI Scanner is currently running... Discovering new opportunities from {scanStats?.totalOpportunities || 0} sources worldwide.
                  </AlertDescription>
                </Alert>
              )}

              {isScanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scan Progress</span>
                    <span>{Math.round(scanProgress)}%</span>
                  </div>
                  <Progress value={scanProgress} className="w-full" />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={startScan}
                  disabled={isScanning || scanMutation.isPending}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isScanning ? 'Scanning...' : 'Start AI Scan'}
                </Button>

                <div className="text-sm text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Last scan: {scanStats?.lastScanTime ? new Date(scanStats.lastScanTime).toLocaleString() : 'Never'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{scanStats?.totalOpportunities || 0}</div>
                  <div className="text-sm text-gray-600">Total Opportunities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{scanStats?.recentlyAdded || 0}</div>
                  <div className="text-sm text-gray-600">Recently Added</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(scanStats?.regionCounts || {}).reduce((sum, count) => sum + count, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Global Regions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(scanStats?.categoryCounts || {}).reduce((sum, count) => sum + count, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Scanning Sources</CardTitle>
              <CardDescription>AI monitors these platforms for new opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Sonicbids', category: 'Festivals', region: 'Global', status: 'active' },
                  { name: 'Music Xray', category: 'Sync Licensing', region: 'Global', status: 'active' },
                  { name: 'ASCAP Foundation', category: 'Grants', region: 'USA', status: 'active' },
                  { name: 'BMI Foundation', category: 'Grants', region: 'USA', status: 'active' },
                  { name: 'Arts Council England', category: 'Grants', region: 'UK', status: 'active' },
                  { name: 'SubmitHub', category: 'Showcases', region: 'Global', status: 'active' }
                ].map((source, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{source.name}</h4>
                      <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                        {source.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3" />
                        {source.category}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {source.region}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanStats && Object.entries(scanStats.categoryCounts).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Regional Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanStats && Object.entries(scanStats.regionCounts).map(([region, count]) => (
                  <div key={region} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {region}
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Self-Promotion Tab */}
        <TabsContent value="promotion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Self-Promotion Campaign
              </CardTitle>
              <CardDescription>
                Autonomous marketing system to promote OppHub to target audiences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Markets</label>
                    <div className="space-y-2">
                      {promotionData.targetMarkets.map((market, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{market}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Campaign Budget</label>
                    <Input
                      type="number"
                      value={promotionData.budget}
                      onChange={(e) => setPromotionData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Strategy</label>
                    <Textarea
                      value={promotionData.strategy}
                      onChange={(e) => setPromotionData(prev => ({ ...prev, strategy: e.target.value }))}
                      className="min-h-32"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={startPromotionCampaign}
                  disabled={promoteMutation.isPending}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 w-full"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  {promoteMutation.isPending ? 'Launching Campaign...' : 'Launch Self-Promotion Campaign'}
                </Button>
              </div>

              <Alert className="border-emerald-200 bg-emerald-50">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <strong>Projected Impact:</strong> 500,000+ potential users reached, 400% ROI, 6 months to market penetration
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OppHubAIScanner;