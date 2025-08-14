import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, Users, Calendar, Settings, TrendingUp, FileText, 
  Camera, Mic, Headphones, Guitar, Keyboard, Drum, 
  CreditCard, ShoppingCart, Star, Heart, Play, Volume2,
  X, Plus, Trash2, Edit, Save, Download, Upload
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

// Advanced Setlist Management Modal
export const AdvancedSetlistModal: React.FC<ModalProps> = ({ isOpen, onClose, user }) => {
  const [setlist, setSetlist] = useState([
    { id: 1, title: "What Do We Do", artist: "Lí-Lí Octave", key: "Am", bpm: 120, duration: "3:45" },
    { id: 2, title: "Caribbean Dreams", artist: "Princess Trinidad", key: "G", bpm: 140, duration: "4:12" }
  ]);
  const [newSong, setNewSong] = useState({ title: '', key: '', bpm: '', duration: '' });

  const addSong = () => {
    if (newSong.title) {
      setSetlist([...setlist, { 
        id: Date.now(), 
        ...newSong, 
        artist: user?.fullName || 'Unknown Artist',
        bpm: parseInt(newSong.bpm) || 120
      }]);
      setNewSong({ title: '', key: '', bpm: '', duration: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Advanced Setlist Manager
          </DialogTitle>
          <DialogDescription>
            Create and manage performance setlists with song arrangements, keys, and timing
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Setlist</TabsTrigger>
            <TabsTrigger value="add">Add Songs</TabsTrigger>
            <TabsTrigger value="arrangements">Arrangements</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Performance Setlist</h3>
              <div className="flex gap-2">
                <Button size="sm"><Save className="h-4 w-4 mr-1" />Save</Button>
                <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Export</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {setlist.map((song, index) => (
                <Card key={song.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge>{song.key}</Badge>
                      <Badge variant="secondary">{song.bpm} BPM</Badge>
                      <span className="text-sm">{song.duration}</span>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Add New Song</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Song Title</Label>
                  <Input 
                    value={newSong.title}
                    onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                    placeholder="Enter song title"
                  />
                </div>
                <div>
                  <Label>Key</Label>
                  <Select value={newSong.key} onValueChange={(value) => setNewSong({...newSong, key: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select key" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">C Major</SelectItem>
                      <SelectItem value="G">G Major</SelectItem>
                      <SelectItem value="D">D Major</SelectItem>
                      <SelectItem value="A">A Major</SelectItem>
                      <SelectItem value="Am">A Minor</SelectItem>
                      <SelectItem value="Em">E Minor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>BPM</Label>
                  <Input 
                    type="number"
                    value={newSong.bpm}
                    onChange={(e) => setNewSong({...newSong, bpm: e.target.value})}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input 
                    value={newSong.duration}
                    onChange={(e) => setNewSong({...newSong, duration: e.target.value})}
                    placeholder="3:45"
                  />
                </div>
              </div>
              <Button onClick={addSong} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Song
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="arrangements" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Song Arrangements</h3>
              <p className="text-muted-foreground">Advanced arrangements and chord progressions will be displayed here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Advanced Equipment Manager Modal
export const AdvancedEquipmentModal: React.FC<ModalProps> = ({ isOpen, onClose, user }) => {
  const [equipment, setEquipment] = useState([
    { id: 1, name: "Fender Stratocaster", type: "Guitar", condition: "Excellent", value: "$1,200" },
    { id: 2, name: "Shure SM58", type: "Microphone", condition: "Good", value: "$100" },
    { id: 3, name: "Yamaha P-125", type: "Keyboard", condition: "Excellent", value: "$650" }
  ]);

  const equipmentIcons = {
    Guitar: Guitar,
    Microphone: Mic,
    Keyboard: Keyboard,
    Drums: Drum,
    Headphones: Headphones
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Guitar className="h-5 w-5" />
            Equipment Manager
          </DialogTitle>
          <DialogDescription>
            Manage your musical equipment, instruments, and technical gear
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="add">Add Equipment</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="rental">Rental</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Equipment Inventory</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Equipment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipment.map((item) => {
                const IconComponent = equipmentIcons[item.type as keyof typeof equipmentIcons] || Guitar;
                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                          <Badge variant={item.condition === 'Excellent' ? 'default' : 'secondary'}>
                            {item.condition}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.value}</p>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Add New Equipment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Equipment Name</Label>
                  <Input placeholder="e.g., Fender Stratocaster" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guitar">Guitar</SelectItem>
                      <SelectItem value="microphone">Microphone</SelectItem>
                      <SelectItem value="keyboard">Keyboard</SelectItem>
                      <SelectItem value="drums">Drums</SelectItem>
                      <SelectItem value="headphones">Headphones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condition</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs-repair">Needs Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input placeholder="$1,200" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Additional details about the equipment..." />
                </div>
              </div>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Maintenance Schedule</h3>
              <p className="text-muted-foreground">Equipment maintenance tracking and scheduling</p>
            </Card>
          </TabsContent>

          <TabsContent value="rental" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Equipment Rental</h3>
              <p className="text-muted-foreground">Rent out equipment to other musicians</p>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Fan Engagement Modal
export const FanEngagementModal: React.FC<ModalProps> = ({ isOpen, onClose, user }) => {
  const [followedArtists] = useState([
    { id: 1, name: "Lí-Lí Octave", genre: "Caribbean Neo Soul", followers: 12500, isFollowing: true },
    { id: 2, name: "Princess Trinidad", genre: "Dancehall/Reggae", followers: 8200, isFollowing: true },
    { id: 3, name: "JCro", genre: "Afrobeats/Hip-Hop", followers: 15600, isFollowing: false }
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Fan Engagement Hub
          </DialogTitle>
          <DialogDescription>
            Connect with your favorite artists and discover new music
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="followed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followed">Followed Artists</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="followed" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Followed Artists</h3>
              <Button size="sm">Discover More</Button>
            </div>

            <div className="space-y-3">
              {followedArtists.map((artist) => (
                <Card key={artist.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{artist.name}</h4>
                        <p className="text-sm text-muted-foreground">{artist.genre}</p>
                        <p className="text-xs text-muted-foreground">{artist.followers.toLocaleString()} followers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Listen
                      </Button>
                      <Button 
                        size="sm" 
                        variant={artist.isFollowing ? "default" : "outline"}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${artist.isFollowing ? 'fill-current' : ''}`} />
                        {artist.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Recommended Artists</h3>
              <p className="text-muted-foreground">Discover new artists based on your listening history</p>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-muted-foreground">Your recent interactions and listening activity</p>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Professional Consultation Modal
export const ConsultationManagementModal: React.FC<ModalProps> = ({ isOpen, onClose, user }) => {
  const [consultations] = useState([
    { id: 1, client: "Rising Artist", service: "Career Consultation", date: "2025-01-28", time: "2:00 PM", status: "confirmed" },
    { id: 2, client: "Indie Band", service: "Marketing Strategy", date: "2025-01-30", time: "10:00 AM", status: "pending" }
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consultation Management
          </DialogTitle>
          <DialogDescription>
            Manage your professional consultation appointments and services
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Upcoming Consultations</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Appointment
              </Button>
            </div>

            <div className="space-y-3">
              {consultations.map((consultation) => (
                <Card key={consultation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{consultation.client}</h4>
                      <p className="text-sm text-muted-foreground">{consultation.service}</p>
                      <p className="text-sm">
                        {consultation.date} at {consultation.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={consultation.status === 'confirmed' ? 'default' : 'secondary'}>
                        {consultation.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Availability Schedule</h3>
              <p className="text-muted-foreground">Set your available times for consultations</p>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Service Management</h3>
              <p className="text-muted-foreground">Manage your consultation services and pricing</p>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Client Management</h3>
              <p className="text-muted-foreground">Manage your consultation clients and history</p>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};