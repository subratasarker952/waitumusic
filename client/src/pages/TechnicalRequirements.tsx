import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Check, Clock, Mic, Monitor, Lightbulb, Settings, Edit, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import RequirementEditModal from '@/components/modals/RequirementEditModal';

interface TechnicalRequirement {
  id: number;
  userId: number;
  requirementType: string;
  requirementName: string;
  specifications: string;
  isRequired: boolean;
  isDemo: boolean;
  createdAt: string;
}

export default function TechnicalRequirements() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<TechnicalRequirement | null>(null);

  const { data: requirements, isLoading, error } = useQuery<TechnicalRequirement[]>({
    queryKey: ['/api/users', user?.id, 'technical-requirements'],
    enabled: !!user?.id,
  });

  const handleBack = () => {
    setLocation('/dashboard?tab=profile');
  };

  const handleEdit = (requirement: TechnicalRequirement) => {
    setSelectedRequirement(requirement);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedRequirement(null);
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'equipment':
        return <Mic className="h-4 w-4" />;
      case 'stage_setup':
        return <Monitor className="h-4 w-4" />;
      case 'lighting':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Requirements</CardTitle>
            <CardDescription>
              Unable to load your technical requirements. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Technical Requirements</h1>
            <p className="text-muted-foreground">
              Manage your performance equipment and technical needs
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      <div className="grid gap-4">
        {requirements && requirements.length > 0 ? (
          requirements.map((requirement) => (
            <Card key={requirement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getRequirementIcon(requirement.requirementType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{requirement.requirementName}</CardTitle>
                      <CardDescription className="capitalize">
                        {requirement.requirementType.replace('_', ' ')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {requirement.isRequired ? (
                      <Badge variant="destructive">
                        <Check className="h-3 w-3 mr-1" />
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Optional
                      </Badge>
                    )}
                    {requirement.isDemo && (
                      <Badge variant="outline">Demo Data</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {requirement.specifications}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(requirement)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                  <Button variant="outline" size="sm">
                    Generate Rider
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Requirements Set</CardTitle>
              <CardDescription>
                You haven't set any technical requirements yet. Click "Add Requirement" to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      {selectedRequirement && (
        <RequirementEditModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          requirement={selectedRequirement}
          userId={user?.id || 0}
          requirementType="technical"
        />
      )}
    </div>
  );
}