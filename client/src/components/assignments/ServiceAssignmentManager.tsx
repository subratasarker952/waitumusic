import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

// Icons
import { Briefcase, Plus, Trash2, DollarSign, UserCheck, Settings } from 'lucide-react';
import NewServiceCreationModal from '@/components/NewServiceCreationModal';

export default function ServiceAssignmentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedTalentId, setSelectedTalentId] = useState<string>('');
  const [talentPrice, setTalentPrice] = useState<string>('');
  const [isWaituService, setIsWaituService] = useState<boolean>(false);
  const [showNewServiceModal, setShowNewServiceModal] = useState<boolean>(false);

  // Fetch data
  const { data: services } = useQuery({
    queryKey: ['/api/services/all']
  });

  const { data: managedTalent } = useQuery({
    queryKey: ['/api/users/managed'],
    enabled: !isWaituService
  });

  const { data: serviceAssignments, isLoading } = useQuery({
    queryKey: ['/api/assignments/service']
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignment: any) => {
      return apiRequest('POST', '/api/assignments/service', assignment);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Service assignment created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/service'] });
      setSelectedServiceId('');
      setSelectedTalentId('');
      setTalentPrice('');
      setIsWaituService(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create service assignment",
        variant: "destructive"
      });
    }
  });

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return apiRequest('DELETE', `/api/assignments/service/${assignmentId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Service assignment removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/service'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to remove service assignment",
        variant: "destructive"
      });
    }
  });

  // Create Wai'tuMusic service mutation
  const createWaituServiceMutation = useMutation({
    mutationFn: async (service: any) => {
      return apiRequest('POST', '/api/services/waitumusic', service);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Wai'tuMusic service created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/services/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/service'] });
      setSelectedServiceId('');
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create Wai'tuMusic service",
        variant: "destructive"
      });
    }
  });

  const handleCreateAssignment = () => {
    if (!selectedServiceId) {
      toast({
        title: "Missing Information",
        description: "Please select a service",
        variant: "destructive"
      });
      return;
    }

    if (isWaituService) {
      // Create a Wai'tuMusic service (no user assigned)
      const selectedService = services?.find((s: any) => s.id.toString() === selectedServiceId);
      if (selectedService) {
        createWaituServiceMutation.mutate({
          serviceId: parseInt(selectedServiceId),
          serviceName: selectedService.name,
          isWaituService: true
        });
      }
    } else {
      // Create assignment with managed talent
      if (!selectedTalentId || !talentPrice) {
        toast({
          title: "Missing Information",
          description: "Please select talent and set their price",
          variant: "destructive"
        });
        return;
      }

      createAssignmentMutation.mutate({
        serviceId: parseInt(selectedServiceId),
        assignedTalentId: parseInt(selectedTalentId),
        talentPrice: parseFloat(talentPrice),
        isWaituService: false
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading service assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Assign Service or Create Wai'tuMusic Service
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign managed talent to services with custom pricing, or create Wai'tuMusic services
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="waitu-service"
              checked={isWaituService}
              onCheckedChange={setIsWaituService}
            />
            <label htmlFor="waitu-service" className="text-sm font-medium">
              Create Wai'tuMusic Service (no user assigned)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Select Service</label>
              <div className="flex gap-2">
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service: any) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - ${service.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewServiceModal(true)}
                  className="whitespace-nowrap"
                >
                  Create New
                </Button>
              </div>
            </div>

            {!isWaituService && (
              <>
                <div>
                  <label className="text-sm font-medium">Assign Managed Talent</label>
                  <Select value={selectedTalentId} onValueChange={setSelectedTalentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose talent" />
                    </SelectTrigger>
                    <SelectContent>
                      {managedTalent?.map((talent: any) => (
                        <SelectItem key={talent.id} value={talent.id.toString()}>
                          {talent.fullName} ({talent.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Talent Price ($)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={talentPrice}
                    onChange={(e) => setTalentPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be added to the total service price
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCreateAssignment}
              disabled={createAssignmentMutation.isPending || createWaituServiceMutation.isPending}
              className="w-full md:w-auto"
            >
              {isWaituService ? (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Create Wai'tuMusic Service
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign Talent to Service
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2" />
            Current Service Assignments ({serviceAssignments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviceAssignments?.length > 0 ? (
            <div className="space-y-3">
              {serviceAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{assignment.serviceName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {assignment.isWaituService ? (
                          <>
                            <Settings className="w-3 h-3" />
                            <span>Wai'tuMusic Service</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>{assignment.assignedTalentName}</span>
                            <span>•</span>
                            <DollarSign className="w-3 h-3" />
                            <span>${assignment.talentPrice}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={assignment.isWaituService ? "default" : "outline"}>
                      {assignment.isWaituService ? "Wai'tuMusic" : "Talent Assigned"}
                    </Badge>
                    <Button
                      onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                      disabled={removeAssignmentMutation.isPending}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No service assignments found</p>
              <p className="text-sm">Assign talent to services or create Wai'tuMusic services</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Service Creation Modal */}
      <NewServiceCreationModal 
        open={showNewServiceModal} 
        onOpenChange={setShowNewServiceModal} 
      />
    </div>
  );
}