import { Progress } from "@/components/ui/progress";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  onCancel?: () => void;
  isComplete?: boolean;
}

export function UploadProgress({ 
  fileName, 
  progress, 
  onCancel,
  isComplete 
}: UploadProgressProps) {
  return (
    <div className="space-y-2 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate max-w-[200px]">
            {fileName}
          </span>
        </div>
        {onCancel && !isComplete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{isComplete ? 'Complete' : 'Uploading...'}</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
}