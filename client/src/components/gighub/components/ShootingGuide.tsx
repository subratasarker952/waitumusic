import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Video, Target, Clock, Users, 
  Lightbulb, MapPin, Download, Eye
} from 'lucide-react';

interface Talent {
  id: number;
  name: string;
  role: string;
  instrument?: string;
  isMainTalent?: boolean;
  position?: string;
}

interface ShootingGuideProps {
  bookingId: number;
  eventDetails: any;
  assignedTalent: Talent[];
}

export function ShootingGuide({ bookingId, eventDetails, assignedTalent = [] }: ShootingGuideProps) {
  // Group talent by importance
  const mainTalent = assignedTalent.filter(t => t.isMainTalent);
  const supportingTalent = assignedTalent.filter(t => !t.isMainTalent);

  const shootingTips = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Primary Focus",
      content: "Maintain 60% coverage on main talent, 30% on supporting acts, 10% crowd reactions"
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: "Key Shots",
      content: "Wide establishing shots, close-ups during solos, crowd engagement moments"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Timing",
      content: "Arrive 30 mins early for setup shots, capture soundcheck if permitted"
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Lighting",
      content: "Expect dramatic stage lighting changes, adjust ISO accordingly"
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Professional Shooting Guide</CardTitle>
          <CardDescription>
            AI-powered recommendations for optimal coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="focus" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="focus">Focus Priority</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="focus" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Main Talent Priority
                  </h4>
                  {mainTalent.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No main talent assigned yet</p>
                  ) : (
                    <div className="space-y-2">
                      {mainTalent.map((talent, index) => (
                        <Card key={talent.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold text-primary">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{talent.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {talent.role} {talent.instrument && `• ${talent.instrument}`}
                                </p>
                              </div>
                            </div>
                            <Badge variant="default">Primary Focus</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Supporting Talent</h4>
                  {supportingTalent.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No supporting talent assigned</p>
                  ) : (
                    <div className="grid gap-2">
                      {supportingTalent.map((talent) => (
                        <div key={talent.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{talent.name} - {talent.role}</span>
                          <Badge variant="outline">Secondary</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Recommended Positions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium">Position 1: Stage Front Center</p>
                        <p className="text-muted-foreground">Best for main artist close-ups and crowd reactions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium">Position 2: Stage Left Wing</p>
                        <p className="text-muted-foreground">Ideal for guitarist solos and band interactions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium">Position 3: FOH (Front of House)</p>
                        <p className="text-muted-foreground">Wide shots showing full stage and crowd</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Venue Map
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-3">Event Timeline</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="text-sm font-medium w-16">6:00 PM</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Doors Open</p>
                      <p className="text-xs text-muted-foreground">Capture venue atmosphere, early arrivals</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-sm font-medium w-16">7:00 PM</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Opening Act</p>
                      <p className="text-xs text-muted-foreground">Wide shots, test lighting conditions</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-sm font-medium w-16">8:30 PM</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Main Performance</p>
                      <p className="text-xs text-muted-foreground">Full coverage as per shooting guide</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-sm font-medium w-16">10:30 PM</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Encore & Wrap</p>
                      <p className="text-xs text-muted-foreground">Final shots, crowd exit, venue empty</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Quick Tips</h4>
            <div className="grid gap-2">
              {shootingTips.map((tip, index) => (
                <Card key={index} className="p-3">
                  <div className="flex gap-3">
                    <div className="text-primary">{tip.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{tip.title}</p>
                      <p className="text-xs text-muted-foreground">{tip.content}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}