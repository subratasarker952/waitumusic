import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, DollarSign, TrendingUp, Users, Star, Globe, 
  PieChart, Target, ArrowUp, Calendar, Shield, Zap 
} from 'lucide-react';

interface ComeSeeTvMetrics {
  totalInvestment: number;
  currentRevenue: number;
  artistsEnrolled: number;
  bookingsCompleted: number;
  roi: number;
  projectedRevenue: Record<string, number>;
}

interface ArtistProgram {
  id: number;
  artistName: string;
  programLevel: string;
  monthlyStipend: number;
  marketingSupport: number;
  tourSupport: number;
  recordingBudget: number;
  guaranteedBookings: number;
  totalEarnings: number;
  bookingsCompleted: number;
}

export default function ComeSeeTvIntegrationDashboard() {
  const [metrics, setMetrics] = useState<ComeSeeTvMetrics>({
    totalInvestment: 3750000,
    currentRevenue: 850000,
    artistsEnrolled: 4,
    bookingsCompleted: 156,
    roi: 22.7,
    projectedRevenue: {
      year1: 850000,
      year2: 1500000,
      year3: 2500000,
      year4: 4000000,
      year5: 6500000
    }
  });

  const [artistPrograms, setArtistPrograms] = useState<ArtistProgram[]>([
    {
      id: 1,
      artistName: "Lí-Lí Octave",
      programLevel: "established",
      monthlyStipend: 10000,
      marketingSupport: 75000,
      tourSupport: 150000,
      recordingBudget: 200000,
      guaranteedBookings: 36,
      totalEarnings: 290000,
      bookingsCompleted: 42
    },
    {
      id: 2,
      artistName: "JCro",
      programLevel: "developing",
      monthlyStipend: 5000,
      marketingSupport: 35000,
      tourSupport: 60000,
      recordingBudget: 75000,
      guaranteedBookings: 24,
      totalEarnings: 145000,
      bookingsCompleted: 28
    },
    {
      id: 3,
      artistName: "Janet Azzouz",
      programLevel: "developing",
      monthlyStipend: 5000,
      marketingSupport: 35000,
      tourSupport: 60000,
      recordingBudget: 75000,
      guaranteedBookings: 24,
      totalEarnings: 132000,
      bookingsCompleted: 24
    },
    {
      id: 4,
      artistName: "Princess Trinidad",
      programLevel: "emerging",
      monthlyStipend: 2500,
      marketingSupport: 15000,
      tourSupport: 25000,
      recordingBudget: 35000,
      guaranteedBookings: 12,
      totalEarnings: 62000,
      bookingsCompleted: 16
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgramColor = (level: string) => {
    switch (level) {
      case 'superstar': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'established': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developing': return 'bg-green-100 text-green-800 border-green-200';
      case 'emerging': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateTotalArtistValue = () => {
    return artistPrograms.reduce((total, artist) => {
      return total + (artist.monthlyStipend * 12) + artist.marketingSupport + 
             artist.tourSupport + artist.recordingBudget;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              ComeSeeTv USA, Inc. Integration
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leveraging sister company resources for guaranteed financial success and artist development
          </p>
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
            Registered US Corporation • Strategic Financial Partner
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Financial Overview</TabsTrigger>
            <TabsTrigger value="artists">Artist Programs</TabsTrigger>
            <TabsTrigger value="projections">Revenue Projections</TabsTrigger>
            <TabsTrigger value="strategy">Success Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Investment</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(metrics.totalInvestment)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    ComeSeeTv USA backing
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Current Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(metrics.currentRevenue)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    {metrics.roi.toFixed(1)}% ROI achieved
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Artists Enrolled</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {metrics.artistsEnrolled}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-purple-700 mt-2">
                    In development programs
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Bookings Completed</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {metrics.bookingsCompleted}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-xs text-orange-700 mt-2">
                    Guaranteed success rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Investment Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  ComeSeeTv Investment Package Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$250K</div>
                    <div className="text-sm text-gray-600">Startup Package</div>
                    <div className="text-xs text-gray-500">15% revenue share</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">$500K</div>
                    <div className="text-sm text-gray-600">Growth Package</div>
                    <div className="text-xs text-gray-500">12% revenue share</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">$1M</div>
                    <div className="text-sm text-gray-600">Premium Package</div>
                    <div className="text-xs text-gray-500">10% revenue share</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">$2M</div>
                    <div className="text-sm text-gray-600">Enterprise Package</div>
                    <div className="text-xs text-gray-500">8% revenue share</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Package Benefits Include:</h4>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-800">
                    <div>• US market access and distribution</div>
                    <div>• Legal and business development support</div>
                    <div>• Marketing and promotional infrastructure</div>
                    <div>• Artist development funding</div>
                    <div>• Guaranteed booking minimums</div>
                    <div>• International expansion opportunities</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artists" className="space-y-6">
            {/* Artist Programs Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  ComeSeeTv Artist Development Programs
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Total Artist Investment: {formatCurrency(calculateTotalArtistValue())}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {artistPrograms.map((artist) => (
                    <Card key={artist.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {artist.artistName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{artist.artistName}</h3>
                            <Badge className={getProgramColor(artist.programLevel)}>
                              {artist.programLevel.charAt(0).toUpperCase() + artist.programLevel.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(artist.totalEarnings)}
                          </div>
                          <div className="text-xs text-gray-500">Total earnings</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">{formatCurrency(artist.monthlyStipend)}</div>
                          <div className="text-gray-600">Monthly Stipend</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">{formatCurrency(artist.marketingSupport)}</div>
                          <div className="text-gray-600">Marketing Support</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">{formatCurrency(artist.recordingBudget)}</div>
                          <div className="text-gray-600">Recording Budget</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">{artist.bookingsCompleted}/{artist.guaranteedBookings}</div>
                          <div className="text-gray-600">Bookings Progress</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Booking Progress</span>
                          <span>{Math.min(100, (artist.bookingsCompleted / artist.guaranteedBookings) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(100, (artist.bookingsCompleted / artist.guaranteedBookings) * 100)} 
                          className="h-2"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            {/* Revenue Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  5-Year Revenue Projections with ComeSeeTv Backing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.projectedRevenue).map(([year, revenue], index) => (
                    <div key={year} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">Year {index + 1}</div>
                          <div className="text-sm text-gray-600">
                            {index === 0 && "Platform launch with ComeSeeTv backing"}
                            {index === 1 && "Established artist programs"}
                            {index === 2 && "Full platform integration"}
                            {index === 3 && "International expansion"}
                            {index === 4 && "Superstar artist development"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(revenue)}
                        </div>
                        {index > 0 && (
                          <div className="text-sm text-green-700 flex items-center">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            {(((revenue - Object.values(metrics.projectedRevenue)[index - 1]) / Object.values(metrics.projectedRevenue)[index - 1]) * 100).toFixed(0)}% growth
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Projected 5-Year Totals:</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(Object.values(metrics.projectedRevenue).reduce((a, b) => a + b, 0))}
                      </div>
                      <div className="text-green-700">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(metrics.totalInvestment)}
                      </div>
                      <div className="text-blue-700">ComeSeeTv Investment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(((Object.values(metrics.projectedRevenue).reduce((a, b) => a + b, 0) - metrics.totalInvestment) / metrics.totalInvestment) * 100).toFixed(0)}%
                      </div>
                      <div className="text-purple-700">5-Year ROI</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            {/* Success Strategy */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Platform Growth Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">$3.75M Investment Pool</div>
                        <div className="text-gray-600">Complete financial backing for platform development</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">US Market Access</div>
                        <div className="text-gray-600">Leverage ComeSeeTv registered status for market entry</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Legal & Business Support</div>
                        <div className="text-gray-600">Corporate structure and contract negotiation expertise</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Marketing Infrastructure</div>
                        <div className="text-gray-600">Established promotional channels and industry connections</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Artist Success Guarantee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Guaranteed Stipends</div>
                        <div className="text-gray-600">$2,500 - $25,000 monthly living support</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Booking Minimums</div>
                        <div className="text-gray-600">12-52 guaranteed bookings annually per artist</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Target className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Recording Budgets</div>
                        <div className="text-gray-600">$35K - $750K production funding</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Globe className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Market Expansion</div>
                        <div className="text-gray-600">US access and international opportunities</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Mitigation */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Shield className="w-5 h-5 mr-2" />
                  Risk Mitigation & Financial Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-2">Financial Stability</h4>
                    <ul className="space-y-1">
                      <li>• ComeSeeTv backing provides market fluctuation protection</li>
                      <li>• Diversified revenue streams across platform and artists</li>
                      <li>• Emergency fund allocation from investment pool</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Legal Protection</h4>
                    <ul className="space-y-1">
                      <li>• US corporate structure via ComeSeeTv USA, Inc.</li>
                      <li>• Comprehensive insurance for tours and projects</li>
                      <li>• Professional legal support for all contracts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}