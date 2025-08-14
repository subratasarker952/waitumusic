import React, { useState } from 'react';
import { Share2, Copy, Check, Mail, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ShareButtonProps {
  documentType: 'technical_rider' | 'contract' | 'booking_agreement';
  documentId: number;
  title?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  documentType,
  documentId,
  title = 'Share',
  variant = 'outline',
  size = 'default'
}) => {
  const [open, setOpen] = useState(false);
  const [accessType, setAccessType] = useState('view');
  const [expiresIn, setExpiresIn] = useState('604800'); // 7 days in seconds
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();

  const createShareLinkMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/share-link', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
      toast({
        title: "Share link created",
        description: "Your shareable link is ready to use",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating share link",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  });

  const handleCreateLink = () => {
    createShareLinkMutation.mutate({
      documentType,
      documentId,
      accessType,
      expiresIn: parseInt(expiresIn),
      metadata: {
        sharedAt: new Date().toISOString(),
        sharedBy: 'current_user' // This would be filled by the backend
      }
    });
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "The share link has been copied to your clipboard",
      });
    }
  };

  const handleEmailShare = () => {
    if (shareUrl) {
      const subject = encodeURIComponent(`Shared ${documentType.replace('_', ' ')}`);
      const body = encodeURIComponent(`Here's a link to view the ${documentType.replace('_', ' ')}: ${shareUrl}`);
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-2" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {documentType.replace('_', ' ')}</DialogTitle>
          <DialogDescription>
            Create a shareable link for this {documentType.replace('_', ' ')}. 
            Anyone with the link can access it based on the permissions you set.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-type">Access Level</Label>
            <Select value={accessType} onValueChange={setAccessType}>
              <SelectTrigger id="access-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="download">View & Download</SelectItem>
                {documentType === 'contract' && (
                  <SelectItem value="sign">View & Sign</SelectItem>
                )}
                <SelectItem value="full">Full Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Link Expires In</Label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger id="expires">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3600">1 Hour</SelectItem>
                <SelectItem value="86400">24 Hours</SelectItem>
                <SelectItem value="604800">7 Days</SelectItem>
                <SelectItem value="2592000">30 Days</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!shareUrl ? (
            <Button 
              onClick={handleCreateLink} 
              className="w-full"
              disabled={createShareLinkMutation.isPending}
            >
              <Link className="h-4 w-4 mr-2" />
              {createShareLinkMutation.isPending ? 'Creating...' : 'Create Share Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEmailShare}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Link
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShareUrl('');
                    setAccessType('view');
                  }}
                >
                  Create New Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};