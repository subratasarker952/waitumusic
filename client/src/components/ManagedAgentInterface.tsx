import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Users, DollarSign, TrendingUp, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ManagedAgent {
  userId: number;
  services: string[];
  basePrice: string;
  isManaged: boolean;
  specializations: string[];
  commission?: number;
  totalBookings?: number;
  revenue?: number;
  rating?: number;
}

interface AgentMetrics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  responseTime: number;
  clientSatisfaction: number;
}

interface CounterOffer {
  id: number;
  bookingId: number;
  agentId: number;
  originalPrice: number;
  counterPrice: number;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const ManagedAgentInterface: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [counterOfferForm, setCounterOfferForm] = useState({
    bookingId: '',
    counterPrice: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: managedAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/advanced-booking/managed-agents'],
  });

  const { data: agentMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/advanced-booking/agents', selectedAgent, 'metrics'],
    enabled: !!selectedAgent,
  });

  const { data: counterOffers, isLoading: offersLoading } = useQuery({
    queryKey: ['/api/advanced-booking/counter-offers'],
  });

  // Mutations
  const autoAssignMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest(`/api/advanced-booking/bookings/${bookingId}/auto-assign-agent`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advanced-booking/managed-agents'] });
    },
  });

  const createCounterOfferMutation = useMutation({
    mutationFn: async (data: typeof counterOfferForm & { agentId: number }) => {
      return apiRequest(`/api/advanced-booking/bookings/${data.bookingId}/counter-offer`, {
        method: 'POST',
        body: {
          agentId: data.agentId,
          counterPrice: parseFloat(data.counterPrice),
          notes: data.notes,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advanced-booking/counter-offers'] });
      setCounterOfferForm({ bookingId: '', counterPrice: '', notes: '' });
    },
  });

  const handleCounterOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    
    createCounterOfferMutation.mutate({
      ...counterOfferForm,
      agentId: selectedAgent,
    });
  };

  const getCommissionRate = (agent: ManagedAgent) => {
    return agent.isManaged ? '10%' : '5%';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Managed Agent Dashboard</h2>
        <Badge variant="outline" className="px-3 py-1">
          {(managedAgents as any)?.length || 0} Active Agents
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Users className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Star className="h-4 w-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="counter-offers">
            <DollarSign className="h-4 w-4 mr-2" />
            Counter Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(managedAgents as any)?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(managedAgents as ManagedAgent[])?.reduce((acc: number, agent: ManagedAgent) => acc + (agent.totalBookings || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(managedAgents as ManagedAgent[])?.reduce((acc: number, agent: ManagedAgent) => acc + (agent.revenue || 0), 0)?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((managedAgents as ManagedAgent[])?.reduce((acc: number, agent: ManagedAgent) => acc + (agent.rating || 0), 0) / ((managedAgents as any)?.length || 1))?.toFixed(1) || '0.0'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage agent assignments and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Enter Booking ID for auto-assignment"
                    className="mb-2"
                    id="booking-id-input"
                  />
                  <Button 
                    onClick={() => {
                      const input = document.getElementById('booking-id-input') as HTMLInputElement;
                      const bookingId = parseInt(input.value);
                      if (bookingId) {
                        autoAssignMutation.mutate(bookingId);
                        input.value = '';
                      }
                    }}
                    disabled={autoAssignMutation.isPending}
                    className="w-full"
                  >
                    Auto-Assign Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentsLoading ? (
              <div className="col-span-full text-center py-4">Loading agents...</div>
            ) : (managedAgents as any)?.length > 0 ? (
              (managedAgents as ManagedAgent[])?.map((agent: ManagedAgent) => (
                <Card 
                  key={agent.userId} 
                  className={`cursor-pointer transition-colors ${
                    selectedAgent === agent.userId ? 'border-purple-300 bg-purple-50 dark:bg-purple-950' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent.userId)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Agent #{agent.userId}</CardTitle>
                      <Badge variant={agent.isManaged ? "default" : "secondary"}>
                        {agent.isManaged ? "Managed" : "Independent"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Base Rate: ${agent.basePrice} • Commission: {getCommissionRate(agent)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.services?.slice(0, 3).map((service: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {agent.services?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Bookings</p>
                          <p className="font-medium">{agent.totalBookings || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <p className="font-medium">{agent.rating || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-muted-foreground">
                No agents available
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {selectedAgent ? (
            <Card>
              <CardHeader>
                <CardTitle>Agent #{selectedAgent} Metrics</CardTitle>
                <CardDescription>
                  Performance analytics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="text-center py-4">Loading metrics...</div>
                ) : (agentMetrics as any)?.totalBookings !== undefined ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{(agentMetrics as any)?.totalBookings || 0}</div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${(agentMetrics as any)?.totalRevenue?.toLocaleString() || '0'}</div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{(agentMetrics as any)?.averageRating?.toFixed(1) || '0.0'}</div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{(agentMetrics as any)?.completionRate?.toFixed(0) || '0'}%</div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{(agentMetrics as any)?.responseTime || '0'}h</div>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-teal-600">{(agentMetrics as any)?.clientSatisfaction?.toFixed(0) || '0'}%</div>
                      <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No metrics available for this agent
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select an agent to view detailed metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="counter-offers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Counter Offer</CardTitle>
                <CardDescription>
                  Submit a counter offer for a booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCounterOfferSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Booking ID</label>
                    <Input
                      type="number"
                      value={counterOfferForm.bookingId}
                      onChange={(e) => setCounterOfferForm(prev => ({ ...prev, bookingId: e.target.value }))}
                      placeholder="Enter booking ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Counter Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={counterOfferForm.counterPrice}
                      onChange={(e) => setCounterOfferForm(prev => ({ ...prev, counterPrice: e.target.value }))}
                      placeholder="Enter counter offer price"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={counterOfferForm.notes}
                      onChange={(e) => setCounterOfferForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Explain the counter offer..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createCounterOfferMutation.isPending || !selectedAgent}
                    className="w-full"
                  >
                    {createCounterOfferMutation.isPending ? 'Submitting...' : 'Submit Counter Offer'}
                  </Button>
                  
                  {!selectedAgent && (
                    <p className="text-sm text-muted-foreground">Select an agent first</p>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Counter Offers</CardTitle>
                <CardDescription>
                  Track status of submitted counter offers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {offersLoading ? (
                  <div className="text-center py-4">Loading offers...</div>
                ) : (counterOffers as any)?.length > 0 ? (
                  <div className="space-y-3">
                    {(counterOffers as CounterOffer[]).map((offer: CounterOffer) => (
                      <div key={offer.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Booking #{offer.bookingId}</span>
                          <Badge className={getStatusColor(offer.status)} variant="secondary">
                            {offer.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Counter Price: ${offer.counterPrice}</p>
                          <p>Original: ${offer.originalPrice}</p>
                          {offer.notes && <p>Notes: {offer.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No counter offers submitted yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};