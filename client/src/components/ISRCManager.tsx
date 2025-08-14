import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Hash, Music, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ISRCCode {
  id: number;
  code?: string;
  songTitle?: string;
  artistName?: string;
  status: string;
  createdAt: Date;
}

export default function ISRCManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [newISRC, setNewISRC] = useState({
    songTitle: '',
    artistName: '',
    releaseYear: new Date().getFullYear(),
    recordingType: 'original'
  });

  const queryClient = useQueryClient();

  const { data: isrcCodes, isLoading } = useQuery({
    queryKey: ['/api/isrc-codes'],
    queryFn: () => apiRequest('/api/isrc-codes')
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/isrc-codes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/isrc-codes'] });
      setIsCreateOpen(false);
      setNewISRC({
        songTitle: '',
        artistName: '',
        releaseYear: new Date().getFullYear(),
        recordingType: 'original'
      });
    }
  });

  const generateISRCCode = (songTitle: string, year: number) => {
    // DM-WTM-YY-XXXXX format (Dominica-WaituMusic-Year-Sequential)
    const yearShort = year.toString().slice(-2);
    const sequential = Math.floor(Math.random() * 90000) + 10000;
    return `DM-WTM-${yearShort}-${sequential}`;
  };

  const handleCreate = () => {
    if (!newISRC.songTitle || !newISRC.artistName) return;
    
    const generatedCode = generateISRCCode(newISRC.songTitle, newISRC.releaseYear);
    createMutation.mutate({
      ...newISRC,
      code: generatedCode
    });
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) return <div>Loading ISRC codes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ISRC Code Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate ISRC Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New ISRC Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="songTitle">Song Title</Label>
                <Input
                  id="songTitle"
                  value={newISRC.songTitle}
                  onChange={(e) => setNewISRC(prev => ({ ...prev, songTitle: e.target.value }))}
                  placeholder="Enter song title"
                />
              </div>
              
              <div>
                <Label htmlFor="artistName">Artist Name</Label>
                <Input
                  id="artistName"
                  value={newISRC.artistName}
                  onChange={(e) => setNewISRC(prev => ({ ...prev, artistName: e.target.value }))}
                  placeholder="Enter artist name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="releaseYear">Release Year</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    min="1900"
                    max="2030"
                    value={newISRC.releaseYear}
                    onChange={(e) => setNewISRC(prev => ({ ...prev, releaseYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                  />
                </div>
                <div>
                  <Label htmlFor="recordingType">Recording Type</Label>
                  <Select
                    value={newISRC.recordingType}
                    onValueChange={(value) => setNewISRC(prev => ({ ...prev, recordingType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original Recording</SelectItem>
                      <SelectItem value="remix">Remix</SelectItem>
                      <SelectItem value="remaster">Remaster</SelectItem>
                      <SelectItem value="live">Live Recording</SelectItem>
                      <SelectItem value="cover">Cover Version</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Preview ISRC Code:</h3>
                <code className="text-lg font-mono bg-white px-3 py-2 rounded border">
                  {newISRC.songTitle ? generateISRCCode(newISRC.songTitle, newISRC.releaseYear) : 'DM-WTM-XX-XXXXX'}
                </code>
                <p className="text-xs text-gray-600 mt-2">
                  Format: DM (Dominica) - WTM (WaituMusic) - YY (Year) - XXXXX (Sequential)
                </p>
              </div>

              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Generating...' : 'Generate ISRC Code'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(isrcCodes) && isrcCodes.length > 0 ? (
          isrcCodes.map((isrc: ISRCCode) => (
            <Card key={isrc.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  {isrc.songTitle || `ISRC #${isrc.id}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isrc.code && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <code className="font-mono text-sm">{isrc.code}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(isrc.code!)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCode === isrc.code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {isrc.artistName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Music className="w-4 h-4" />
                      {isrc.artistName}
                    </div>
                  )}
                  
                  <Badge variant={isrc.status === 'generated' ? 'default' : 'secondary'}>
                    {isrc.status}
                  </Badge>
                  
                  <p className="text-xs text-gray-500">
                    Generated: {new Date(isrc.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Register
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Hash className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No ISRC codes found. Generate your first code!</p>
          </div>
        )}
      </div>
    </div>
  );
}