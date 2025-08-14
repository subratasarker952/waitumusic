import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import AlbumUploadModal from "./modals/AlbumUploadModal";

interface UploadAlbumButtonProps {
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function UploadAlbumButton({ 
  onSuccess, 
  variant = "default", 
  size = "default", 
  className 
}: UploadAlbumButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Music className="w-4 h-4 mr-2" />
        Upload Album
      </Button>
      
      <AlbumUploadModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          onSuccess?.();
        }}
      />
    </>
  );
}