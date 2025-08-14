import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Save, X, Trash2, FileText, ExternalLink, Search } from 'lucide-react';

interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  type: 'article' | 'guide' | 'faq' | 'link';
  url?: string;
  lastUpdated: string;
}

interface KnowledgeBaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KnowledgeBaseModal({ open, onOpenChange }: KnowledgeBaseModalProps) {
  const { toast } = useToast();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    type: 'article' as 'article' | 'guide' | 'faq' | 'link',
    url: '',
    tags: [] as string[]
  });

  const categories = [
    'Industry Knowledge',
    'Performance Tips',
    'Recording Techniques', 
    'Business Development',
    'Marketing & Promotion',
    'Legal & Contracts',
    'Equipment & Gear',
    'Software & Tools'
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags: tags
    }));
  };

  const handleAddItem = () => {
    if (!formData.title || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and category.",
        variant: "destructive",
      });
      return;
    }

    const newItem: KnowledgeBaseItem = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      content: formData.content,
      type: formData.type,
      url: formData.url,
      tags: formData.tags,
      lastUpdated: new Date().toISOString()
    };

    setKnowledgeBase(prev => [...prev, newItem]);
    setFormData({
      title: '',
      category: '',
      content: '',
      type: 'article',
      url: '',
      tags: []
    });
    setShowAddForm(false);
    
    toast({
      title: "Resource Added",
      description: "Knowledge base resource has been added successfully.",
    });
  };

  const handleEditItem = (item: KnowledgeBaseItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      type: item.type,
      url: item.url || '',
      tags: item.tags
    });
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const updatedItem: KnowledgeBaseItem = {
      ...editingItem,
      title: formData.title,
      category: formData.category,
      content: formData.content,
      type: formData.type,
      url: formData.url,
      tags: formData.tags,
      lastUpdated: new Date().toISOString()
    };

    setKnowledgeBase(prev => 
      prev.map(item => item.id === editingItem.id ? updatedItem : item)
    );
    
    setEditingItem(null);
    setFormData({
      title: '',
      category: '',
      content: '',
      type: 'article',
      url: '',
      tags: []
    });
    setShowAddForm(false);
    
    toast({
      title: "Resource Updated",
      description: "Knowledge base resource has been updated successfully.",
    });
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Resource Deleted",
      description: "Knowledge base resource has been deleted.",
    });
  };

  const filteredItems = knowledgeBase.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'guide': return <BookOpen className="h-4 w-4" />;
      case 'faq': return <BookOpen className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Base Management
          </DialogTitle>
          <DialogDescription>
            Manage your professional knowledge base and resource library
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-full max-h-[60vh]">
          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium mb-3">
                {editingItem ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Resource title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="performance, tips, advanced"
                  />
                </div>
              </div>
              
              {formData.type === 'link' && (
                <div className="mt-4">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
              
              <div className="mt-4">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Resource content or description..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Update' : 'Add'} Resource
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setFormData({
                    title: '',
                    category: '',
                    content: '',
                    type: 'article',
                    url: '',
                    tags: []
                  });
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Resources List */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {knowledgeBase.length === 0 ? (
                  <>
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Resources Yet</h3>
                    <p>Start building your knowledge base by adding resources</p>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Matching Resources</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(item.type)}
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {(item.type as string) === 'link' && item.url && (
                          <Button size="sm" variant="outline" onClick={() => window.open(item.url, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}