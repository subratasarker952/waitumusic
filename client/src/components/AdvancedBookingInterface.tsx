import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { FileText, CheckCircle, Clock, AlertCircle, Users, Calendar, DollarSign } from 'lucide-react';

const technicalRiderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  equipmentNeeds: z.string().min(5, "Equipment needs are required"),
  stageRequirements: z.string().min(5, "Stage requirements are required"),
  lightingRequirements: z.string().optional(),
  soundRequirements: z.string().optional(),
  additionalNotes: z.string().optional(),
});

interface TechnicalRiderFormData {
  title: string;
  requirements: string;
  equipmentNeeds: string;
  stageRequirements: string;
  lightingRequirements?: string;
  soundRequirements?: string;
  additionalNotes?: string;
}

interface BookingApproval {
  id: number;
  bookingId: number;
  step: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  approvedBy?: number;
}

interface ManagedAgent {
  userId: number;
  services: string[];
  basePrice: string;
  isManaged: boolean;
  specializations: string[];
}

export const AdvancedBookingInterface: React.FC<{ bookingId?: number }> = ({ bookingId }) => {
  const [activeTab, setActiveTab] = useState('technical-rider');
  const queryClient = useQueryClient();

  // Technical Rider Form
  const technicalRiderForm = useForm<TechnicalRiderFormData>({
    resolver: zodResolver(technicalRiderSchema),
    defaultValues: {
      title: '',
      requirements: '',
      equipmentNeeds: '',
      stageRequirements: '',
      lightingRequirements: '',
      soundRequirements: '',
      additionalNotes: '',
    },
  });

  // Queries
  const { data: approvals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['/api/advanced-booking/bookings/pending-approvals'],
    enabled: !!bookingId,
  });

  const { data: managedAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/advanced-booking/managed-agents'],
  });

  const { data: approvalStatus } = useQuery({
    queryKey: ['/api/advanced-booking/bookings', bookingId, 'approval-status'],
    enabled: !!bookingId,
  });

  // Mutations
  const createTechnicalRiderMutation = useMutation({
    mutationFn: async (data: TechnicalRiderFormData) => {
      if (!bookingId) throw new Error('Booking ID is required');
      return apiRequest(`/api/advanced-booking/bookings/${bookingId}/technical-rider`, {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advanced-booking/bookings'] });
      technicalRiderForm.reset();
    },
  });

  const processApprovalMutation = useMutation({
    mutationFn: async ({ step, action, notes }: { step: string; action: 'approve' | 'reject'; notes?: string }) => {
      if (!bookingId) throw new Error('Booking ID is required');
      return apiRequest(`/api/advanced-booking/bookings/${bookingId}/approval/${step}`, {
        method: 'POST',
        body: { action, notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advanced-booking/bookings'] });
    },
  });

  const autoAssignAgentMutation = useMutation({
    mutationFn: async () => {
      if (!bookingId) throw new Error('Booking ID is required');
      return apiRequest(`/api/advanced-booking/bookings/${bookingId}/auto-assign-agent`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advanced-booking/managed-agents'] });
    },
  });

  const onSubmitTechnicalRider = (data: TechnicalRiderFormData) => {
    createTechnicalRiderMutation.mutate(data);
  };

  const handleApproval = (step: string, action: 'approve' | 'reject', notes?: string) => {
    processApprovalMutation.mutate({ step, action, notes });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Booking Management</h2>
        {bookingId && (
          <Badge variant="outline" className="px-3 py-1">
            Booking #{bookingId}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical-rider">
            <FileText className="h-4 w-4 mr-2" />
            Technical Rider
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Users className="h-4 w-4 mr-2" />
            Managed Agents
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <Calendar className="h-4 w-4 mr-2" />
            Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical-rider" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Technical Rider</CardTitle>
              <CardDescription>
                Define technical requirements for this booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...technicalRiderForm}>
                <form onSubmit={technicalRiderForm.handleSubmit(onSubmitTechnicalRider)} className="space-y-4">
                  <FormField
                    control={technicalRiderForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rider Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Main Stage Performance Setup" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={technicalRiderForm.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe overall technical requirements..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={technicalRiderForm.control}
                      name="equipmentNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipment Needs</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List required equipment..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={technicalRiderForm.control}
                      name="stageRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stage Requirements</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Stage setup requirements..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={technicalRiderForm.control}
                      name="lightingRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lighting Requirements</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Lighting setup details..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={technicalRiderForm.control}
                      name="soundRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sound Requirements</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Sound system requirements..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={technicalRiderForm.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional requirements or notes..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={createTechnicalRiderMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {createTechnicalRiderMutation.isPending ? 'Creating...' : 'Create Technical Rider'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Manage booking approval steps and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <div className="text-center py-4">Loading approvals...</div>
              ) : (approvals as any)?.length > 0 ? (
                <div className="space-y-3">
                  {(approvals as BookingApproval[])?.map((approval: BookingApproval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(approval.status)}
                        <div>
                          <p className="font-medium">{approval.step}</p>
                          {approval.notes && (
                            <p className="text-sm text-muted-foreground">{approval.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {approval.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproval(approval.step, 'approve')}
                              disabled={processApprovalMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproval(approval.step, 'reject')}
                              disabled={processApprovalMutation.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No approvals found for this booking
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Managed Agents</CardTitle>
              <CardDescription>
                Assign and manage agents for this booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Available Agents</h3>
                {bookingId && (
                  <Button
                    onClick={() => autoAssignAgentMutation.mutate()}
                    disabled={autoAssignAgentMutation.isPending}
                  >
                    Auto-Assign Agent
                  </Button>
                )}
              </div>

              {agentsLoading ? (
                <div className="text-center py-4">Loading agents...</div>
              ) : (managedAgents as any)?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(managedAgents as ManagedAgent[])?.map((agent: ManagedAgent) => (
                    <Card key={agent.userId} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={agent.isManaged ? "default" : "secondary"}>
                            {agent.isManaged ? "Managed" : "Independent"}
                          </Badge>
                          <span className="font-medium">Agent #{agent.userId}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${agent.basePrice}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Services:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {agent.services?.map((service: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {agent.specializations?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Specializations:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.specializations.map((spec: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No managed agents available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Workflow Status</CardTitle>
              <CardDescription>
                Track the progress of this booking through the workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(approvalStatus as any)?.workflow ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="font-medium">Initial Review</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="font-medium">Technical Review</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">Final Approval</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No workflow data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};