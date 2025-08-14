import { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Track {
  id: string;
  title: string;
  duration: number;
  trackNumber: number;
  file?: File;
}

interface SortableTrackProps {
  track: Track;
  index: number;
}

function SortableTrack({ track, index }: SortableTrackProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card border rounded"
    >
      <button
        type="button"
        className="cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <span className="text-sm font-medium">{index + 1}.</span>
      <span className="flex-1">{track.title}</span>
      <span className="text-sm text-muted-foreground">
        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
      </span>
    </div>
  );
}

const albumSchema = z.object({
  title: z.string().min(1, "Album title is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  tracks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    duration: z.number(),
    trackNumber: z.number()
  }))
});

type AlbumFormData = z.infer<typeof albumSchema>;

export function AlbumUploadModal() {
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: 'Track 1', duration: 180, trackNumber: 1 },
    { id: '2', title: 'Track 2', duration: 210, trackNumber: 2 },
    { id: '3', title: 'Track 3', duration: 195, trackNumber: 3 },
  ]);

  const form = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: '',
      releaseDate: '',
      tracks: tracks
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);

      const newTracks = arrayMove(tracks, oldIndex, newIndex);
      
      // Update track numbers
      const reorderedTracks = newTracks.map((track, index) => ({
        ...track,
        trackNumber: index + 1
      }));
      
      setTracks(reorderedTracks);
      
      // CRITICAL: Update form state to persist the order
      form.setValue('tracks', reorderedTracks, { 
        shouldValidate: true,
        shouldDirty: true 
      });
    }
  };

  const onSubmit = (data: AlbumFormData) => {
    console.log('Submitting album with track order:', data.tracks);
    // The tracks will now maintain their reordered state
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Album</h3>
        
        <div className="space-y-4">
          <input
            {...form.register('title')}
            placeholder="Album Title"
            className="w-full p-2 border rounded"
          />
          
          <input
            {...form.register('releaseDate')}
            type="date"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Track Order (Drag to reorder)</h4>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tracks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <SortableTrack 
                  key={track.id} 
                  track={track} 
                  index={index} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <button 
        type="submit" 
        className="w-full bg-primary text-primary-foreground p-2 rounded"
      >
        Upload Album
      </button>
    </form>
  );
}