import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Video, Upload, ExternalLink, Play } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface VideoUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

interface VideoFormData {
  title: string;
  description: string;
  videoUrl: string;
  playlistId: string;
  isPublic: boolean;
  duration: number;
}

export function VideoUploadModal({ isOpen, onOpenChange, userId }: VideoUploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    videoUrl: '',
    playlistId: '',
    isPublic: true,
    duration: 0
  });

  // Fetch user's existing videos
  const { data: userVideos = [] } = useQuery({
    queryKey: ['videos', userId],
    queryFn: () => apiRequest(`/api/videos?userId=${userId}`),
    enabled: isOpen
  });

  const uploadVideoMutation = useMutation({
    mutationFn: (data: VideoFormData) => 
      apiRequest('/api/videos', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "YouTube video added successfully! It will appear in your profile area." 
      });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add video. Please check the YouTube URL." 
      });
    }
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: number) => 
      apiRequest(`/api/videos/${videoId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Success", description: "Video removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      playlistId: '',
      isPublic: true,
      duration: 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) {
      toast({ title: "Error", description: "Title and YouTube URL are required" });
      return;
    }
    
    // Validate YouTube URL
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(formData.videoUrl)) {
      toast({ title: "Error", description: "Please enter a valid YouTube URL" });
      return;
    }

    uploadVideoMutation.mutate(formData);
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getVideoThumbnail = (url: string) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            YouTube Video Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Video Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter video title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">YouTube URL *</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Video description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="playlistId">Playlist ID (Optional)</Label>
                <Input
                  id="playlistId"
                  value={formData.playlistId}
                  onChange={(e) => setFormData(prev => ({ ...prev, playlistId: e.target.value }))}
                  placeholder="YouTube playlist ID"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Playlists are encouraged for better organization
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="isPublic">Make video public on profile</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={uploadVideoMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {uploadVideoMutation.isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Video
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Existing Videos List */}
          {Array.isArray(userVideos) && userVideos.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Your YouTube Videos</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userVideos.map((video: any) => (
                  <div key={video.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {getVideoThumbnail(video.videoUrl) && (
                      <img 
                        src={getVideoThumbnail(video.videoUrl)!}
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {video.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${video.isPublic ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs text-muted-foreground">
                          {video.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(video.videoUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteVideoMutation.mutate(video.id)}
                        disabled={deleteVideoMutation.isPending}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Play className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-emerald-700 dark:text-emerald-300">YouTube Integration Benefits</p>
                <ul className="text-emerald-600 dark:text-emerald-400 mt-1 space-y-1">
                  <li>• Videos appear in your profile area for fans to discover</li>
                  <li>• Automatic embedding on your all-links page</li>
                  <li>• Playlists encouraged for better content organization</li>
                  <li>• Managed users get enhanced video features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}