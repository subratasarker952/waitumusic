import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Video, 
  Users, 
  Plus, 
  Send, 
  File, 
  Music, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  Upload,
  Download,
  Share2,
  Settings,
  UserPlus,
  Mic,
  Play,
  Pause,
  Volume2,
  Eye,
  GitBranch,
  Calendar,
  Tag,
  Star
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Room {
  id: number;
  name: string;
  description: string;
  roomType: string;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  participants: any[];
  lastMessage?: any;
}

interface Message {
  id: number;
  roomId: number;
  userId: number;
  message: string;
  messageType: string;
  metadata?: any;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface Project {
  id: number;
  roomId: number;
  projectName: string;
  description: string;
  projectType: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  tasks: Task[];
  files: CollabFile[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo?: number;
  dueDate?: string;
  createdAt: string;
  assignedUser?: {
    fullName: string;
  };
}

interface CollabFile {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  version: number;
  description: string;
  uploadedAt: string;
  uploadedBy: number;
  uploaderName: string;
}

export default function Collaboration() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState('project');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch collaboration rooms
  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/collaboration/rooms'],
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  // Fetch messages for selected room
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/collaboration/messages', selectedRoom?.id],
    enabled: !!selectedRoom,
    refetchInterval: 2000, // Poll every 2 seconds for real-time messages
  });

  // Fetch projects for selected room
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/collaboration/projects', selectedRoom?.id],
    enabled: !!selectedRoom,
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; roomType: string }) => {
      return apiRequest('/api/collaboration/rooms', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/rooms'] });
      setIsCreateRoomOpen(false);
      setNewRoomName('');
      setNewRoomDescription('');
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { roomId: number; message: string; messageType?: string }) => {
      return apiRequest('/api/collaboration/messages', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/messages', selectedRoom?.id] });
      setMessageInput('');
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { roomId: number; projectName: string; description: string; projectType: string; dueDate?: string }) => {
      return apiRequest('/api/collaboration/projects', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/projects', selectedRoom?.id] });
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!selectedRoom || !messageInput.trim()) return;
    
    sendMessageMutation.mutate({
      roomId: selectedRoom.id,
      message: messageInput.trim(),
      messageType: 'text',
    });
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    
    createRoomMutation.mutate({
      name: newRoomName.trim(),
      description: newRoomDescription.trim(),
      roomType: newRoomType,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time Collaboration</h1>
        <p className="text-gray-600">
          Collaborate with artists, musicians, and professionals in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
        {/* Rooms Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rooms</h2>
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Collaboration Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Room Name</label>
                    <Input
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="Describe the purpose of this room"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Room Type</label>
                    <select
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="project">Project</option>
                      <option value="session">Recording Session</option>
                      <option value="song">Song Collaboration</option>
                    </select>
                  </div>
                  <Button 
                    onClick={handleCreateRoom} 
                    disabled={createRoomMutation.isPending}
                    className="w-full"
                  >
                    {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {rooms.map((room: Room) => (
              <Card 
                key={room.id} 
                className={`cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{room.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {room.roomType}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{room.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {room.participants?.length || 0}
                    </div>
                    {room.lastMessage && (
                      <span>{formatTime(room.lastMessage.createdAt)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {selectedRoom ? (
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="files">
                  <File className="w-4 h-4 mr-2" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="voice">
                  <Video className="w-4 h-4 mr-2" />
                  Voice & Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-[720px] flex flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span>{selectedRoom.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {selectedRoom.roomType}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-4">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages.map((message: Message) => (
                        <div key={message.id} className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {message.user.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">
                                {message.user.fullName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {message.message}
                            </p>
                            {message.messageType === 'file' && message.metadata && (
                              <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center space-x-2">
                                <File className="w-4 h-4" />
                                <span className="text-sm">{message.metadata.fileName}</span>
                                <Button size="sm" variant="ghost">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsRecording(!isRecording)}
                        className={isRecording ? 'bg-red-100 text-red-600' : ''}
                      >
                        {isRecording ? <Pause className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || !messageInput.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="h-[720px]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Projects</span>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto">
                    <div className="space-y-4">
                      {projects.map((project: Project) => (
                        <Card key={project.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">{project.projectName}</h3>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm mb-2">Tasks</h4>
                                <div className="space-y-2">
                                  {project.tasks?.slice(0, 3).map((task: Task) => (
                                    <div key={task.id} className="flex items-center space-x-2 text-sm">
                                      {getPriorityIcon(task.priority)}
                                      <span className="flex-1">{task.title}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {task.status}
                                      </Badge>
                                    </div>
                                  ))}
                                  {project.tasks?.length > 3 && (
                                    <p className="text-xs text-gray-500">
                                      +{project.tasks.length - 3} more tasks
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm mb-2">Recent Files</h4>
                                <div className="space-y-2">
                                  {project.files?.slice(0, 3).map((file: CollabFile) => (
                                    <div key={file.id} className="flex items-center space-x-2 text-sm">
                                      {file.fileType === 'audio' ? (
                                        <Music className="w-4 h-4 text-blue-500" />
                                      ) : (
                                        <File className="w-4 h-4 text-gray-500" />
                                      )}
                                      <span className="flex-1 truncate">{file.fileName}</span>
                                      <Button size="sm" variant="ghost">
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="h-[720px]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Shared Files</span>
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* File grid would be populated here */}
                      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Upload new files</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice" className="h-[720px]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Voice & Video Session</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Video className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium">Start Voice Session</h3>
                      <p className="text-gray-600">
                        Connect with your collaborators via voice and video
                      </p>
                      <div className="flex space-x-2 justify-center">
                        <Button>
                          <Mic className="w-4 h-4 mr-2" />
                          Voice Only
                        </Button>
                        <Button variant="outline">
                          <Video className="w-4 h-4 mr-2" />
                          Video Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">Select a collaboration room</h3>
                  <p className="text-gray-600">
                    Choose a room from the sidebar to start collaborating
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}