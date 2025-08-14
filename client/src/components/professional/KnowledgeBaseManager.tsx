import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Plus, 
  Search, 
  FileText, 
  Video, 
  Download,
  Edit,
  Trash2,
  Eye,
  Tag,
  Clock,
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface KnowledgeBaseManagerProps {
  user: any;
}

export default function KnowledgeBaseManager({ user }: KnowledgeBaseManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: '',
    category: '',
    content: '',
    description: '',
    tags: '',
    isPublic: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge base resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/knowledge-base', user.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/knowledge-base?professionalId=${user.id}`);
      return await response.json();
    },
  });

  // Create resource mutation
  const createResourceMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      const response = await apiRequest('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resourceData, professionalId: user.id })
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Resource Created",
        description: "Knowledge base resource has been created successfully.",
      });
    },
  });

  // Update resource mutation
  const updateResourceMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      const response = await apiRequest(`/api/knowledge-base/${resourceData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base'] });
      setSelectedResource(null);
      resetForm();
      toast({
        title: "Resource Updated",
        description: "Knowledge base resource has been updated.",
      });
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      const response = await apiRequest(`/api/knowledge-base/${resourceId}`, {
        method: 'DELETE'
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base'] });
      toast({
        title: "Resource Deleted",
        description: "Knowledge base resource has been deleted.",
      });
    },
  });

  const resetForm = () => {
    setResourceForm({
      title: '',
      type: '',
      category: '',
      content: '',
      description: '',
      tags: '',
      isPublic: true
    });
  };

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const resourceData = {
      ...resourceForm,
      tags: resourceForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (selectedResource) {
      updateResourceMutation.mutate({ ...resourceData, id: selectedResource.id });
    } else {
      createResourceMutation.mutate(resourceData);
    }
  };

  const handleEditResource = (resource: any) => {
    setSelectedResource(resource);
    setResourceForm({
      title: resource.title,
      type: resource.type,
      category: resource.category,
      content: resource.content,
      description: resource.description || '',
      tags: resource.tags ? resource.tags.join(', ') : '',
      isPublic: resource.isPublic
    });
    setIsCreateModalOpen(true);
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'template': return <Download className="h-4 w-4" />;
      case 'guide': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'template': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'guide': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const knowledgeBaseResources = resources || [
    {
      id: 1,
      title: "Complete Guide to Music Production",
      type: "guide",
      category: "Production",
      description: "Comprehensive guide covering all aspects of music production from recording to mastering.",
      tags: ["music", "production", "recording", "mastering"],
      isPublic: true,
      createdAt: "2024-01-15",
      views: 245,
      downloads: 89
    },
    {
      id: 2,
      title: "Artist Branding Template",
      type: "template",
      category: "Marketing",
      description: "Professional template for developing artist brand identity and visual guidelines.",
      tags: ["branding", "marketing", "template", "visual"],
      isPublic: true,
      createdAt: "2024-01-20",
      views: 156,
      downloads: 67
    },
    {
      id: 3,
      title: "Recording Session Best Practices",
      type: "article",
      category: "Production",
      description: "Essential tips and techniques for running efficient and productive recording sessions.",
      tags: ["recording", "studio", "workflow", "efficiency"],
      isPublic: false,
      createdAt: "2024-02-01",
      views: 89,
      downloads: 12
    }
  ];

  const categories = ['all', 'Production', 'Marketing', 'Business', 'Technical', 'Legal'];

  const filteredResources = knowledgeBaseResources.filter((resource: any) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage your professional resources and client materials</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    placeholder="Resource title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={resourceForm.type} onValueChange={(value) => setResourceForm({ ...resourceForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={resourceForm.category} onValueChange={(value) => setResourceForm({ ...resourceForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={resourceForm.tags}
                    onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })}
                    placeholder="music, production, recording"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  placeholder="Brief description of the resource"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={resourceForm.content}
                  onChange={(e) => setResourceForm({ ...resourceForm, content: e.target.value })}
                  placeholder="Full content of the resource"
                  rows={8}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={resourceForm.isPublic}
                  onChange={(e) => setResourceForm({ ...resourceForm, isPublic: e.target.checked })}
                />
                <Label htmlFor="isPublic">Make this resource publicly accessible to clients</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedResource(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createResourceMutation.isPending || updateResourceMutation.isPending}>
                  {selectedResource ? 'Update' : 'Create'} Resource
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource: any) => (
          <Card key={resource.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getResourceTypeIcon(resource.type)}
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditResource(resource)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteResourceMutation.mutate(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getResourceTypeColor(resource.type)}>
                  {resource.type}
                </Badge>
                <Badge variant={resource.isPublic ? "default" : "secondary"}>
                  {resource.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {resource.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{resource.tags.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {resource.views} views
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {resource.downloads} downloads
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                Created {new Date(resource.createdAt).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'No Resources Found' : 'No Resources Yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start building your knowledge base with helpful resources for your clients'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Resource
            </Button>
          )}
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {knowledgeBaseResources.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Resources</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {knowledgeBaseResources.filter((r: any) => r.isPublic).length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Public Resources</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {knowledgeBaseResources.reduce((sum: number, r: any) => sum + r.views, 0)}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Total Views</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {knowledgeBaseResources.reduce((sum: number, r: any) => sum + r.downloads, 0)}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Total Downloads</div>
        </Card>
      </div>
    </div>
  );
}