import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/api';
import { useModalManager } from '@/hooks/useModalManager';
import {
  Image,
  Video,
  FileText,
  Music,
  Search,
  Eye,
  Plus,
  X
} from 'lucide-react';

interface MediaFile {
  id: number;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  url: string;
  category: string;
  tags: string[];
  description?: string;
  uploaded_by: number;
  is_public: boolean;
  created_at: string;
}

interface MediaItem {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
}

interface MediaAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedMedia: MediaItem[];
  onAssignMedia: (media: MediaItem[]) => void;
}

const MediaAssignmentModal: React.FC<MediaAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignedMedia = [],
  onAssignMedia
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);

  // Fetch media files
  const { data: mediaFiles = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ['/api/media', searchTerm, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      return apiRequest(`/api/media?${params}`).then(res => res.json());
    },
    enabled: isOpen
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-green-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5 text-orange-500" />;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileToggle = (file: MediaFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleAssignSelected = () => {
    const mediaItems: MediaItem[] = selectedFiles.map(file => ({
      id: file.id,
      name: file.original_name,
      type: getFileType(file.mime_type),
      size: formatFileSize(file.file_size),
      url: file.url
    }));
    
    onAssignMedia([...assignedMedia, ...mediaItems]);
    setSelectedFiles([]);
    onClose();
  };

  const isFileAssigned = (fileId: number) => {
    return assignedMedia.some(media => media.id === fileId);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Media Files</DialogTitle>
          <DialogDescription>
            Select images, videos, or documents to attach to your newsletter or press release
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 py-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
            <option value="documents">Documents</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : mediaFiles.length > 0 ? (
            <div className="grid gap-3">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    selectedFiles.some(f => f.id === file.id) ? 'border-primary bg-primary/5' : ''
                  } ${isFileAssigned(file.id) ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedFiles.some(f => f.id === file.id)}
                      onCheckedChange={() => handleFileToggle(file)}
                      disabled={isFileAssigned(file.id)}
                    />
                    {getFileIcon(file.mime_type)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.original_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)} • {file.category}
                      </p>
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {file.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{file.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFileAssigned(file.id) && (
                      <Badge variant="outline" className="text-xs">
                        Already Assigned
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No media files found</p>
              <p className="text-sm">Upload media files from the Media Management tab</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedFiles.length} file(s) selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignSelected}
              disabled={selectedFiles.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Selected ({selectedFiles.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaAssignmentModal;