import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle, XCircle, AlertTriangle, Music, FileText } from 'lucide-react';

interface ContentItem {
  id: number;
  type: 'song' | 'album' | 'comment' | 'profile';
  title: string;
  artist: string;
  status: 'pending' | 'approved' | 'flagged' | 'rejected';
  flagReason?: string;
  reportCount: number;
  submittedAt: string;
}

interface ContentModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContent?: ContentItem | null;
}

export default function ContentModerationModal({ isOpen, onClose, selectedContent }: ContentModerationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending-review');
  const [reviewingItem, setReviewingItem] = useState<ContentItem | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  // Fetch content items for moderation
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['/api/admin/content-moderation'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/content-moderation');
      return response as ContentItem[];
    }
  });

  // Approve content mutation
  const approveContentMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      return await apiRequest(`/api/admin/content/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Content approved successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-moderation'] });
      setReviewingItem(null);
      setModerationNote('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve content', variant: 'destructive' });
    }
  });

  // Reject content mutation
  const rejectContentMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      return await apiRequest(`/api/admin/content/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Content rejected successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-moderation'] });
      setReviewingItem(null);
      setModerationNote('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reject content', variant: 'destructive' });
    }
  });

  const handleApprove = (item: ContentItem) => {
    if (!moderationNote.trim()) {
      toast({ title: 'Error', description: 'Please add a moderation note', variant: 'destructive' });
      return;
    }
    approveContentMutation.mutate({ id: item.id, note: moderationNote });
  };

  const handleReject = (item: ContentItem) => {
    if (!moderationNote.trim()) {
      toast({ title: 'Error', description: 'Please add a rejection reason', variant: 'destructive' });
      return;
    }
    rejectContentMutation.mutate({ id: item.id, note: moderationNote });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      flagged: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      rejected: { variant: 'outline' as const, icon: XCircle, color: 'text-gray-600' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getContentIcon = (type: string) => {
    const icons = {
      song: Music,
      album: Music,
      comment: FileText,
      profile: FileText
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const pendingItems = contentItems?.filter(item => item.status === 'pending') || [];
  const flaggedItems = contentItems?.filter(item => item.status === 'flagged') || [];
  const reviewedItems = contentItems?.filter(item => ['approved', 'rejected'].includes(item.status)) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Content Moderation
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending-review">
              Pending Review ({pendingItems.length})
            </TabsTrigger>
            <TabsTrigger value="flagged-content">
              Flagged Content ({flaggedItems.length})
            </TabsTrigger>
            <TabsTrigger value="review-history">
              Review History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending-review" className="space-y-4 flex-1">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : pendingItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No pending content to review
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingItems.map((item) => {
                      const ContentIcon = getContentIcon(item.type);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ContentIcon className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{item.title}</p>
                                {item.flagReason && (
                                  <p className="text-sm text-red-600">{item.flagReason}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{item.artist}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewingItem(item)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="flagged-content" className="space-y-4 flex-1">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No flagged content
                      </TableCell>
                    </TableRow>
                  ) : (
                    flaggedItems.map((item) => {
                      const ContentIcon = getContentIcon(item.type);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ContentIcon className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.artist}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.reportCount}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-red-600">
                            {item.flagReason || 'Community guidelines violation'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">Flagged</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewingItem(item)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="review-history" className="space-y-4 flex-1">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Reviewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No review history
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviewedItems.map((item) => {
                      const ContentIcon = getContentIcon(item.type);
                      const statusBadge = getStatusBadge(item.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ContentIcon className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.artist}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${statusBadge.color}`} />
                              <Badge variant={statusBadge.variant} className="capitalize">
                                {item.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Item Modal */}
        {reviewingItem && (
          <Dialog open={!!reviewingItem} onOpenChange={() => setReviewingItem(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Content: {reviewingItem.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Content Type</Label>
                    <p className="capitalize">{reviewingItem.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Artist</Label>
                    <p>{reviewingItem.artist}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted</Label>
                    <p>{new Date(reviewingItem.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reports</Label>
                    <p>{reviewingItem.reportCount || 0}</p>
                  </div>
                </div>

                {reviewingItem.flagReason && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">Flag Reason</Label>
                    <p className="text-red-600">{reviewingItem.flagReason}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="moderation-note">Moderation Note</Label>
                  <Textarea
                    id="moderation-note"
                    placeholder="Add your review comments..."
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setReviewingItem(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(reviewingItem)}
                    disabled={rejectContentMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(reviewingItem)}
                    disabled={approveContentMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}