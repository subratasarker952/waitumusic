import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, Image, Video, Music, Download, Eye, Upload, 
  Trash2, Shield, AlertCircle, CheckCircle, FileIcon,
  Lock, Unlock
} from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: number;
  bookingId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    id: number;
    fullName: string;
    roleName: string;
  };
  visibility: 'booker_only' | 'admin_controlled' | 'all_talent';
  description?: string;
  uploadedAt: string;
  url: string;
}

interface MediaHubSectionProps {
  bookingId: number;
}

export function MediaHubSection({ bookingId }: MediaHubSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'booker_only' | 'admin_controlled' | 'all_talent'>('admin_controlled');

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['booking-documents', bookingId],
    queryFn: async () => {
      const response = await apiRequest(`/api/bookings/${bookingId}/documents`);
      return response as Document[];
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest(`/api/bookings/${bookingId}/documents`, {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "The document has been uploaded successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['booking-documents', bookingId] });
      setUploadOpen(false);
      setSelectedFile(null);
      setDescription('');
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload the document. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest(`/api/bookings/${bookingId}/documents/${documentId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "The document has been removed."
      });
      queryClient.invalidateQueries({ queryKey: ['booking-documents', bookingId] });
    }
  });

  // Update visibility mutation (admin only)
  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ documentId, visibility }: { documentId: number; visibility: string }) => {
      return apiRequest(`/api/bookings/${bookingId}/documents/${documentId}/visibility`, {
        method: 'PATCH',
        body: { visibility }
      });
    },
    onSuccess: () => {
      toast({
        title: "Visibility updated",
        description: "Document visibility has been updated."
      });
      queryClient.invalidateQueries({ queryKey: ['booking-documents', bookingId] });
    }
  });

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);
    formData.append('visibility', visibility);

    uploadMutation.mutate(formData);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'booker_only':
        return <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" />Booker Only</Badge>;
      case 'admin_controlled':
        return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Admin Controlled</Badge>;
      case 'all_talent':
        return <Badge variant="default"><Unlock className="h-3 w-3 mr-1" />All Talent</Badge>;
      default:
        return null;
    }
  };

  const canEdit = user?.roleId && [1, 2].includes(user.roleId); // Superadmin or Admin
  const isBooker = user?.id === documents[0]?.uploadedBy?.id && documents[0]?.uploadedBy?.roleName === 'Booker';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>MediaHub - Document Sharing</CardTitle>
            <CardDescription>
              Share and manage documents, graphics, and videos for this booking
            </CardDescription>
          </div>
          <Button onClick={() => setUploadOpen(true)} size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload contracts, technical specifications, stage plots, and other important files
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{doc.fileName}</p>
                      {getVisibilityBadge(doc.visibility)}
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>Uploaded by {doc.uploadedBy.fullName}</span>
                      <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                      <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <select
                      className="text-xs border rounded px-2 py-1"
                      value={doc.visibility}
                      onChange={(e) => updateVisibilityMutation.mutate({ 
                        documentId: doc.id, 
                        visibility: e.target.value 
                      })}
                      data-testid={`select-visibility-${doc.id}`}
                    >
                      <option value="booker_only">Booker Only</option>
                      <option value="admin_controlled">Admin Controlled</option>
                      <option value="all_talent">All Talent</option>
                    </select>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} download={doc.fileName}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                  {(canEdit || doc.uploadedBy.id === user?.id) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                      data-testid={`button-delete-${doc.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>File</Label>
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: PDF, Word, Text, Images, Videos (max 50MB)
                </p>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                />
              </div>
              <div>
                <Label>Visibility</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                >
                  <option value="booker_only">Booker Only - Only the event organizer can view</option>
                  <option value="admin_controlled">Admin Controlled - Admins decide who can view</option>
                  <option value="all_talent">All Talent - All assigned talent can view</option>
                </select>
              </div>
              {!canEdit && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Uploaded documents will be set to "{visibility}" visibility. 
                    Admins can change this after upload if needed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}