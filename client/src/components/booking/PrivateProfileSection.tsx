import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TechnicalRequirement {
  id: string;
  category: string; // Equipment, Stage, Lighting, Sound
  item: string;
  specifications: string;
  priority: 'essential' | 'preferred' | 'optional';
}

interface HospitalityRequirement {
  id: string;
  category: string; // Catering, Accommodation, Transportation, Other
  item: string;
  details: string;
  priority: 'essential' | 'preferred' | 'optional';
}

interface PerformanceSpec {
  id: string;
  category: string; // Set Duration, Breaks, Setup Time, Other
  specification: string;
  value: string;
  notes: string;
}

interface PrivateProfileSectionProps {
  userId: number;
  userRole: string;
  isOwner: boolean;
  isAuthorized: boolean; // Can see private sections
}

export default function PrivateProfileSection({ userId, userRole, isOwner, isAuthorized }: PrivateProfileSectionProps) {
  const { toast } = useToast();
  const [technicalRequirements, setTechnicalRequirements] = useState<TechnicalRequirement[]>([]);
  const [hospitalityRequirements, setHospitalityRequirements] = useState<HospitalityRequirement[]>([]);
  const [performanceSpecs, setPerformanceSpecs] = useState<PerformanceSpec[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Only show to authorized users (superadmin, assigned admin, or the user themselves)
  if (!isAuthorized) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Private profile sections are only visible to assigned administrators and the user.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAddTechnical = () => {
    const newReq: TechnicalRequirement = {
      id: Date.now().toString(),
      category: 'Equipment',
      item: '',
      specifications: '',
      priority: 'essential'
    };
    setTechnicalRequirements([...technicalRequirements, newReq]);
  };

  const handleAddHospitality = () => {
    const newReq: HospitalityRequirement = {
      id: Date.now().toString(),
      category: 'Catering',
      item: '',
      details: '',
      priority: 'essential'
    };
    setHospitalityRequirements([...hospitalityRequirements, newReq]);
  };

  const handleAddPerformanceSpec = () => {
    const newSpec: PerformanceSpec = {
      id: Date.now().toString(),
      category: 'Set Duration',
      specification: '',
      value: '',
      notes: ''
    };
    setPerformanceSpecs([...performanceSpecs, newSpec]);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await apiRequest(`/api/users/${userId}/private-profile`, {
        method: 'PUT',
        body: JSON.stringify({
          technicalRequirements,
          hospitalityRequirements,
          performanceSpecs
        })
      });

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Private profile sections have been saved successfully."
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800';
      case 'preferred': return 'bg-yellow-100 text-yellow-800';
      case 'optional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Private Profile Sections</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Technical and hospitality requirements used for contract generation
          </p>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
            <h4 className="font-semibold text-amber-800 mb-1">Instructions:</h4>
            <p className="text-sm text-amber-700">
              Click "Edit" to add technical equipment, hospitality needs, and performance specifications. 
              These details will automatically populate in contract generation and technical riders.
            </p>
          </div>
        </div>
        {isOwner && (
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        )}
      </div>

      {/* Technical Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Technical Requirements</span>
            {isEditing && (
              <Button size="sm" onClick={handleAddTechnical}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {technicalRequirements.length === 0 ? (
            <p className="text-muted-foreground">No technical requirements specified.</p>
          ) : (
            <div className="space-y-4">
              {technicalRequirements.map((req) => (
                <div key={req.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{req.category}</Badge>
                      <Badge className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTechnicalRequirements(
                          technicalRequirements.filter(r => r.id !== req.id)
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Item/Equipment"
                        value={req.item}
                        onChange={(e) => setTechnicalRequirements(
                          technicalRequirements.map(r => 
                            r.id === req.id ? { ...r, item: e.target.value } : r
                          )
                        )}
                      />
                      <Textarea
                        placeholder="Specifications and details"
                        value={req.specifications}
                        onChange={(e) => setTechnicalRequirements(
                          technicalRequirements.map(r => 
                            r.id === req.id ? { ...r, specifications: e.target.value } : r
                          )
                        )}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{req.item}</p>
                      <p className="text-sm text-muted-foreground">{req.specifications}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospitality Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hospitality Requirements</span>
            {isEditing && (
              <Button size="sm" onClick={handleAddHospitality}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hospitalityRequirements.length === 0 ? (
            <p className="text-muted-foreground">No hospitality requirements specified.</p>
          ) : (
            <div className="space-y-4">
              {hospitalityRequirements.map((req) => (
                <div key={req.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{req.category}</Badge>
                      <Badge className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setHospitalityRequirements(
                          hospitalityRequirements.filter(r => r.id !== req.id)
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Hospitality item"
                        value={req.item}
                        onChange={(e) => setHospitalityRequirements(
                          hospitalityRequirements.map(r => 
                            r.id === req.id ? { ...r, item: e.target.value } : r
                          )
                        )}
                      />
                      <Textarea
                        placeholder="Details and requirements"
                        value={req.details}
                        onChange={(e) => setHospitalityRequirements(
                          hospitalityRequirements.map(r => 
                            r.id === req.id ? { ...r, details: e.target.value } : r
                          )
                        )}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{req.item}</p>
                      <p className="text-sm text-muted-foreground">{req.details}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Specifications</span>
            {isEditing && (
              <Button size="sm" onClick={handleAddPerformanceSpec}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceSpecs.length === 0 ? (
            <p className="text-muted-foreground">No performance specifications defined.</p>
          ) : (
            <div className="space-y-4">
              {performanceSpecs.map((spec) => (
                <div key={spec.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{spec.category}</Badge>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPerformanceSpecs(
                          performanceSpecs.filter(s => s.id !== spec.id)
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Specification"
                        value={spec.specification}
                        onChange={(e) => setPerformanceSpecs(
                          performanceSpecs.map(s => 
                            s.id === spec.id ? { ...s, specification: e.target.value } : s
                          )
                        )}
                      />
                      <Input
                        placeholder="Value"
                        value={spec.value}
                        onChange={(e) => setPerformanceSpecs(
                          performanceSpecs.map(s => 
                            s.id === spec.id ? { ...s, value: e.target.value } : s
                          )
                        )}
                      />
                      <Textarea
                        placeholder="Additional notes"
                        value={spec.notes}
                        onChange={(e) => setPerformanceSpecs(
                          performanceSpecs.map(s => 
                            s.id === spec.id ? { ...s, notes: e.target.value } : s
                          )
                        )}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{spec.specification}: {spec.value}</p>
                      {spec.notes && (
                        <p className="text-sm text-muted-foreground">{spec.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}