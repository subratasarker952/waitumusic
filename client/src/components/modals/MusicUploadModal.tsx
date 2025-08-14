import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Music, Save, X, FileAudio, Image } from 'lucide-react';

interface MusicUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MusicUploadModal({ open, onOpenChange }: MusicUploadModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    isrcCode: '',
    price: '',
    isFree: false,
    description: '',
    lyrics: '',
    duration: '',
    audioFile: null as File | null,
    coverArt: null as File | null
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: 'audioFile' | 'coverArt', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.isrcCode || !formData.audioFile) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title, ISRC code, and upload an audio file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would handle the file upload and API call
      toast({
        title: "Music Uploaded",
        description: "Your track has been successfully uploaded and is now available.",
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        title: '',
        genre: '',
        isrcCode: '',
        price: '',
        isFree: false,
        description: '',
        lyrics: '',
        duration: '',
        audioFile: null,
        coverArt: null
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload music. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Music
          </DialogTitle>
          <DialogDescription>
            Upload a new track to your music catalog. Make sure to include all required information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Track Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Track Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Track Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter track title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select onValueChange={(value) => handleInputChange('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="reggae">Reggae</SelectItem>
                    <SelectItem value="r&b">R&B</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="folk">Folk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isrcCode">ISRC Code *</Label>
                <Input
                  id="isrcCode"
                  value={formData.isrcCode}
                  onChange={(e) => handleInputChange('isrcCode', e.target.value)}
                  placeholder="e.g., USRC17607839"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (mm:ss)</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 3:45"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your track..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics (Optional)</Label>
              <Textarea
                id="lyrics"
                value={formData.lyrics}
                onChange={(e) => handleInputChange('lyrics', e.target.value)}
                placeholder="Enter song lyrics..."
                rows={4}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="pricing"
                  checked={formData.isFree}
                  onChange={() => {
                    handleInputChange('isFree', true);
                    handleInputChange('price', '');
                  }}
                />
                <span>Free Download</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="pricing"
                  checked={!formData.isFree}
                  onChange={() => handleInputChange('isFree', false)}
                />
                <span>Paid Download</span>
              </label>
            </div>

            {!formData.isFree && (
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.99"
                />
              </div>
            )}
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Files</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audioFile">Audio File * (MP3, WAV)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileAudio className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <input
                    type="file"
                    accept=".mp3,.wav"
                    onChange={(e) => handleFileChange('audioFile', e.target.files?.[0] || null)}
                    className="hidden"
                    id="audioFile"
                  />
                  <label htmlFor="audioFile" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      {formData.audioFile ? formData.audioFile.name : 'Click to upload audio file'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverArt">Cover Art (3000x3000px minimum)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('coverArt', e.target.files?.[0] || null)}
                    className="hidden"
                    id="coverArt"
                  />
                  <label htmlFor="coverArt" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      {formData.coverArt ? formData.coverArt.name : 'Click to upload cover art'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Upload Track
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}