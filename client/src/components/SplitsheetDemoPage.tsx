import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AuthenticSplitsheetForm from './AuthenticSplitsheetForm';
import { SplitsheetSigningModal } from './SplitsheetSigningModal';
import { 
  FileText, Users, Music, Building, 
  CheckCircle, Clock, Eye, Signature,
  Volume2, VolumeX 
} from 'lucide-react';

export function SplitsheetDemoPage() {
  const [currentView, setCurrentView] = useState<'overview' | 'create' | 'sign' | 'dj-access'>('overview');
  const [splitsheetId, setSplitsheetId] = useState<number | null>(null);
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<{
    name: string;
    role: string;
    percentage: number;
  } | null>(null);

  // Demo splitsheet data for workflow demonstration
  const demoSplitsheet = {
    id: 1,
    songTitle: "What Do We Do",
    songReference: "DM-WTM-25-00001",
    status: "pending_signatures",
    parties: [
      { name: "Lianne Letang", role: "songwriter", percentage: 50, signed: true },
      { name: "Marcus Thompson", role: "melody_creator", percentage: 25, signed: false },
      { name: "Janet Azzouz", role: "beat_creator", percentage: 25, signed: false }
    ],
    publishing: {
      waitumusic: 100,
      note: "Default publishing rights to Wai'tuMusic unless represented by other PRO"
    },
    djAccess: false,
    fullySigned: false
  };

  const handleCreateSplitsheet = (newSplitsheetId: number) => {
    setSplitsheetId(newSplitsheetId);
    setCurrentView('sign');
  };

  const handleSignParty = (party: { name: string; role: string; percentage: number }) => {
    setSelectedParty(party);
    setSigningModalOpen(true);
  };

  const handleSigningComplete = () => {
    setSigningModalOpen(false);
    setSelectedParty(null);
    // Update party status in real implementation
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-8 w-8" />
          Splitsheet Management System
        </h1>
        <p className="text-muted-foreground">
          Complete workflow demonstration: Creation → Signing → DJ Song Access
        </p>
        
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant={currentView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('overview')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={currentView === 'create' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('create')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create
          </Button>
          <Button
            variant={currentView === 'sign' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('sign')}
          >
            <Signature className="h-4 w-4 mr-2" />
            Sign
          </Button>
          <Button
            variant={currentView === 'dj-access' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('dj-access')}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            DJ Access
          </Button>
        </div>
      </div>

      {/* Overview */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wai'tuMusic Splitsheet Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold">Songwriters/Authors</h3>
                  <Badge className="bg-blue-500 text-white">50%</Badge>
                  <p className="text-sm mt-2">People who wrote lyrics</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold">Melody Creators</h3>
                  <Badge className="bg-green-500 text-white">25%</Badge>
                  <p className="text-sm mt-2">Created the melody</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-semibold">Beat/Production</h3>
                  <Badge className="bg-purple-500 text-white">25%</Badge>
                  <p className="text-sm mt-2">Beat makers, producers</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold">Publishing Rights</h3>
                  <Badge>100% Wai'tuMusic</Badge>
                  <p className="text-sm mt-2">Unless represented by other PRO</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Digital Signature System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-semibold">Upload PNG</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload transparent PNG signature
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Signature className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-semibold">Draw Signature</h4>
                  <p className="text-sm text-muted-foreground">
                    Draw with mouse or touch
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-semibold">Type Name</h4>
                  <p className="text-sm text-muted-foreground">
                    Italicized font signature
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DJ Song Access Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h4 className="font-semibold">Automatic DJ Access</h4>
                    <p className="text-sm text-muted-foreground">
                      DJs get access to songs only when splitsheets are fully signed
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-white">
                  Complete Workflow
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Splitsheet */}
      {currentView === 'create' && (
        <AuthenticSplitsheetForm
          onSuccess={() => handleCreateSplitsheet(1)}
        />
      )}

      {/* Signing Interface */}
      {currentView === 'sign' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signature className="h-5 w-5" />
                Splitsheet Signing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Song Information</h4>
                  <p><strong>Title:</strong> {mockSplitsheet.songTitle}</p>
                  <p><strong>ISRC:</strong> {mockSplitsheet.songReference}</p>
                  <p><strong>Status:</strong> 
                    <Badge variant={mockSplitsheet.fullySigned ? "default" : "secondary"} className="ml-2">
                      {mockSplitsheet.fullySigned ? "Fully Signed" : "Pending Signatures"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Progress</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(mockSplitsheet.parties.filter(p => p.signed).length / mockSplitsheet.parties.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">
                      {mockSplitsheet.parties.filter(p => p.signed).length}/{mockSplitsheet.parties.length}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-3">Required Signatures</h4>
                <div className="space-y-3">
                  {mockSplitsheet.parties.map((party, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${party.signed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <div className="font-medium">{party.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {party.role.replace('_', ' ')} • {party.percentage}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {party.signed ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Signed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSignParty(party)}
                          >
                            <Signature className="h-4 w-4 mr-2" />
                            Sign Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DJ Access */}
      {currentView === 'dj-access' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mockSplitsheet.fullySigned ? (
                  <Volume2 className="h-5 w-5 text-green-500" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-500" />
                )}
                DJ Song Access Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSplitsheet.fullySigned ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      DJ Access Granted
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    All parties have signed the splitsheet. DJs can now access this song for setlists.
                  </p>
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="text-sm space-y-1">
                      <div><strong>Song:</strong> {mockSplitsheet.songTitle}</div>
                      <div><strong>Access Code:</strong> DJ-SONG-123456789</div>
                      <div><strong>Original Audio:</strong> Available</div>
                      <div><strong>Vocal-Removed:</strong> Available</div>
                      <div><strong>Expires:</strong> 30 days from signing completion</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                      DJ Access Pending
                    </span>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    DJs cannot access this song until all splitsheet parties have signed.
                  </p>
                  <div className="mt-3">
                    <div className="text-sm">
                      <strong>Remaining signatures needed:</strong> {mockSplitsheet.parties.filter(p => !p.signed).length}
                    </div>
                    <ul className="text-sm mt-2 space-y-1">
                      {mockSplitsheet.parties.filter(p => !p.signed).map((party, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          {party.name} ({party.role.replace('_', ' ')})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Management Tier Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Publisher Level</h4>
                  <Badge className="bg-blue-500 text-white mb-2">10% Discount</Badge>
                  <p className="text-sm text-muted-foreground">
                    ISRC service pricing discount for managed artists
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Representation Level</h4>
                  <Badge className="bg-green-500 text-white mb-2">50% Discount</Badge>
                  <p className="text-sm text-muted-foreground">
                    Enhanced pricing benefits for representation clients
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Full Management</h4>
                  <Badge className="bg-purple-500 text-white mb-2">100% Free</Badge>
                  <p className="text-sm text-muted-foreground">
                    Complete ISRC service coverage for managed talent
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Signing Modal */}
      {selectedParty && (
        <SplitsheetSigningModal
          isOpen={signingModalOpen}
          onClose={handleSigningComplete}
          splitsheetId={1}
          partyName={selectedParty.name}
          partyRole={selectedParty.role}
          ownershipPercentage={selectedParty.percentage}
        />
      )}
    </div>
  );
}