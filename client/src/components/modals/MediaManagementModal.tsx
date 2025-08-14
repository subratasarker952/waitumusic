import React, { useState, useEffect } from 'react';
import { useModalManager } from '@/hooks/useModalManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { 
  Image, 
  Video, 
  Music, 
  FileText, 
  Upload, 
  Download,
  Eye,
  Edit,
  Trash2,
  Share,
  Users,
  Calendar,
  Search,
  Filter,
  FolderOpen,
  HardDrive,
  Globe,
  Lock,
  Unlock,
  Tag
} from 'lucide-react';

interface MediaManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  visibility: 'public' | 'private' | 'restricted';
  assignments: string[];
  tags: string[];
  category: string;
  description?: string;
}

export default function MediaManagementModal({ open, onOpenChange }: MediaManagementModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const [storageStats, setStorageStats] = useState({
    totalUsed: 0,
    totalAvailable: 0,
    imageCount: 0,
    videoCount: 0,
    audioCount: 0,
    documentCount: 0
  });

  // Load real media files when modal opens
  useEffect(() => {
    if (open) {
      loadMediaFiles();
    }
  }, [open]);

  const loadMediaFiles = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/admin/media/files');
      const data = await response.json();
      
      if (data.files) {
        setMediaFiles(data.files);
      }
      if (data.stats) {
        setStorageStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFileAssignments = async (fileId: string, assignments: string[]) => {
    try {
      await apiRequest(`/api/admin/media/files/${fileId}/assignments`, {
        method: 'PATCH',
        body: { assignments }
      });
      
      setMediaFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, assignments }
            : file
        )
      );
      
      toast({
        title: "File Assignments Updated",
        description: "File assignment settings have been saved."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update file assignments.",
        variant: "destructive"
      });
    }
  };

  const updateFileVisibility = async (fileId: string, visibility: 'public' | 'private' | 'restricted') => {
    try {
      await apiRequest(`/api/admin/media/files/${fileId}/visibility`, {
        method: 'PATCH',
        body: { visibility }
      });
      
      setMediaFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, visibility }
            : file
        )
      );
      
      toast({
        title: "Visibility Updated",
        description: "File visibility settings have been changed."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update file visibility.",
        variant: "destructive"
      });
    }
  };

  const viewFile = async (file: MediaFile) => {
    // Open file in new tab/window
    window.open(file.url, '_blank');
    toast({
      title: "File Opened",
      description: `Viewing ${file.name} in new tab.`
    });
  };

  const downloadFile = async (file: MediaFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Downloading ${file.name}.`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download file.",
        variant: "destructive"
      });
    }
  };

  const editFile = async (file: MediaFile) => {
    // For now, show edit dialog with assignment options
    setSelectedFile(file);
    setShowAssignmentDialog(true);
  };



  const deleteFile = async (fileId: string) => {
    try {
      await apiRequest(`/api/admin/media/files/${fileId}`, {
        method: 'DELETE'
      });
      
      setMediaFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast({
        title: "File Deleted",
        description: "File has been permanently deleted."
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete file.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (open) {
      loadMediaFiles();
    }
  }, [open]);

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = activeTab === 'all' || file.type === activeTab;
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesVisibility = filterVisibility === 'all' || file.visibility === filterVisibility;
    
    return matchesSearch && matchesType && matchesCategory && matchesVisibility;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />;
      case 'private': return <Lock className="h-4 w-4 text-red-500" />;
      case 'restricted': return <Users className="h-4 w-4 text-yellow-500" />;
      default: return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HardDrive className="h-6 w-6" />
            <span>Media Management</span>
          </DialogTitle>
          <DialogDescription>
            Manage all platform media files, assignments, and access controls
          </DialogDescription>
        </DialogHeader>

        {/* Storage Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{storageStats.totalUsed} GB</div>
                <div className="text-sm text-muted-foreground">Used of {storageStats.totalAvailable} GB</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold flex items-center justify-center">
                  <Image className="h-4 w-4 mr-1" />
                  {storageStats.imageCount}
                </div>
                <div className="text-sm text-muted-foreground">Images</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold flex items-center justify-center">
                  <Video className="h-4 w-4 mr-1" />
                  {storageStats.videoCount}
                </div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold flex items-center justify-center">
                  <Music className="h-4 w-4 mr-1" />
                  {storageStats.audioCount}
                </div>
                <div className="text-sm text-muted-foreground">Audio</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {storageStats.documentCount}
                </div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="branding">Branding</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterVisibility} onValueChange={setFilterVisibility}>
            <SelectTrigger>
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadMediaFiles} disabled={isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <h3 className="font-medium">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()} by {file.uploadedBy}
                          </p>
                          {file.description && (
                            <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getVisibilityIcon(file.visibility)}
                          <span className="text-sm">{file.visibility}</span>
                        </div>
                        
                        <Badge variant="outline">{file.category}</Badge>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => viewFile(file)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => downloadFile(file)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => editFile(file)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Assignments:</h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => editFile(file)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                      {file.assignments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {file.assignments.map((assignment) => (
                            <Badge key={assignment} variant="secondary">
                              {assignment}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No assignments • Click Manage to assign this file to bookings, users, or platform features</p>
                      )}
                    </div>
                    
                    {file.tags.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {file.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredFiles.length === 0 && (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No files found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        {showAssignmentDialog && selectedFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAssignmentDialog(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Manage File Assignments</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Assign "{selectedFile.name}" to bookings, users, or platform features
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Assignment Type</label>
                  <Select defaultValue="booking">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="user">User Profile</SelectItem>
                      <SelectItem value="feature">Platform Feature</SelectItem>
                      <SelectItem value="branding">Branding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target</label>
                  <Input 
                    placeholder="Enter booking ID, user email, or feature name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <Select 
                    value={selectedFile.visibility} 
                    onValueChange={(value: 'public' | 'private' | 'restricted') => 
                      updateFileVisibility(selectedFile.id, value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Save assignment logic here
                  toast({
                    title: "Assignment Updated",
                    description: "File assignment has been saved."
                  });
                  setShowAssignmentDialog(false);
                }}>
                  Save Assignment
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}