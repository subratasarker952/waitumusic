import { useState, useEffect } from "react";
import { useModalManager } from '@/hooks/useModalManager';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Music, 
  Upload, 
  X, 
  Plus, 
  DollarSign, 
  Clock,
  Package,
  ShoppingBag,
  AlertCircle
} from "lucide-react";

const albumUploadSchema = z.object({
  title: z.string().min(1, "Album title is required"),
  description: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  albumPrice: z.string().min(1, "Album price is required"),
  perSongPrice: z.string().optional(), // Override individual song pricing
  coverArt: z.any().optional(),
  tracks: z.array(z.object({
    title: z.string().min(1, "Track title is required"),
    trackNumber: z.number(),
    isrcCode: z.string().min(1, "ISRC code is required"),
    audioFile: z.any().optional(),
    lyrics: z.string().optional(),
    credits: z.string().optional(),
    customPrice: z.string().optional(), // Override album-based pricing
  })).min(1, "At least one track is required"),
  assignedMerchandise: z.array(z.number()).optional(), // Merchandise IDs to assign
});

type AlbumUploadForm = z.infer<typeof albumUploadSchema>;

interface AlbumUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AlbumUploadModal({ open, onOpenChange, onSuccess }: AlbumUploadModalProps) {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableMerchandise, setAvailableMerchandise] = useState([]);

  const form = useForm<AlbumUploadForm>({
    resolver: zodResolver(albumUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      releaseDate: "",
      albumPrice: "",
      perSongPrice: "",
      tracks: [
        {
          title: "",
          trackNumber: 1,
          isrcCode: "",
          lyrics: "",
          credits: "",
          customPrice: "",
        }
      ],
      assignedMerchandise: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tracks",
  });

  // Load available merchandise for assignment
  useEffect(() => {
    if (open && user) {
      loadMerchandise();
    }
  }, [open, user]);

  const loadMerchandise = async () => {
    try {
      const response = await apiRequest('/api/merchandise');
      const merchData = await response.json();
      const userMerch = merchData.filter((item: any) => 
        item.artistUserId === user?.id || 
        role === 'admin' || 
        role === 'superadmin'
      );
      setAvailableMerchandise(userMerch);
    } catch (error) {
      console.error('Failed to load merchandise:', error);
    }
  };

  const addTrack = () => {
    append({
      title: "",
      trackNumber: fields.length + 1,
      isrcCode: "",
      lyrics: "",
      credits: "",
      customPrice: "",
    });
  };

  const removeTrack = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Renumber remaining tracks
      fields.forEach((_, idx) => {
        if (idx > index) {
          form.setValue(`tracks.${idx - 1}.trackNumber`, idx);
        }
      });
    }
  };

  const onSubmit = async (data: AlbumUploadForm) => {
    if (!user) return;
    
    setIsSubmitting(true);
    let createdAlbumId: number | null = null;
    let createdSongIds: number[] = [];
    
    try {
      // Create album first
      const albumData = {
        title: data.title,
        description: data.description,
        genre: data.genre,
        releaseDate: data.releaseDate,
        albumPrice: parseFloat(data.albumPrice),
        perSongPrice: data.perSongPrice ? parseFloat(data.perSongPrice) : null,
        artistUserId: user.id,
        trackCount: data.tracks.length,
      };

      const albumResponse = await apiRequest('/api/albums', {
        method: 'POST',
        body: JSON.stringify(albumData),
      });
      const albumData_result = await albumResponse.json();
      createdAlbumId = albumData_result.id;

      // Upload tracks with proper error handling
      for (let i = 0; i < data.tracks.length; i++) {
        const track = data.tracks[i];
        const songData = {
          albumId: albumData_result.id,
          artistUserId: user.id,
          title: track.title,
          trackNumber: track.trackNumber,
          isrcCode: track.isrcCode,
          lyrics: track.lyrics || null,
          credits: track.credits || null,
          price: track.customPrice 
            ? parseFloat(track.customPrice)
            : data.perSongPrice 
              ? parseFloat(data.perSongPrice)
              : parseFloat(data.albumPrice) / data.tracks.length,
          genre: data.genre,
          releaseDate: data.releaseDate,
        };

        const songResponse = await apiRequest('/api/songs', {
          method: 'POST',
          body: JSON.stringify(songData),
        });
        const songResult = await songResponse.json();
        createdSongIds.push(songResult.id);
      }

      // Assign merchandise if selected with proper song IDs
      if (data.assignedMerchandise && data.assignedMerchandise.length > 0) {
        for (const merchId of data.assignedMerchandise) {
          // Create album-to-merchandise relationship
          await apiRequest('/api/cross-upsell-relationships', {
            method: 'POST',
            body: JSON.stringify({
              sourceType: 'album',
              sourceId: albumData_result.id,
              targetType: 'merchandise',
              targetId: merchId,
              relationshipType: 'bundle',
              priority: 1,
            }),
          });

          // Create song-to-merchandise relationships with actual song IDs
          for (const songId of createdSongIds) {
            await apiRequest('/api/cross-upsell-relationships', {
              method: 'POST',
              body: JSON.stringify({
                sourceType: 'song',
                sourceId: songId,
                targetType: 'merchandise',
                targetId: merchId,
                relationshipType: 'complement',
                priority: 2,
              }),
            });
          }
        }
      }

      toast({
        title: "Album Uploaded Successfully",
        description: `"${data.title}" with ${data.tracks.length} tracks has been uploaded.`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      // Rollback on failure - delete created records
      if (createdAlbumId || createdSongIds.length > 0) {
        toast({
          title: "Upload Failed - Cleaning Up",
          description: "Rolling back partial upload...",
          variant: "destructive",
        });
        
        // TODO: Implement proper rollback API endpoints
        console.error('Album upload failed, manual cleanup may be required:', {
          albumId: createdAlbumId,
          songIds: createdSongIds
        });
      }

      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload album",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pricing info
  const albumPrice = parseFloat(form.watch("albumPrice") || "0");
  const perSongPrice = form.watch("perSongPrice");
  const trackCount = fields.length;
  const calculatedPerTrackPrice = perSongPrice 
    ? parseFloat(perSongPrice) 
    : trackCount > 0 ? albumPrice / trackCount : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Upload Album
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Album Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Album Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Album Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter album title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Pop, Rock, Hip-Hop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="albumPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Album Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="19.99" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your album..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="perSongPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Song Price Override (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Leave empty to divide album price by track count" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        If set, each individual song will be priced at this amount regardless of album price.
                        If empty, individual songs will be priced at ${calculatedPerTrackPrice.toFixed(2)} each.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Pricing Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>Album Price: ${albumPrice.toFixed(2)}</p>
                    <p>Tracks: {trackCount}</p>
                    <p>Individual Song Price: ${calculatedPerTrackPrice.toFixed(2)}</p>
                    {perSongPrice && (
                      <p className="text-orange-600">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Using per-song price override
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Track Listing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Track Listing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Track {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeTrack(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`tracks.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Track Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter track title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tracks.${index}.isrcCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ISRC Code</FormLabel>
                            <FormControl>
                              <Input placeholder="US-XXX-XX-XXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tracks.${index}.customPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Price (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="Override default pricing" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground">Audio file upload coming soon</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`tracks.${index}.lyrics`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lyrics (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter lyrics..." 
                                className="min-h-[60px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tracks.${index}.credits`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credits (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Producer, songwriter, etc..." 
                                className="min-h-[60px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" onClick={addTrack} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Track
                </Button>
              </CardContent>
            </Card>

            {/* Merchandise Assignment */}
            {availableMerchandise.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Merchandise Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="assignedMerchandise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select merchandise to bundle with this album</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {availableMerchandise.map((item: any) => (
                            <label 
                              key={item.id} 
                              className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-muted"
                            >
                              <input
                                type="checkbox"
                                checked={field.value?.includes(item.id) || false}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...(field.value || []), item.id]
                                    : (field.value || []).filter(id => id !== item.id);
                                  field.onChange(newValue);
                                }}
                              />
                              <div>
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-muted-foreground">${item.price}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Upload Album"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}