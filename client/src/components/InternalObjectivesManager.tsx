/**
 * Internal Objectives Manager Component
 * Manages internal booking objectives for admin, superadmin, and managed talent
 * These objectives are hidden from bookers and used for internal planning
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Target, Plus, Calendar, User, DollarSign, Camera, Video, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InternalObjective {
  id: number;
  bookingId: number;
  objectiveType: 'marketing' | 'photography' | 'videography' | 'social_media' | 'revenue' | 'strategic';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetDeadline?: Date;
  assignedTo?: number;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  confidential: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  relatedProfessionals: number[];
}

interface ObjectiveTemplate {
  id: number;
  name: string;
  category: string;
  objectives: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedDuration: string;
  }>;
}

interface InternalObjectivesManagerProps {
  bookingId: number;
  userRole: string;
  userId: number;
  onObjectivesChange?: (objectives: InternalObjective[]) => void;
}

export default function InternalObjectivesManager({ 
  bookingId, 
  userRole, 
  userId, 
  onObjectivesChange 
}: InternalObjectivesManagerProps) {
  const [objectives, setObjectives] = useState<InternalObjective[]>([]);
  const [templates, setTemplates] = useState<ObjectiveTemplate[]>([]);
  const [showConfidential, setShowConfidential] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ObjectiveTemplate | null>(null);
  const [newObjective, setNewObjective] = useState({
    objectiveType: 'photography' as const,
    title: '',
    description: '',
    priority: 'medium' as const,
    targetDeadline: '',
    assignedTo: '',
    tags: ''
  });
  const { toast } = useToast();

  // Check if user has permission to access internal objectives
  const hasInternalAccess = ['superadmin', 'admin', 'managed_artist', 'managed_musician', 'managed_professional'].includes(userRole);

  useEffect(() => {
    if (hasInternalAccess) {
      loadInternalObjectives();
      loadObjectiveTemplates();
    }
  }, [bookingId, hasInternalAccess]);

  const loadInternalObjectives = async () => {
    try {
      // Mock data for demonstration - in real implementation, this would call the API
      const mockObjectives: InternalObjective[] = [
        {
          id: 1,
          bookingId,
          objectiveType: 'photography',
          title: 'Album Artwork Photography',
          description: 'Capture high-resolution images suitable for album artwork and promotional materials. Focus on artistic shots that reflect the artist\'s brand and music style.',
          priority: 'high',
          targetDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          assignedTo: 25,
          status: 'planning',
          confidential: true,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['album', 'artwork', 'promotional', 'brand'],
          relatedProfessionals: [25]
        },
        {
          id: 2,
          bookingId,
          objectiveType: 'social_media',
          title: 'Instagram/TikTok Content Creation',
          description: 'Generate social media content during the performance for Instagram Stories, TikTok videos, and Facebook posts. Focus on behind-the-scenes content and audience engagement moments.',
          priority: 'medium',
          targetDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          assignedTo: 26,
          status: 'planning',
          confidential: true,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['social_media', 'instagram', 'tiktok', 'engagement'],
          relatedProfessionals: [26]
        },
        {
          id: 3,
          bookingId,
          objectiveType: 'revenue',
          title: 'Merchandise Sales Opportunity',
          description: 'Set up merchandise booth during event to maximize revenue from physical product sales. Target $500+ in merchandise revenue.',
          priority: 'medium',
          status: 'planning',
          confidential: true,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['merchandise', 'revenue', 'sales'],
          relatedProfessionals: []
        }
      ];

      setObjectives(mockObjectives);
      onObjectivesChange?.(mockObjectives);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load internal objectives",
        variant: "destructive"
      });
    }
  };

  const loadObjectiveTemplates = async () => {
    const mockTemplates: ObjectiveTemplate[] = [
      {
        id: 1,
        name: 'Album Promotion Package',
        category: 'Marketing',
        objectives: [
          {
            title: 'Professional Photography',
            description: 'High-resolution album artwork and promotional photos',
            priority: 'high',
            estimatedDuration: '2-3 hours'
          },
          {
            title: 'Social Media Content',
            description: 'Instagram stories, TikTok videos, and Facebook posts',
            priority: 'high',
            estimatedDuration: 'Ongoing during event'
          }
        ]
      },
      {
        id: 2,
        name: 'Live Performance Documentation',
        category: 'Content Creation',
        objectives: [
          {
            title: 'Multi-Camera Recording',
            description: 'Professional multi-angle performance recording',
            priority: 'high',
            estimatedDuration: 'Full performance'
          },
          {
            title: 'Audience Interaction Capture',
            description: 'Document audience engagement and reactions',
            priority: 'medium',
            estimatedDuration: 'Throughout event'
          }
        ]
      }
    ];

    setTemplates(mockTemplates);
  };

  const handleCreateObjective = async () => {
    try {
      const objective: InternalObjective = {
        id: Date.now(),
        bookingId,
        objectiveType: newObjective.objectiveType,
        title: newObjective.title,
        description: newObjective.description,
        priority: newObjective.priority,
        targetDeadline: newObjective.targetDeadline ? new Date(newObjective.targetDeadline) : undefined,
        assignedTo: newObjective.assignedTo ? parseInt(newObjective.assignedTo) : undefined,
        status: 'planning',
        confidential: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: newObjective.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        relatedProfessionals: []
      };

      const updatedObjectives = [...objectives, objective];
      setObjectives(updatedObjectives);
      onObjectivesChange?.(updatedObjectives);

      setIsCreateModalOpen(false);
      setNewObjective({
        objectiveType: 'photography',
        title: '',
        description: '',
        priority: 'medium',
        targetDeadline: '',
        assignedTo: '',
        tags: ''
      });

      toast({
        title: "Success",
        description: "Internal objective created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create internal objective",
        variant: "destructive"
      });
    }
  };

  const handleUpdateObjectiveStatus = async (objectiveId: number, newStatus: InternalObjective['status']) => {
    try {
      const updatedObjectives = objectives.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, status: newStatus, updatedAt: new Date() }
          : obj
      );
      
      setObjectives(updatedObjectives);
      onObjectivesChange?.(updatedObjectives);

      toast({
        title: "Success",
        description: `Objective status updated to ${newStatus}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update objective status",
        variant: "destructive"
      });
    }
  };

  const useTemplate = (template: ObjectiveTemplate) => {
    const templateObjectives = template.objectives.map((obj, index) => ({
      id: Date.now() + index,
      bookingId,
      objectiveType: obj.title.toLowerCase().includes('photo') ? 'photography' as const :
                    obj.title.toLowerCase().includes('video') ? 'videography' as const :
                    obj.title.toLowerCase().includes('social') ? 'social_media' as const : 'marketing' as const,
      title: obj.title,
      description: obj.description,
      priority: obj.priority,
      status: 'planning' as const,
      confidential: true,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [template.category.toLowerCase()],
      relatedProfessionals: []
    }));

    const updatedObjectives = [...objectives, ...templateObjectives];
    setObjectives(updatedObjectives);
    onObjectivesChange?.(updatedObjectives);

    toast({
      title: "Success",
      description: `${template.name} objectives added successfully`
    });
  };

  const getObjectiveIcon = (type: InternalObjective['objectiveType']) => {
    switch (type) {
      case 'photography': return <Camera className="w-4 h-4" />;
      case 'videography': return <Video className="w-4 h-4" />;
      case 'social_media': return <Users className="w-4 h-4" />;
      case 'marketing': return <TrendingUp className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      case 'strategic': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: InternalObjective['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasInternalAccess) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <EyeOff className="w-5 h-5 mr-2" />
            <span>Internal objectives are not visible to your role</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Internal Booking Objectives
              <Badge variant="secondary" className="ml-2">Confidential</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfidential(!showConfidential)}
              >
                {showConfidential ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showConfidential ? 'Hide' : 'Show'} Confidential
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Objective
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Internal Objective</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="objectiveType">Objective Type</Label>
                        <Select
                          value={newObjective.objectiveType}
                          onValueChange={(value: any) => setNewObjective(prev => ({ ...prev, objectiveType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="photography">Photography</SelectItem>
                            <SelectItem value="videography">Videography</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="strategic">Strategic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newObjective.priority}
                          onValueChange={(value: any) => setNewObjective(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newObjective.title}
                        onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter objective title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newObjective.description}
                        onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description of the objective"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="targetDeadline">Target Deadline</Label>
                        <Input
                          id="targetDeadline"
                          type="datetime-local"
                          value={newObjective.targetDeadline}
                          onChange={(e) => setNewObjective(prev => ({ ...prev, targetDeadline: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                          id="tags"
                          value={newObjective.tags}
                          onChange={(e) => setNewObjective(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="album, promotional, marketing"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateObjective}>
                        Create Objective
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="objectives" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="objectives">Current Objectives</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="objectives" className="space-y-4">
              {objectives.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4" />
                  <p>No internal objectives set for this booking</p>
                  <p className="text-sm">Create objectives to track internal goals and requirements</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {objectives.map((objective) => (
                    <Card key={objective.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getObjectiveIcon(objective.objectiveType)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{objective.title}</h4>
                                <Badge variant="outline" className={getPriorityColor(objective.priority)}>
                                  {objective.priority}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(objective.status)}>
                                  {objective.status.replace('_', ' ')}
                                </Badge>
                                {objective.confidential && (
                                  <Badge variant="secondary">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Confidential
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {objective.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {objective.targetDeadline && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {objective.targetDeadline.toLocaleDateString()}
                                  </div>
                                )}
                                {objective.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Assigned to User {objective.assignedTo}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  {objective.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={objective.status}
                              onValueChange={(value: any) => handleUpdateObjectiveStatus(objective.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {template.objectives.map((obj, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{obj.title}</div>
                            <div className="text-muted-foreground text-xs">{obj.description}</div>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => useTemplate(template)}
                        className="w-full"
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{objectives.length}</div>
                    <div className="text-sm text-muted-foreground">Total Objectives</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {objectives.filter(o => o.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {objectives.filter(o => o.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {objectives.filter(o => o.status === 'planning').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Planning</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Objective Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['photography', 'videography', 'social_media', 'marketing', 'revenue', 'strategic'].map(type => {
                      const count = objectives.filter(o => o.objectiveType === type).length;
                      const percentage = objectives.length > 0 ? (count / objectives.length) * 100 : 0;
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getObjectiveIcon(type as any)}
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}