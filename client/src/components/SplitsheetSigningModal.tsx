import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { 
  Upload, Pencil, Type, CheckCircle, 
  FileText, Users, Building 
} from 'lucide-react';

interface SplitsheetSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  splitsheetId: number;
  partyName: string;
  partyRole: string;
  ownershipPercentage: number;
  accessToken?: string;
}

export function SplitsheetSigningModal({ 
  isOpen, 
  onClose, 
  splitsheetId, 
  partyName, 
  partyRole, 
  ownershipPercentage,
  accessToken 
}: SplitsheetSigningModalProps) {
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw' | 'type'>('upload');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureText, setSignatureText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();

  const signSplitsheetMutation = useMutation({
    mutationFn: async (signatureData: {
      signatureMode: string;
      signatureFile?: File;
      signatureText?: string;
      signatureDrawing?: string;
    }) => {
      const formData = new FormData();
      formData.append('splitsheetId', splitsheetId.toString());
      formData.append('partyName', partyName);
      formData.append('partyRole', partyRole);
      formData.append('signatureMode', signatureData.signatureMode);
      
      if (signatureData.signatureFile) {
        formData.append('signatureFile', signatureData.signatureFile);
      }
      if (signatureData.signatureText) {
        formData.append('signatureText', signatureData.signatureText);
      }
      if (signatureData.signatureDrawing) {
        formData.append('signatureDrawing', signatureData.signatureDrawing);
      }
      if (accessToken) {
        formData.append('accessToken', accessToken);
      }

      const response = await fetch('/api/splitsheet-sign', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign splitsheet');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Signature Recorded",
        description: "Your signature has been successfully recorded on the splitsheet."
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Signing Failed",
        description: error.message || "Failed to record signature",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSignatureFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PNG or JPEG image file",
        variant: "destructive"
      });
    }
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = () => {
    let signatureData: any = { signatureMode };
    
    switch (signatureMode) {
      case 'upload':
        if (!signatureFile) {
          toast({
            title: "Missing Signature",
            description: "Please upload a signature image",
            variant: "destructive"
          });
          return;
        }
        signatureData.signatureFile = signatureFile;
        break;
        
      case 'draw':
        const canvas = canvasRef.current;
        if (!canvas) return;
        signatureData.signatureDrawing = canvas.toDataURL();
        break;
        
      case 'type':
        if (!signatureText.trim()) {
          toast({
            title: "Missing Signature",
            description: "Please enter your name for the typed signature",
            variant: "destructive"
          });
          return;
        }
        signatureData.signatureText = signatureText;
        break;
    }
    
    signSplitsheetMutation.mutate(signatureData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sign Splitsheet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Splitsheet Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Role in this Splitsheet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Your Name</Label>
                  <div className="text-lg">{partyName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Your Role</Label>
                  <Badge className="capitalize">{partyRole.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ownership %</Label>
                  <div className="text-lg font-bold">{ownershipPercentage}%</div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Wai'tuMusic Publishing Policy</h4>
                <p className="text-sm">
                  By signing this splitsheet, you acknowledge that publishing rights default to 100% Wai'tuMusic 
                  unless you are represented by another PRO. Your composition ownership percentage above refers 
                  to songwriter/creator credits only.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Signature Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Signature Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={signatureMode} onValueChange={(value) => setSignatureMode(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload PNG
                  </TabsTrigger>
                  <TabsTrigger value="draw" className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Draw
                  </TabsTrigger>
                  <TabsTrigger value="type" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Type
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div>
                    <Label htmlFor="signature-upload">Upload Transparent PNG Signature</Label>
                    <Input
                      id="signature-upload"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                    {signatureFile && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ File selected: {signatureFile.name}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="draw" className="space-y-4">
                  <div>
                    <Label>Draw Your Signature</Label>
                    <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="border border-gray-300 cursor-crosshair w-full"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearCanvas}
                        className="mt-2"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="type" className="space-y-4">
                  <div>
                    <Label htmlFor="signature-text">Type Your Full Legal Name</Label>
                    <Input
                      id="signature-text"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      placeholder="Enter your full legal name"
                      className="mt-2 font-serif text-xl italic"
                      style={{ fontFamily: 'Georgia, serif' }}
                    />
                    {signatureText && (
                      <div className="mt-2 p-3 border rounded bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-muted-foreground mb-1">Preview:</div>
                        <div className="text-2xl font-serif italic" style={{ fontFamily: 'Georgia, serif' }}>
                          {signatureText}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSign} 
              disabled={signSplitsheetMutation.isPending}
              className="flex-1"
            >
              {signSplitsheetMutation.isPending ? (
                "Recording Signature..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sign Splitsheet
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}