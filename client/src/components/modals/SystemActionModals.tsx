import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Database, 
  Shield, 
  Activity,
  Users,
  Music,
  FileText,
  Mail,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Search,
  Download,
  Upload,
  Trash2,
  Eye,
  Edit,
  Plus
} from "lucide-react";

// System Configuration Modal
interface SystemConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configType: 'database' | 'security' | 'performance' | 'backup';
}

export function SystemConfigModal({ open, onOpenChange, configType }: SystemConfigModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [configData, setConfigData] = useState<any>({});

  const getConfigTitle = () => {
    const titles = {
      database: 'Database Configuration',
      security: 'Security Settings',
      performance: 'Performance Optimization',
      backup: 'Backup Management'
    };
    return titles[configType];
  };

  const getConfigIcon = () => {
    const icons = {
      database: Database,
      security: Shield,
      performance: Activity,
      backup: Download
    };
    const Icon = icons[configType];
    return <Icon className="h-5 w-5" />;
  };

  const handleConfigSave = async () => {
    setIsProcessing(true);
    try {
      // Call appropriate API endpoint based on config type
      const response = await fetch(`/api/admin/system-config/${configType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('System configuration failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getConfigIcon()}
            {getConfigTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {configType === 'database' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="db-url">Database URL</Label>
                <Input 
                  id="db-url" 
                  type="password"
                  placeholder="postgresql://..."
                  value={configData.url || ''}
                  onChange={(e) => setConfigData({...configData, url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="pool-size">Connection Pool Size</Label>
                <Input 
                  id="pool-size" 
                  type="number"
                  placeholder="10"
                  value={configData.poolSize || ''}
                  onChange={(e) => setConfigData({...configData, poolSize: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="timeout">Query Timeout (ms)</Label>
                <Input 
                  id="timeout" 
                  type="number"
                  placeholder="30000"
                  value={configData.timeout || ''}
                  onChange={(e) => setConfigData({...configData, timeout: parseInt(e.target.value)})}
                />
              </div>
            </div>
          )}

          {configType === 'security' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="jwt-secret">JWT Secret</Label>
                <Input 
                  id="jwt-secret" 
                  type="password"
                  placeholder="Enter new JWT secret"
                  value={configData.jwtSecret || ''}
                  onChange={(e) => setConfigData({...configData, jwtSecret: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Input 
                  id="session-timeout" 
                  type="number"
                  placeholder="24"
                  value={configData.sessionTimeout || ''}
                  onChange={(e) => setConfigData({...configData, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="two-factor"
                  checked={configData.twoFactorEnabled || false}
                  onChange={(e) => setConfigData({...configData, twoFactorEnabled: e.target.checked})}
                />
                <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
              </div>
            </div>
          )}

          {configType === 'performance' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cache-size">Cache Size (MB)</Label>
                <Input 
                  id="cache-size" 
                  type="number"
                  placeholder="256"
                  value={configData.cacheSize || ''}
                  onChange={(e) => setConfigData({...configData, cacheSize: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="compression">Compression Level</Label>
                <Select value={configData.compression || ''} onValueChange={(value) => setConfigData({...configData, compression: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compression level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="cdn-enabled"
                  checked={configData.cdnEnabled || false}
                  onChange={(e) => setConfigData({...configData, cdnEnabled: e.target.checked})}
                />
                <Label htmlFor="cdn-enabled">Enable CDN</Label>
              </div>
            </div>
          )}

          {configType === 'backup' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select value={configData.frequency || ''} onValueChange={(value) => setConfigData({...configData, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select backup frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="retention">Retention Period (days)</Label>
                <Input 
                  id="retention" 
                  type="number"
                  placeholder="30"
                  value={configData.retention || ''}
                  onChange={(e) => setConfigData({...configData, retention: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="storage-location">Storage Location</Label>
                <Input 
                  id="storage-location" 
                  placeholder="s3://backup-bucket/..."
                  value={configData.storageLocation || ''}
                  onChange={(e) => setConfigData({...configData, storageLocation: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfigSave} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// User Management Modal
interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view' | 'delete';
  userData?: any;
  onUserAction?: (action: string, data?: any) => void;
}

export function UserManagementModal({ 
  open, 
  onOpenChange, 
  mode, 
  userData,
  onUserAction 
}: UserManagementModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState(userData || {
    email: '',
    name: '',
    role: '',
    status: 'active'
  });

  const getModalTitle = () => {
    const titles = {
      create: 'Create New User',
      edit: 'Edit User',
      view: 'User Details',
      delete: 'Delete User'
    };
    return titles[mode];
  };

  const handleUserAction = async () => {
    setIsProcessing(true);
    try {
      let endpoint = '/api/admin/users';
      let method = 'POST';
      
      if (mode === 'edit') {
        endpoint = `/api/admin/users/${userData?.id}`;
        method = 'PATCH';
      } else if (mode === 'delete') {
        endpoint = `/api/admin/users/${userData?.id}`;
        method = 'DELETE';
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: mode !== 'delete' ? JSON.stringify(formData) : undefined
      });

      if (response.ok) {
        onUserAction?.(mode, formData);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('User action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {mode === 'delete' ? (
            <div className="text-center py-4">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Confirm User Deletion</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete user "{userData?.name || userData?.email}"? 
                This action cannot be undone.
              </p>
            </div>
          ) : mode === 'view' ? (
            <div className="space-y-3">
              <div>
                <Label>Email</Label>
                <div className="p-2 bg-muted rounded">{userData?.email}</div>
              </div>
              <div>
                <Label>Name</Label>
                <div className="p-2 bg-muted rounded">{userData?.name}</div>
              </div>
              <div>
                <Label>Role</Label>
                <div className="p-2 bg-muted rounded">{userData?.role}</div>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={userData?.status === 'active' ? 'default' : 'secondary'}>
                  {userData?.status}
                </Badge>
              </div>
              <div>
                <Label>Created</Label>
                <div className="p-2 bg-muted rounded">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={mode === 'edit'}
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fan">Fan</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="musician">Musician</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button 
                onClick={handleUserAction} 
                disabled={isProcessing}
                variant={mode === 'delete' ? 'destructive' : 'default'}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === 'delete' ? 'Deleting...' : 'Saving...'}
                  </>
                ) : mode === 'delete' ? (
                  'Delete User'
                ) : mode === 'create' ? (
                  'Create User'
                ) : (
                  'Update User'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Media Management Modal
interface MediaManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaType: 'photos' | 'videos' | 'documents' | 'audio';
}

export function MediaManagementModal({ open, onOpenChange, mediaType }: MediaManagementModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const getMediaTitle = () => {
    const titles = {
      photos: 'Photo Gallery Management',
      videos: 'Video Library Management', 
      documents: 'Document Management',
      audio: 'Audio File Management'
    };
    return titles[mediaType];
  };

  const getMediaIcon = () => {
    const icons = {
      photos: Eye,
      videos: FileText,
      documents: FileText,
      audio: Music
    };
    const Icon = icons[mediaType];
    return <Icon className="h-5 w-5" />;
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadingFiles(files);
    setIsLoading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', mediaType);

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          setMediaItems(prev => [...prev, result]);
        }
      }
    } catch (error) {
      console.error('Media upload failed:', error);
    } finally {
      setIsLoading(false);
      setUploadingFiles([]);
    }
  };

  const handleFileDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item.id !== mediaId));
      }
    } catch (error) {
      console.error('Media deletion failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getMediaIcon()}
            {getMediaTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload {mediaType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept={mediaType === 'photos' ? 'image/*' : mediaType === 'videos' ? 'video/*' : mediaType === 'audio' ? 'audio/*' : '*/*'}
                  onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Click to upload {mediaType}</p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop files here, or click to select
                  </p>
                </label>
              </div>
              
              {uploadingFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading {uploadingFiles.length} files...</span>
                  </div>
                  <div className="space-y-1">
                    {uploadingFiles.map((file, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uploaded {mediaType}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {mediaItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {mediaType} uploaded yet
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center">
                          {getMediaIcon()}
                        </div>
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.size}</div>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline" className="h-6 px-2">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 px-2"
                            onClick={() => handleFileDelete(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Email Configuration Modal  
interface EmailConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailConfigModal({ open, onOpenChange }: EmailConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [configData, setConfigData] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Wai\'tuMusic',
    encryption: 'tls'
  });

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Email configuration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="smtp-host">SMTP Host</Label>
            <Input 
              id="smtp-host" 
              placeholder="smtp.gmail.com"
              value={configData.smtpHost}
              onChange={(e) => setConfigData({...configData, smtpHost: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="smtp-port">SMTP Port</Label>
            <Input 
              id="smtp-port" 
              type="number"
              placeholder="587"
              value={configData.smtpPort}
              onChange={(e) => setConfigData({...configData, smtpPort: parseInt(e.target.value)})}
            />
          </div>
          
          <div>
            <Label htmlFor="smtp-username">Username</Label>
            <Input 
              id="smtp-username" 
              type="email"
              placeholder="your-email@gmail.com"
              value={configData.smtpUsername}
              onChange={(e) => setConfigData({...configData, smtpUsername: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="smtp-password">Password</Label>
            <Input 
              id="smtp-password" 
              type="password"
              placeholder="App password"
              value={configData.smtpPassword}
              onChange={(e) => setConfigData({...configData, smtpPassword: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="from-email">From Email</Label>
            <Input 
              id="from-email" 
              type="email"
              placeholder="noreply@waitumusic.com"
              value={configData.fromEmail}
              onChange={(e) => setConfigData({...configData, fromEmail: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="from-name">From Name</Label>
            <Input 
              id="from-name" 
              placeholder="Wai'tuMusic"
              value={configData.fromName}
              onChange={(e) => setConfigData({...configData, fromName: e.target.value})}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}