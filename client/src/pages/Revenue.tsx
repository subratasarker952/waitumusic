import { useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateRevenueStreamModal, CreateRevenueGoalModal, GenerateForecastModal } from '@/components/modals/RevenueModals';
import { Plus, Target, TrendingUp, DollarSign, Calendar, BarChart3, Activity } from 'lucide-react';

export default function Revenue() {
  const { user } = useAuth();
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [forecastModalOpen, setForecastModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Comprehensive revenue tracking and analytics dashboard</p>
        </div>
        
        <div className="space-y-6">
          {/* Revenue Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">No revenue data available</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">Start earning revenue through bookings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No active bookings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">Waiting for revenue data</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue Analytics & Forecasting Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Analytics & Forecasting
              </CardTitle>
              <CardDescription>
                Manage your revenue streams, set goals, and generate AI-powered forecasts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setStreamModalOpen(true)}
                  className="flex items-center gap-2 h-auto p-4"
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Add Revenue Stream</div>
                      <div className="text-xs text-muted-foreground">Track new income sources</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setGoalModalOpen(true)}
                  className="flex items-center gap-2 h-auto p-4"
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Target className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Create Revenue Goal</div>
                      <div className="text-xs text-muted-foreground">Set financial targets</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setForecastModalOpen(true)}
                  className="flex items-center gap-2 h-auto p-4"
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Generate Forecast</div>
                      <div className="text-xs text-muted-foreground">AI-powered predictions</div>
                    </div>
                  </div>
                </Button>
              </div>
              
              {/* Getting Started Message */}
              <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Building Your Revenue Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use the buttons above to add revenue streams, set goals, and generate forecasts. 
                  Your analytics dashboard will appear here as you build your revenue data.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      window.location.href = '/bookings';
                    }}
                    variant="default"
                  >
                    View Bookings
                  </Button>
                  <Button 
                    onClick={() => {
                      window.location.href = '/dashboard';
                    }}
                    variant="outline"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal Components */}
      <CreateRevenueStreamModal
        open={streamModalOpen}
        onOpenChange={setStreamModalOpen}
        userId={user.id}
      />
      
      <CreateRevenueGoalModal
        open={goalModalOpen}
        onOpenChange={setGoalModalOpen}
        userId={user.id}
      />
      
      <GenerateForecastModal
        open={forecastModalOpen}
        onOpenChange={setForecastModalOpen}
        userId={user.id}
      />
    </div>
  );
}