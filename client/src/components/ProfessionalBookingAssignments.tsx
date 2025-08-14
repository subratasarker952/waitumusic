import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Camera, Video, Users, Megaphone, Music, Mic, CheckCircle, Clock, X } from "lucide-react";

interface ProfessionalAssignment {
  id: number;
  professionalUserId: number;
  professionalType: string;
  assignedRate: string;
  isIncludedInTotal: boolean;
  assignmentStatus: string;
  equipmentSpecs: any;
  proposalDocument?: string;
  checklistItems?: string[];
  technicalGuidance?: any;
  professional?: {
    id: number;
    email: string;
    role: string;
  };
  oppHubGuidance?: any;
}

interface ProfessionalBookingAssignmentsProps {
  bookingId: number;
  onAssignmentUpdate?: () => void;
}

const professionalTypeIcons = {
  photographer: Camera,
  videographer: Video,
  dj: Music,
  social_media_marketer: Megaphone,
  marketing_specialist: Users,
  background_vocalist: Mic
};

const professionalTypeLabels = {
  photographer: "Photographer",
  videographer: "Videographer", 
  dj: "DJ",
  social_media_marketer: "Social Media Marketer",
  marketing_specialist: "Marketing Specialist",
  background_vocalist: "Background Vocalist"
};

const statusColors = {
  assigned: "blue",
  accepted: "green",
  declined: "red",
  completed: "purple"
};

export function ProfessionalBookingAssignments({ bookingId, onAssignmentUpdate }: ProfessionalBookingAssignmentsProps) {
  const [assignments, setAssignments] = useState<ProfessionalAssignment[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedGuidance, setSelectedGuidance] = useState<any>(null);
  const { toast } = useToast();

  // Assignment form state
  const [newAssignment, setNewAssignment] = useState({
    professionalUserId: '',
    professionalType: '',
    assignedRate: '',
    equipmentSpecs: {},
    proposalDocument: ''
  });

  useEffect(() => {
    loadAssignments();
  }, [bookingId]);

  const loadAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/professionals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
        setTotalCost(data.totalCost || 0);
      }
    } catch (error) {
      console.error('Error loading professional assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load professional assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/professionals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newAssignment,
          assignedRate: parseFloat(newAssignment.assignedRate)
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message,
          variant: "default"
        });
        
        setShowAssignModal(false);
        setNewAssignment({
          professionalUserId: '',
          professionalType: '',
          assignedRate: '',
          equipmentSpecs: {},
          proposalDocument: ''
        });
        
        loadAssignments();
        onAssignmentUpdate?.();
      } else {
        throw new Error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign professional",
        variant: "destructive"
      });
    }
  };

  const updateAssignmentStatus = async (assignmentId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/professional-assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignmentStatus: status })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment status updated",
          variant: "default"
        });
        loadAssignments();
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive"
      });
    }
  };

  const viewGuidance = async (assignmentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/professional-assignments/${assignmentId}/guidance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const guidance = await response.json();
        setSelectedGuidance(guidance);
      }
    } catch (error) {
      console.error('Error loading guidance:', error);
      toast({
        title: "Error", 
        description: "Failed to load professional guidance",
        variant: "destructive"
      });
    }
  };

  const regenerateGuidance = async (assignmentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/professional-assignments/${assignmentId}/regenerate-guidance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message,
          variant: "default"
        });
        loadAssignments();
      }
    } catch (error) {
      console.error('Error regenerating guidance:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate guidance", 
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Professional Assignments
          </CardTitle>
          <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
            <DialogTrigger asChild>
              <Button>Assign Professional</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Professional to Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Professional Type</label>
                  <Select
                    value={newAssignment.professionalType}
                    onValueChange={(value) => setNewAssignment({...newAssignment, professionalType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select professional type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(professionalTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Professional User ID</label>
                  <Input
                    type="number"
                    value={newAssignment.professionalUserId}
                    onChange={(e) => setNewAssignment({...newAssignment, professionalUserId: e.target.value})}
                    placeholder="Enter user ID"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Assigned Rate ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newAssignment.assignedRate}
                    onChange={(e) => setNewAssignment({...newAssignment, assignedRate: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Proposal Document (Optional)</label>
                  <Textarea
                    value={newAssignment.proposalDocument}
                    onChange={(e) => setNewAssignment({...newAssignment, proposalDocument: e.target.value})}
                    placeholder="Proposal details or document URL"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={createAssignment} className="flex-1">
                    Assign Professional
                  </Button>
                  <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No professional assignments yet</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const Icon = professionalTypeIcons[assignment.professionalType as keyof typeof professionalTypeIcons] || Users;
                const statusColor = statusColors[assignment.assignmentStatus as keyof typeof statusColors] || "gray";
                
                return (
                  <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">
                              {professionalTypeLabels[assignment.professionalType as keyof typeof professionalTypeLabels]}
                            </h4>
                            <p className="text-sm text-gray-600">
                              User ID: {assignment.professionalUserId} • ${assignment.assignedRate}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" style={{ color: statusColor }}>
                          {assignment.assignmentStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {assignment.assignmentStatus === 'assigned' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAssignmentStatus(assignment.id, 'accepted')}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAssignmentStatus(assignment.id, 'declined')}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {assignment.oppHubGuidance && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewGuidance(assignment.id)}
                          >
                            View Technical Guidance
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateGuidance(assignment.id)}
                        >
                          Regenerate Guidance
                        </Button>
                      </div>
                      
                      {assignment.checklistItems && assignment.checklistItems.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium text-sm mb-2">Checklist Items:</h5>
                          <div className="space-y-1">
                            {assignment.checklistItems.slice(0, 3).map((item, index) => (
                              <p key={index} className="text-xs text-gray-600">• {item}</p>
                            ))}
                            {assignment.checklistItems.length > 3 && (
                              <p className="text-xs text-gray-500">
                                ...and {assignment.checklistItems.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Professional Costs:</span>
                  <span className="text-lg font-bold text-green-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Guidance Modal */}
      {selectedGuidance && (
        <Dialog open={!!selectedGuidance} onOpenChange={() => setSelectedGuidance(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>OppHub Professional Guidance</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedGuidance.technicalRequirements && (
                <div>
                  <h3 className="font-semibold mb-2">Technical Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded space-y-2">
                    {Object.entries(selectedGuidance.technicalRequirements).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                        <span className="text-gray-700">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedGuidance.creativeGuidance && (
                <div>
                  <h3 className="font-semibold mb-2">Creative Guidance</h3>
                  <div className="bg-blue-50 p-4 rounded space-y-2">
                    {Object.entries(selectedGuidance.creativeGuidance).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                        <span className="text-gray-700">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedGuidance.opportunityProjections && (
                <div>
                  <h3 className="font-semibold mb-2">Opportunity Projections</h3>
                  <div className="bg-green-50 p-4 rounded space-y-2">
                    {Object.entries(selectedGuidance.opportunityProjections).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                        <div className="ml-4">
                          {Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {value.map((item, index) => (
                                <li key={index} className="text-sm text-gray-700">{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-700">{String(value)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setSelectedGuidance(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ProfessionalBookingAssignments;