import React from 'react';
import { useParams, useLocation } from 'wouter';
import { PostUploadMerchandiseAssigner } from '@/components/PostUploadMerchandiseAssigner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Music, ArrowLeft, Package } from 'lucide-react';

interface AlbumUploadCompleteProps {
  albumId?: number;
  artistUserId?: number;
}

const AlbumUploadComplete: React.FC<AlbumUploadCompleteProps> = () => {
  const params = useParams();
  const [location, navigate] = useLocation();
  
  // Extract albumId and artistUserId from URL params or query
  const albumId = params.albumId ? parseInt(params.albumId) : undefined;
  const urlParams = new URLSearchParams(window.location.search);
  const artistUserId = urlParams.get('artistUserId') ? parseInt(urlParams.get('artistUserId')!) : undefined;

  if (!albumId || !artistUserId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Album upload information not found.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAssignmentComplete = () => {
    // Optional: Show success message or refresh assignments
    console.log('Merchandise assignment completed');
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Upload Success Header */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
            <CheckCircle2 className="h-6 w-6" />
            <span>Album Upload Successful!</span>
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Your album has been successfully uploaded and is now available on your profile. 
            You can now link merchandise items to create promotional opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              <Music className="h-3 w-3 mr-1" />
              Album Live
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              <Package className="h-3 w-3 mr-1" />
              Ready for Merchandising
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Post-Upload Merchandise Assignment System */}
      <PostUploadMerchandiseAssigner
        albumId={albumId}
        artistUserId={artistUserId}
        onAssignmentComplete={handleAssignmentComplete}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReturnToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Dashboard
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate(`/albums?id=${albumId}`)}>
            View Album Details
          </Button>
          <Button onClick={() => navigate('/merchandise')}>
            Manage Merchandise
          </Button>
        </div>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Maximize your album's potential with these recommended actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Promotional Opportunities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Link related merchandise for bundle sales</li>
                <li>• Create press releases for album launch</li>
                <li>• Schedule social media promotion campaigns</li>
                <li>• Set up booking opportunities featuring new material</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Revenue Optimization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configure merchandise cross-selling</li>
                <li>• Set up streaming distribution channels</li>
                <li>• Create tiered fan engagement packages</li>
                <li>• Enable direct-to-fan sales opportunities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlbumUploadComplete;