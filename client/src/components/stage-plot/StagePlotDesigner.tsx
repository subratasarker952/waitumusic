import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, Speaker, Music, Settings, Save, Download, Upload,
  Grid, Move, RotateCw, Trash2, Plus, Eye
} from 'lucide-react';

interface StageElement {
  id: string;
  type: 'instrument' | 'mic' | 'monitor' | 'equipment' | 'talent';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  assignedTo?: string;
}

interface StagePlotDesignerProps {
  bookingId: number;
  assignedUsers?: any[];
  canEdit?: boolean;
  userRole?: string;
  onSave?: (data: any) => void;
  onLoad?: (data: any) => void;
}

export default function StagePlotDesigner({ 
  bookingId, 
  assignedUsers = [], 
  canEdit = true, 
  userRole = 'user',
  onSave,
  onLoad 
}: StagePlotDesignerProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stageElements, setStageElements] = useState<StageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    drawStage();
  }, [stageElements, stageSize]);

  const drawStage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stage outline
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, stageSize.width, stageSize.height);
    
    // Add stage label
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('STAGE', 30, 40);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 20; x <= 20 + stageSize.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 20 + stageSize.height);
      ctx.stroke();
    }
    for (let y = 20; y <= 20 + stageSize.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(20 + stageSize.width, y);
      ctx.stroke();
    }

    // Draw elements
    stageElements.forEach(element => {
      ctx.fillStyle = element.id === selectedElement ? '#3b82f6' : element.color;
      ctx.fillRect(element.x, element.y, element.width, element.height);
      
      // Draw element border
      ctx.strokeStyle = element.id === selectedElement ? '#1d4ed8' : '#374151';
      ctx.lineWidth = 2;
      ctx.strokeRect(element.x, element.y, element.width, element.height);
      
      // Draw element label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        element.name, 
        element.x + element.width / 2, 
        element.y + element.height / 2 + 4
      );
    });
  };

  const addElement = (type: StageElement['type']) => {
    const newElement: StageElement = {
      id: Date.now().toString(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${stageElements.filter(el => el.type === type).length + 1}`,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 150,
      width: Math.min(70, type === 'mic' ? 30 : type === 'monitor' ? 40 : 60),
      height: Math.min(70, type === 'mic' ? 30 : type === 'monitor' ? 30 : 40),
      color: getElementColor(type)
    };
    setStageElements([...stageElements, newElement]);
  };

  const getElementColor = (type: StageElement['type']): string => {
    switch (type) {
      case 'instrument': return '#8B4513';
      case 'mic': return '#FF6B6B';
      case 'monitor': return '#9B59B6';
      case 'equipment': return '#3498DB';
      case 'talent': return '#2ECC71';
      default: return '#45B7D1';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canEdit) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on an element
    const clickedElement = stageElements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );

    if (clickedElement) {
      setSelectedElement(clickedElement.id);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedElement.x,
        y: y - clickedElement.y
      });
    } else {
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElement || !canEdit) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - dragOffset.x;
    const y = event.clientY - rect.top - dragOffset.y;

    setStageElements(prev => prev.map(element => 
      element.id === selectedElement 
        ? { ...element, x: Math.max(20, Math.min(x, 20 + stageSize.width - element.width)), 
                       y: Math.max(20, Math.min(y, 20 + stageSize.height - element.height)) }
        : element
    ));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const deleteElement = () => {
    if (selectedElement) {
      setStageElements(prev => prev.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const saveStagePlot = () => {
    const plotData = {
      bookingId,
      stageSize,
      elements: stageElements,
      timestamp: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(plotData);
    }
    
    toast({
      title: "Stage Plot Saved",
      description: "Your stage plot has been saved successfully."
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stage Plot Designer</h3>
        <div className="flex gap-2">
          <Button onClick={saveStagePlot} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Plot
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Grid className="h-4 w-4 mr-2" />
                Stage Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={500}
                height={400}
                className="border border-gray-300 cursor-crosshair"
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
              />
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Add Elements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => addElement('instrument')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={!canEdit}
              >
                <Music className="h-4 w-4 mr-2" />
                Instrument
              </Button>
              <Button 
                onClick={() => addElement('mic')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={!canEdit}
              >
                <Mic className="h-4 w-4 mr-2" />
                Microphone
              </Button>
              <Button 
                onClick={() => addElement('monitor')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={!canEdit}
              >
                <Speaker className="h-4 w-4 mr-2" />
                Monitor
              </Button>
              <Button 
                onClick={() => addElement('equipment')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={!canEdit}
              >
                <Settings className="h-4 w-4 mr-2" />
                Equipment
              </Button>
              <Button 
                onClick={() => addElement('talent')} 
                variant="outline" 
                className="w-full justify-start"
                disabled={!canEdit}
              >
                <Plus className="h-4 w-4 mr-2" />
                Talent Position
              </Button>
            </CardContent>
          </Card>

          {/* Stage Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stage Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium">Width</label>
                <Input 
                  type="number" 
                  value={stageSize.width} 
                  onChange={(e) => setStageSize(prev => ({ ...prev, width: parseInt(e.target.value) || 400 }))}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Height</label>
                <Input 
                  type="number" 
                  value={stageSize.height} 
                  onChange={(e) => setStageSize(prev => ({ ...prev, height: parseInt(e.target.value) || 300 }))}
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Element */}
          {selectedElement && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Element</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(() => {
                  const element = stageElements.find(el => el.id === selectedElement);
                  if (!element) return null;
                  
                  return (
                    <>
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input 
                          value={element.name} 
                          onChange={(e) => setStageElements(prev => prev.map(el => 
                            el.id === selectedElement ? { ...el, name: e.target.value } : el
                          ))}
                          disabled={!canEdit}
                        />
                      </div>
                      <Button 
                        onClick={deleteElement} 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        disabled={!canEdit}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Element
                      </Button>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Stage Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stage Legend ({stageElements.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stageElements.map(element => (
                  <div 
                    key={element.id}
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                      selectedElement === element.id ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: element.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {element.name}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {element.type}
                          {element.assignedTo && ` • Assigned to ${element.assignedTo}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(element.x)}, {Math.round(element.y)}
                    </div>
                  </div>
                ))}
                {stageElements.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No stage elements added yet</p>
                    <p className="text-xs">Add instruments, mics, or equipment to build your stage plot</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}