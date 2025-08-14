import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import { Upload, File, Music, Video, Image, FileText, X, Check, AlertCircle } from 'lucide-react';

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  url?: string;
  duration?: number;
  metadata?: any;
  error?: string;
}

interface FileUploadSystemProps {
  acceptedTypes: string[];
  maxFileSize: number;
  uploadEndpoint: string;
  onUploadComplete?: (files: any[]) => void;
  category?: string;
}

export default function FileUploadSystem({
  acceptedTypes,
  maxFileSize,
  uploadEndpoint,
  onUploadComplete,
  category = 'general'
}: FileUploadSystemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, uploadId }: { file: File; uploadId: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('originalName', file.name);

      // Simulate progress updates
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, progress: 25, status: 'uploading' as const }
          : upload
      ));

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, progress: 75, status: 'processing' as const }
          : upload
      ));

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Process metadata if it's an audio/video file
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        await processMediaMetadata(file, uploadId);
      }

      return result;
    },
    onSuccess: (data, { uploadId }) => {
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { 
              ...upload, 
              progress: 100, 
              status: 'complete' as const,
              url: data.url,
              metadata: data.metadata
            }
          : upload
      ));
      
      toast({ title: "Success", description: "File uploaded successfully" });
    },
    onError: (error: any, { uploadId }) => {
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { 
              ...upload, 
              status: 'error' as const,
              error: error.message || 'Upload failed'
            }
          : upload
      ));
      
      toast({ 
        title: "Upload Failed", 
        description: error.message || 'Failed to upload file',
        variant: "destructive"
      });
    }
  });

  const processMediaMetadata = async (file: File, uploadId: string) => {
    try {
      // Create audio element to get duration
      if (file.type.startsWith('audio/')) {
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          audio.onloadedmetadata = () => {
            const duration = Math.round(audio.duration);
            setUploads(prev => prev.map(upload => 
              upload.id === uploadId 
                ? { ...upload, duration, metadata: { ...upload.metadata, duration } }
                : upload
            ));
            URL.revokeObjectURL(url);
            resolve(duration);
          };
          audio.onerror = reject;
          audio.src = url;
        });
      }
    } catch (error) {
      console.error('Error processing media metadata:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: FileUpload[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Start uploads
    newUploads.forEach(upload => {
      uploadMutation.mutate({ file: upload.file, uploadId: upload.id });
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as any),
    maxSize: maxFileSize,
    multiple: true
  });

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const retryUpload = (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (upload) {
      setUploads(prev => prev.map(u => 
        u.id === uploadId 
          ? { ...u, status: 'uploading' as const, progress: 0, error: undefined }
          : u
      ));
      uploadMutation.mutate({ file: upload.file, uploadId });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.includes('document') || fileType.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompleteAll = () => {
    const completedUploads = uploads.filter(upload => upload.status === 'complete');
    if (completedUploads.length > 0 && onUploadComplete) {
      onUploadComplete(completedUploads.map(upload => ({
        id: upload.id,
        fileName: upload.file.name,
        fileType: upload.file.type,
        fileSize: upload.file.size,
        url: upload.url,
        duration: upload.duration,
        metadata: upload.metadata
      })));
    }
    setUploads([]);
  };

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            File Upload System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: {acceptedTypes.join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max file size: {formatFileSize(maxFileSize)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Progress</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploads([])}
                  disabled={uploads.some(u => u.status === 'uploading' || u.status === 'processing')}
                >
                  Clear All
                </Button>
                {uploads.some(u => u.status === 'complete') && (
                  <Button
                    size="sm"
                    onClick={handleCompleteAll}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Upload
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(upload.file.type)}
                      <div>
                        <p className="font-medium text-sm">{upload.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(upload.file.size)}
                          {upload.duration && ` • ${Math.floor(upload.duration / 60)}:${(upload.duration % 60).toString().padStart(2, '0')}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        upload.status === 'complete' ? 'default' :
                        upload.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {upload.status === 'uploading' && 'Uploading'}
                        {upload.status === 'processing' && 'Processing'}
                        {upload.status === 'complete' && 'Complete'}
                        {upload.status === 'error' && 'Error'}
                      </Badge>
                      
                      {upload.status === 'complete' && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                      
                      {upload.status === 'error' && (
                        <div className="flex gap-1">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload(upload.id)}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(upload.id)}
                        disabled={upload.status === 'uploading' || upload.status === 'processing'}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {upload.status !== 'complete' && upload.status !== 'error' && (
                    <Progress value={upload.progress} className="h-2" />
                  )}
                  
                  {upload.error && (
                    <p className="text-sm text-red-600 mt-2">{upload.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}