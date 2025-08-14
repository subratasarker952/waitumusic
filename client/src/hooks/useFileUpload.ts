import { useState } from 'react';
import { uploadFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadOptions {
  url: string;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload({
  url,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  acceptedTypes,
  onSuccess,
  onError
}: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      const sizeMB = Math.round(maxFileSize / 1024 / 1024);
      return `File size exceeds ${sizeMB}MB limit`;
    }

    // Check file type
    if (acceptedTypes && !acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not accepted`;
    }

    return null;
  };

  const upload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid File",
        description: error,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadFile(url, file, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      
      toast({
        title: "Upload Successful",
        description: "File uploaded successfully"
      });
      
      onSuccess?.(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      onError?.(error as Error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    upload,
    isUploading,
    uploadProgress
  };
}