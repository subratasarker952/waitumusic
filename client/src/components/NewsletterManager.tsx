import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Send, Eye, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Newsletter {
  id: number;
  subject?: string;
  content?: string;
  status: string;
  recipientCount?: number;
  scheduledDate?: Date;
  sentDate?: Date;
  createdAt: Date;
}

export default function NewsletterManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    subject: '',
    content: '',
    targetAudience: 'all',
    scheduledDate: ''
  });

  const queryClient = useQueryClient();

  const { data: newsletters, isLoading } = useQuery({
    queryKey: ['/api/newsletters'],
    queryFn: () => apiRequest('/api/newsletters')
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/newsletters', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/newsletters'] });
      setIsCreateOpen(false);
      setNewNewsletter({
        subject: '',
        content: '',
        targetAudience: 'all',
        scheduledDate: ''
      });
    },
    onError: (error) => {
      console.error('Newsletter creation error:', error);
    }
  });

  const handleCreate = () => {
    if (!newNewsletter.subject || !newNewsletter.content) return;
    createMutation.mutate(newNewsletter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'scheduled': return 'default';
      case 'sent': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading) return <div>Loading newsletters...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Newsletter Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Newsletter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Newsletter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={newNewsletter.subject}
                  onChange={(e) => setNewNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Newsletter subject..."
                />
              </div>
              
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select
                  value={newNewsletter.targetAudience}
                  onValueChange={(value) => setNewNewsletter(prev => ({ ...prev, targetAudience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    <SelectItem value="fans">Fans Only</SelectItem>
                    <SelectItem value="artists">Artists Only</SelectItem>
                    <SelectItem value="professionals">Professionals Only</SelectItem>
                    <SelectItem value="managed">Managed Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Newsletter Content</Label>
                <Textarea
                  id="content"
                  value={newNewsletter.content}
                  onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your newsletter content here..."
                  rows={8}
                  className="min-h-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="scheduledDate">Schedule Send (Optional)</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newNewsletter.scheduledDate}
                  onChange={(e) => setNewNewsletter(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to save as draft
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Quick Templates</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewNewsletter(prev => ({
                      ...prev,
                      subject: 'New Music Alert! 🎵',
                      content: 'We\'re excited to share the latest releases from our talented artists...\n\n[Artist highlights]\n[New releases]\n[Upcoming events]\n\nStay tuned for more amazing music!'
                    }))}
                  >
                    New Releases
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewNewsletter(prev => ({
                      ...prev,
                      subject: 'Upcoming Events & Concerts',
                      content: 'Don\'t miss these upcoming performances from WaituMusic artists!\n\n[Event listings]\n[Booking information]\n[Venue details]\n\nGet your tickets now!'
                    }))}
                  >
                    Events Update
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewNewsletter(prev => ({
                      ...prev,
                      subject: 'Artist Spotlight',
                      content: 'This month we\'re featuring an incredible artist from our roster...\n\n[Artist bio]\n[Recent achievements]\n[Social media links]\n[Music samples]\n\nDiscover more amazing talent!'
                    }))}
                  >
                    Artist Spotlight
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewNewsletter(prev => ({
                      ...prev,
                      subject: 'WaituMusic Monthly Update',
                      content: 'Here\'s what\'s been happening at WaituMusic this month...\n\n[Platform updates]\n[New features]\n[Success stories]\n[Community highlights]\n\nThank you for being part of our community!'
                    }))}
                  >
                    Monthly Update
                  </Button>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Creating...' : 'Create Newsletter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(newsletters) && newsletters.length > 0 ? (
          newsletters.map((newsletter: Newsletter) => (
            <Card key={newsletter.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {newsletter.subject || `Newsletter #${newsletter.id}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant={getStatusColor(newsletter.status)}>
                    {newsletter.status}
                  </Badge>
                  
                  {newsletter.content && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {newsletter.content.substring(0, 150)}
                      {newsletter.content.length > 150 && '...'}
                    </p>
                  )}
                  
                  {newsletter.recipientCount && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      {newsletter.recipientCount} recipients
                    </div>
                  )}
                  
                  {newsletter.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Scheduled: {new Date(newsletter.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  {newsletter.sentDate && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Send className="w-4 h-4" />
                      Sent: {new Date(newsletter.sentDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Created: {new Date(newsletter.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    {newsletter.status === 'draft' && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No newsletters found. Create your first newsletter!</p>
          </div>
        )}
      </div>
    </div>
  );
}