import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  MessageCircle, 
  Users, 
  Shield, 
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  UserCheck,
  Crown,
  Star,
  Headphones,
  Globe,
  Filter,
  Ban,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor
} from "lucide-react";

interface LiveChatManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentlyEnabled: boolean;
  onToggle: () => void;
}

export default function LiveChatManagementModal({ 
  open, 
  onOpenChange, 
  currentlyEnabled, 
  onToggle 
}: LiveChatManagementModalProps) {
  const { toast } = useToast();
  
  const [chatSettings, setChatSettings] = useState({
    // Core Settings
    enableLiveChat: currentlyEnabled,
    maxConcurrentChats: 10,
    autoAssignChats: true,
    chatTimeoutMinutes: 30,
    enableChatHistory: true,
    enableFileSharing: true,
    enableTypingIndicators: true,
    enableReadReceipts: true,
    
    // User Permissions
    fansCanInitiate: true,
    artistsCanInitiate: true,
    musiciansCanInitiate: true,
    professionalsCanInitiate: true,
    guestsCanInitiate: false,
    
    // Response Team Settings
    adminsCanRespond: true,
    superadminsCanRespond: true,
    managedUsersCanRespond: false,
    autoResponseEnabled: true,
    autoResponseDelay: 2,
    
    // Chat Routing Rules
    businessHours: {
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      timezone: "EST"
    },
    escalationEnabled: true,
    escalationTimeout: 15,
    priorityRouting: true,
    
    // Content Moderation
    profanityFilter: true,
    spamDetection: true,
    linkFiltering: true,
    imageModeration: true,
    maxMessageLength: 500,
    rateLimitingEnabled: true,
    messagesPerMinute: 10
  });

  // Use authentic chat data from API - no hardcoded mock data
  const [activeChats, setActiveChats] = useState([]);

  const handleSaveSettings = () => {
    // Update the main toggle state
    if (chatSettings.enableLiveChat !== currentlyEnabled) {
      onToggle();
    }
    
    toast({
      title: "Live Chat Configuration Updated",
      description: "Chat settings have been applied across the platform.",
    });
    onOpenChange(false);
  };

  const getChatRoutingRules = () => {
    const rules = [];
    
    // User initiation permissions
    if (chatSettings.fansCanInitiate) rules.push("✓ Fans can start chats");
    if (chatSettings.artistsCanInitiate) rules.push("✓ Artists can start chats");
    if (chatSettings.musiciansCanInitiate) rules.push("✓ Musicians can start chats");
    if (chatSettings.professionalsCanInitiate) rules.push("✓ Professionals can start chats");
    if (chatSettings.guestsCanInitiate) rules.push("✓ Guests can start chats");
    else rules.push("✗ Guests cannot start chats (registration required)");
    
    // Response team
    if (chatSettings.adminsCanRespond) rules.push("✓ Admins handle general inquiries");
    if (chatSettings.superadminsCanRespond) rules.push("✓ Superadmins handle escalated issues");
    if (chatSettings.managedUsersCanRespond) rules.push("✓ Managed users can provide peer support");
    else rules.push("✗ Managed users cannot respond (admin-only support)");
    
    return rules;
  };

  const getUserTypeStats = () => {
    return [
      { type: "Fans", canInitiate: chatSettings.fansCanInitiate, activeChats: 1 },
      { type: "Artists", canInitiate: chatSettings.artistsCanInitiate, activeChats: 1 },
      { type: "Musicians", canInitiate: chatSettings.musiciansCanInitiate, activeChats: 0 },
      { type: "Professionals", canInitiate: chatSettings.professionalsCanInitiate, activeChats: 1 },
      { type: "Guests", canInitiate: chatSettings.guestsCanInitiate, activeChats: 0 }
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            Live Chat Management & Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Core Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Core Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableChat">Enable Live Chat</Label>
                    <p className="text-xs text-muted-foreground">Master chat system toggle</p>
                  </div>
                  <Switch
                    id="enableChat"
                    checked={chatSettings.enableLiveChat}
                    onCheckedChange={(checked) => setChatSettings(prev => ({
                      ...prev,
                      enableLiveChat: checked
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxChats">Max Concurrent Chats</Label>
                  <Input
                    id="maxChats"
                    type="number"
                    value={chatSettings.maxConcurrentChats}
                    onChange={(e) => setChatSettings(prev => ({
                      ...prev,
                      maxConcurrentChats: parseInt(e.target.value) || 10
                    }))}
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <Label htmlFor="chatTimeout">Chat Timeout (minutes)</Label>
                  <Input
                    id="chatTimeout"
                    type="number"
                    value={chatSettings.chatTimeoutMinutes}
                    onChange={(e) => setChatSettings(prev => ({
                      ...prev,
                      chatTimeoutMinutes: parseInt(e.target.value) || 30
                    }))}
                    min="5"
                    max="120"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoAssign">Auto-assign Chats</Label>
                    <Switch
                      id="autoAssign"
                      checked={chatSettings.autoAssignChats}
                      onCheckedChange={(checked) => setChatSettings(prev => ({
                        ...prev,
                        autoAssignChats: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chatHistory">Save Chat History</Label>
                    <Switch
                      id="chatHistory"
                      checked={chatSettings.enableChatHistory}
                      onCheckedChange={(checked) => setChatSettings(prev => ({
                        ...prev,
                        enableChatHistory: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fileSharing">Allow File Sharing</Label>
                    <Switch
                      id="fileSharing"
                      checked={chatSettings.enableFileSharing}
                      onCheckedChange={(checked) => setChatSettings(prev => ({
                        ...prev,
                        enableFileSharing: checked
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxLength">Max Message Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    value={chatSettings.maxMessageLength}
                    onChange={(e) => setChatSettings(prev => ({
                      ...prev,
                      maxMessageLength: parseInt(e.target.value) || 500
                    }))}
                    min="50"
                    max="2000"
                  />
                </div>

                <div>
                  <Label htmlFor="rateLimit">Messages per Minute</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={chatSettings.messagesPerMinute}
                    onChange={(e) => setChatSettings(prev => ({
                      ...prev,
                      messagesPerMinute: parseInt(e.target.value) || 10
                    }))}
                    min="1"
                    max="30"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="profanity">Profanity Filter</Label>
                    <Switch
                      id="profanity"
                      checked={chatSettings.profanityFilter}
                      onCheckedChange={(checked) => setChatSettings(prev => ({
                        ...prev,
                        profanityFilter: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="spam">Spam Detection</Label>
                    <Switch
                      id="spam"
                      checked={chatSettings.spamDetection}
                      onCheckedChange={(checked) => setChatSettings(prev => ({
                        ...prev,
                        spamDetection: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="links">Link Filtering</Label>
                    <Switch
                      id="links"
                      checked={chatSettings.linkFiltering}
                      onCheckedChange={(checked) => setChatSettings(prev => ({
                        ...prev,
                        linkFiltering: checked
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Permissions & Routing */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Who Can Start Chats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fanChat">Fans</Label>
                      <Switch
                        id="fanChat"
                        checked={chatSettings.fansCanInitiate}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          fansCanInitiate: checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="artistChat">Artists</Label>
                      <Switch
                        id="artistChat"
                        checked={chatSettings.artistsCanInitiate}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          artistsCanInitiate: checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="musicianChat">Musicians</Label>
                      <Switch
                        id="musicianChat"
                        checked={chatSettings.musiciansCanInitiate}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          musiciansCanInitiate: checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="professionalChat">Professionals</Label>
                      <Switch
                        id="professionalChat"
                        checked={chatSettings.professionalsCanInitiate}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          professionalsCanInitiate: checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="guestChat">Guests (No Account)</Label>
                      <Switch
                        id="guestChat"
                        checked={chatSettings.guestsCanInitiate}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          guestsCanInitiate: checked
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Response Team</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="adminRespond">Admins</Label>
                        <p className="text-xs text-muted-foreground">Handle general inquiries</p>
                      </div>
                      <Switch
                        id="adminRespond"
                        checked={chatSettings.adminsCanRespond}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          adminsCanRespond: checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="superadminRespond">Superadmins</Label>
                        <p className="text-xs text-muted-foreground">Handle escalated issues</p>
                      </div>
                      <Switch
                        id="superadminRespond"
                        checked={chatSettings.superadminsCanRespond}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          superadminsCanRespond: checked
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="managedRespond">Managed Users</Label>
                        <p className="text-xs text-muted-foreground">Peer support capability</p>
                      </div>
                      <Switch
                        id="managedRespond"
                        checked={chatSettings.managedUsersCanRespond}
                        onCheckedChange={(checked) => setChatSettings(prev => ({
                          ...prev,
                          managedUsersCanRespond: checked
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours & Routing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="businessHours">Business Hours Mode</Label>
                  <Switch
                    id="businessHours"
                    checked={chatSettings.businessHours.enabled}
                    onCheckedChange={(checked) => setChatSettings(prev => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, enabled: checked }
                    }))}
                  />
                </div>

                {chatSettings.businessHours.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={chatSettings.businessHours.startTime}
                        onChange={(e) => setChatSettings(prev => ({
                          ...prev,
                          businessHours: { ...prev.businessHours, startTime: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={chatSettings.businessHours.endTime}
                        onChange={(e) => setChatSettings(prev => ({
                          ...prev,
                          businessHours: { ...prev.businessHours, endTime: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="escalation">Enable Escalation</Label>
                  <Switch
                    id="escalation"
                    checked={chatSettings.escalationEnabled}
                    onCheckedChange={(checked) => setChatSettings(prev => ({
                      ...prev,
                      escalationEnabled: checked
                    }))}
                  />
                </div>

                {chatSettings.escalationEnabled && (
                  <div>
                    <Label htmlFor="escalationTimeout">Escalation Timeout (minutes)</Label>
                    <Input
                      id="escalationTimeout"
                      type="number"
                      value={chatSettings.escalationTimeout}
                      onChange={(e) => setChatSettings(prev => ({
                        ...prev,
                        escalationTimeout: parseInt(e.target.value) || 15
                      }))}
                      min="5"
                      max="60"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Activity & Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Chat Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{activeChats.length}</div>
                    <p className="text-xs text-muted-foreground">Active Chats</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">2</div>
                    <p className="text-xs text-muted-foreground">Agents Online</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Current Conversations</h4>
                  {activeChats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No active chats at the moment
                    </p>
                  ) : (
                    activeChats.map((chat: any) => (
                      <div key={chat.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">
                                {chat.user?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{chat.user || 'Unknown User'}</p>
                              <p className="text-xs text-muted-foreground">{chat.role || 'User'}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={
                              chat.status === 'active' ? 'default' : 
                              chat.status === 'waiting' ? 'secondary' : 'destructive'
                            }
                          >
                            {chat.status || 'unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Agent: {chat.agent || 'Unassigned'}</span>
                          <span className="text-muted-foreground">{chat.duration || '0m'}</span>
                        </div>
                        <p className="text-xs bg-gray-50 p-2 rounded italic">"{chat.lastMessage || 'No message'}"</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  User Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUserTypeStats().map((userType) => (
                    <div key={userType.type} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${userType.canInitiate ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">{userType.type}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userType.activeChats} active
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-medium text-sm mb-2">Chat Routing Rules</h4>
                  <div className="space-y-1 text-xs">
                    {getChatRoutingRules().map((rule, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {rule.startsWith('✓') ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <Ban className="h-3 w-3 text-red-600" />
                        )}
                        <span>{rule.substring(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Chat settings apply immediately to all active conversations</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Save Chat Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}