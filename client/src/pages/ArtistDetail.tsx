
// import { useParams, Link } from 'wouter';
// import { useQuery } from '@tanstack/react-query';
// import { useState } from 'react';
// import { useNavigation } from '@/hooks/useNavigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useCart } from '@/contexts/CartContext';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import WebsiteIntegrationModal from '@/components/WebsiteIntegrationModal';
// import ProfileEditModal from '@/components/modals/ProfileEditModal';
// import { 
//   Music, 
//   Star, 
//   MapPin, 
//   Calendar, 
//   Users, 
//   Play, 
//   ShoppingCart,
//   ExternalLink,
//   Check,
//   Clock,
//   Award,
//   Mic,
//   Heart,
//   Share2,
//   Globe,
//   Edit,
//   Crown
// } from 'lucide-react';

// export default function ArtistDetail() {
//   const { id } = useParams();
//   const { addItem } = useCart();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [profileEditOpen, setProfileEditOpen] = useState(false);

//   const { data: artist, isLoading } = useQuery({
//     queryKey: ['/api/artists', id],
//     enabled: !!id,
//   });

//   const { data: songs = [] } = useQuery({
//     queryKey: ['/api/songs'],
//   });

//   const { data: merchandise = [] } = useQuery({
//     queryKey: ['/api/merchandise'],
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="animate-pulse">
//           <div className="h-64 bg-gray-200"></div>
//           <div className="max-w-6xl mx-auto px-4 py-8">
//             <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
//             <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
//             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!artist) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold mb-2">Artist not found</h1>
//           <p className="text-gray-600 mb-4">The artist you're looking for doesn't exist.</p>
//           <Link href="/artists">
//             <Button>Browse All Artists</Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const artistSongs = Array.isArray(songs) ? songs.filter((song: any) => song.artistUserId === parseInt(id || '0')) : [];
//   const artistMerchandise = Array.isArray(merchandise) ? merchandise.filter((item: any) => item.artistUserId === parseInt(id || '0')) : [];

//   // Events would be loaded from API based on artist bookings
//   const getUpcomingEvents = () => {
//     // In production, this would fetch from /api/artists/:id/events
//     return [];
//   };

//   const handleShareProfile = async () => {
//     const profileUrl = `${window.location.origin}/artists/${id}`;
    
//     if (navigator.share) {
//       // Use Web Share API if available (mobile browsers)
//       try {
//         await navigator.share({
//           title: `${(artist as any)?.stageName || (artist as any)?.stageNames?.[0]?.name || 'Artist'} - Wai'tuMusic`,
//           text: `Check out ${(artist as any)?.stageName || (artist as any)?.stageNames?.[0]?.name || 'this artist'} on Wai'tuMusic`,
//           url: profileUrl,
//         });
//       } catch (error: any) {
//         // User cancelled sharing or error occurred
//         if (error.name !== 'AbortError') {
//           copyToClipboard(profileUrl);
//         }
//       }
//     } else {
//       // Fallback to clipboard copy
//       copyToClipboard(profileUrl);
//     }
//   };

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       toast({
//         title: "Profile link copied!",
//         description: "The artist profile link has been copied to your clipboard.",
//       });
//     } catch (error) {
//       // Fallback for older browsers
//       const textArea = document.createElement('textarea');
//       textArea.value = text;
//       document.body.appendChild(textArea);
//       textArea.select();
//       document.execCommand('copy');
//       document.body.removeChild(textArea);
//       toast({
//         title: "Profile link copied!",
//         description: "The artist profile link has been copied to your clipboard.",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Hero Section */}
//       <section className="relative h-64 md:h-80 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70"></div>
//         <div className="absolute inset-0 bg-black/30"></div>
        
//         <div className="relative h-full flex items-end">
//           <div className="max-w-6xl mx-auto w-full px-4 pb-8">
//             <div className="flex items-end space-x-6">
//               {/* Artist Avatar */}
//               <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
//                 {(artist as any).profile?.avatarUrl ? (
//                   <img 
//                     src={(artist as any).profile.avatarUrl} 
//                     alt={(artist as any).stageNames?.find((sn: any) => sn.isPrimary)?.name || (artist as any).stageName}
//                     className="w-full h-full rounded-full object-cover"
//                   />
//                 ) : (
//                   <span className="text-4xl font-bold text-primary">
//                     {((artist as any).stageNames?.find((sn: any) => sn.isPrimary)?.name || (artist as any).stageName || 'A').charAt(0)}
//                   </span>
//                 )}
//               </div>

//               {/* Artist Info */}
//               <div className="flex-1 text-white">
//                 <div className="flex items-center gap-4 mb-2">
//                   <h1 className="text-4xl md:text-5xl font-bold">{(artist as any).stageNames?.find((sn: any) => sn.isPrimary)?.name || (artist as any).stageName}</h1>
//                   {(artist as any).isManaged && (
//                     <Badge className="bg-green-500 hover:bg-green-600">
//                       <Check className="w-3 h-3 mr-1" />
//                       Managed
//                     </Badge>
//                   )}
//                 </div>
                
//                 <div className="flex items-center space-x-6 text-lg">
//                   <div className="flex items-center">
//                     <Music className="w-5 h-5 mr-2" />
//                     {(artist as any).genre || 'Multi-Genre'}
//                   </div>
//                   <div className="flex items-center">
//                     <Star className="w-5 h-5 mr-2 fill-yellow-400 text-yellow-400" />
//                     4.8 (156 reviews)
//                   </div>
//                   <div className="flex items-center">
//                     <MapPin className="w-5 h-5 mr-2" />
//                     Available Worldwide
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-4 mt-4">
//                   <Link href={`/booking?artist=${(artist as any).userId}`}>
//                     <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
//                       <Calendar className="w-5 h-5 mr-2" />
//                       Book This Artist
//                     </Button>
//                   </Link>
//                   <Button 
//                     size="lg" 
//                     variant="outline" 
//                     className="bg-white text-primary hover:bg-gray-100"
//                     onClick={handleShareProfile}
//                   >
//                     <Share2 className="w-5 h-5 mr-2" />
//                     Share Profile
//                   </Button>
                  
//                   {/* Website Integration button - privacy-controlled access */}
//                   {user && (
//                     // Only show for: 1) Admins viewing managed artists, 2) Users viewing their own profile, 3) Non-managed users (with overlay)
//                     (([1, 2].includes(user.roleId) && (artist as any).isManaged) || 
//                      ((artist as any).userId === user.id) || 
//                      [6, 7, 8, 9].includes(user.roleId)) && (
//                       <div className="relative group">
//                         <WebsiteIntegrationModal 
//                           artistId={(artist as any).userId} 
//                           artistName={(artist as any).stageName}
//                         >
//                           <Button 
//                             size="lg" 
//                             variant="outline" 
//                             className="bg-white text-primary hover:bg-gray-100"
//                             disabled={!([1, 2].includes(user.roleId) && (artist as any).isManaged) && !([3, 4, 5].includes(user.roleId) && (artist as any).userId === user.id)}
//                           >
//                             <Globe className="w-5 h-5 mr-2" />
//                             Website Integration
//                           </Button>
//                         </WebsiteIntegrationModal>
                        
//                         {/* Premium Feature Overlay for non-managed users */}
//                         {!([1, 2].includes(user.roleId) && (artist as any).isManaged) && !([3, 4, 5].includes(user.roleId) && (artist as any).userId === user.id) && (
//                           <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//                             <div className="text-white font-semibold text-sm text-center px-2">
//                               <Crown className="w-5 h-5 mx-auto mb-1" />
//                               Premium Feature
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     )
//                   )}
                  
//                   {/* Edit Profile button for users viewing their own profile */}
//                   {user && (artist as any).userId === user.id && (
//                     <Button 
//                       size="lg" 
//                       variant="outline" 
//                       className="bg-white text-primary hover:bg-gray-100"
//                       onClick={() => setProfileEditOpen(true)}
//                     >
//                       <Edit className="w-5 h-5 mr-2" />
//                       Edit Profile
//                     </Button>
//                   )}

//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Content Tabs */}
//       <section className="max-w-6xl mx-auto px-4 py-8">
//         <Tabs defaultValue="overview" className="w-full">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="music">Music</TabsTrigger>
//             <TabsTrigger value="events">Events & Streams</TabsTrigger>
//             <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
//           </TabsList>

//           {/* Overview Tab */}
//           <TabsContent value="overview" className="space-y-8">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               <div className="lg:col-span-2 space-y-6">
//                 {/* Bio */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>About {(artist as any).stageName}</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-gray-600 leading-relaxed">
//                       {(artist as any).profile?.bio || 
//                         `${(artist as any).stageName} is a talented ${(artist as any).genre || 'multi-genre'} artist bringing unique energy and professional excellence to every performance. With a commitment to artistic integrity and audience engagement, they deliver memorable experiences that resonate with fans and critics alike.`
//                       }
//                     </p>
//                   </CardContent>
//                 </Card>

//                 {/* Popular Tracks */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center">
//                       <Music className="w-5 h-5 mr-2" />
//                       Popular Tracks
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     {artistSongs.length > 0 ? (
//                       <div className="space-y-3">
//                         {artistSongs.slice(0, 3).map((song: any, index) => (
//                           <div key={song.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
//                             <div className="flex items-center space-x-3">
//                               <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
//                                 <Music className="w-5 h-5 text-primary" />
//                               </div>
//                               <div>
//                                 <h4 className="font-medium">{song.title}</h4>
//                                 <p className="text-sm text-gray-600">
//                                   {(artist as any).isManaged ? 'Full Preview Available' : '30s Preview'}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <Button size="sm" variant="ghost">
//                                 <Play className="w-4 h-4" />
//                               </Button>
//                               <Button size="sm" variant="ghost">
//                                 <Heart className="w-4 h-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-gray-500 text-center py-4">No tracks available yet</p>
//                     )}
//                   </CardContent>
//                 </Card>
//               </div>

//               <div className="space-y-6">
//                 {/* Booking Info */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center">
//                       <Calendar className="w-5 h-5 mr-2" />
//                       Booking Information
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Base Price:</span>
//                       <span className="font-semibold">
//                         {(artist as any).basePrice ? `$${(artist as any).basePrice}` : 'Contact for quote'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Response Time:</span>
//                       <span className="font-semibold text-green-600">Within 2 hours</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Availability:</span>
//                       <span className="font-semibold">Available</span>
//                     </div>
//                     <div className="pt-2 border-t">
//                       <Link href={`/booking?artist=${(artist as any).userId}`}>
//                         <Button className="w-full">
//                           <Calendar className="w-4 h-4 mr-2" />
//                           Book Now
//                         </Button>
//                       </Link>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Social Links */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Connect</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <Button variant="outline" className="w-full justify-start">
//                       <ExternalLink className="w-4 h-4 mr-2" />
//                       Official Website
//                     </Button>
//                     <Button variant="outline" className="w-full justify-start">
//                       <Music className="w-4 h-4 mr-2" />
//                       Spotify
//                     </Button>
//                     <Button variant="outline" className="w-full justify-start">
//                       <Users className="w-4 h-4 mr-2" />
//                       Instagram
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </TabsContent>

//           {/* Music Tab */}
//           <TabsContent value="music" className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold">Music Collection</h2>
//               <div className="flex items-center space-x-2">
//                 <Button variant="outline" size="sm">All</Button>
//                 <Button variant="ghost" size="sm">Singles</Button>
//                 <Button variant="ghost" size="sm">Albums</Button>
//               </div>
//             </div>

//             {artistSongs.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {artistSongs.map((song: any) => (
//                   <Card key={song.id} className="hover:shadow-lg transition-shadow">
//                     <CardContent className="p-6">
//                       <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg mb-4 flex items-center justify-center">
//                         <Music className="w-12 h-12 text-primary/80" />
//                       </div>
//                       <h3 className="font-semibold mb-2">{song.title}</h3>
//                       <p className="text-sm text-gray-600 mb-4">ISRC: {song.isrcCode}</p>
//                       <div className="flex items-center justify-between">
//                         <Button size="sm" variant="outline">
//                           <Play className="w-4 h-4 mr-1" />
//                           Play
//                         </Button>
//                         {song.price && (
//                           <Button 
//                             size="sm"
//                             onClick={() => addItem({
//                               itemId: song.id,
//                               title: song.title,
//                               artist: (artist as any).stageNames?.find((sn: any) => sn.isPrimary)?.name || (artist as any).stageName || 'Unknown Artist',
//                               price: parseFloat(song.price),
//                               type: 'song',
//                               quantity: 1
//                             })}
//                           >
//                             <ShoppingCart className="w-4 h-4 mr-1" />
//                             ${song.price}
//                           </Button>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-600 mb-2">No music available</h3>
//                 <p className="text-gray-500">This artist hasn't uploaded any tracks yet.</p>
//               </div>
//             )}
//           </TabsContent>

//           {/* Events Tab */}
//           <TabsContent value="events" className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold">Upcoming Events</h2>
//               <Button variant="outline">View All Events</Button>
//             </div>

//             <div className="space-y-4">
//               {getUpcomingEvents().length > 0 ? (
//                 getUpcomingEvents().map((event: any) => (
//                   <Card key={event.id} className="hover:shadow-lg transition-shadow">
//                     <CardContent className="p-6">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
//                             <Calendar className="w-8 h-8 text-primary" />
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-lg">{event.name}</h3>
//                             <p className="text-gray-600">{event.venue}, {event.location}</p>
//                             <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Badge variant="secondary">{event.status}</Badge>
//                           <Button>
//                             <ExternalLink className="w-4 h-4 mr-2" />
//                             Get Tickets
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))
//               ) : (
//                 <div className="text-center py-12">
//                   <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
//                   <h3 className="text-xl font-semibold text-gray-600 mb-2">No upcoming events</h3>
//                   <p className="text-gray-500 mb-4">Check back later for new performance dates!</p>
//                   <Button onClick={() => {
//                     window.location.href = '/booking';
//                   }}>
//                     Book This Artist
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </TabsContent>

//           {/* Merchandise Tab */}
//           <TabsContent value="merchandise" className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold">Official Merchandise</h2>
//               <div className="flex items-center space-x-2">
//                 <Button variant="outline" size="sm">All Items</Button>
//                 <Button variant="ghost" size="sm">Apparel</Button>
//                 <Button variant="ghost" size="sm">Accessories</Button>
//               </div>
//             </div>

//             {artistMerchandise.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {artistMerchandise.map((item: any) => (
//                   <Card key={item.id} className="hover:shadow-lg transition-shadow">
//                     <CardContent className="p-6">
//                       <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
//                         <ShoppingCart className="w-12 h-12 text-gray-400" />
//                       </div>
//                       <h3 className="font-semibold mb-2">{item.name}</h3>
//                       <p className="text-sm text-gray-600 mb-4">{item.description}</p>
//                       <div className="flex items-center justify-between">
//                         <span className="text-lg font-bold text-primary">${item.price}</span>
//                         <Button 
//                           size="sm"
//                           onClick={() => addItem({
//                             itemId: item.id,
//                             title: item.name,
//                             artist: (artist as any).stageNames?.find((sn: any) => sn.isPrimary)?.name || (artist as any).stageName || 'Unknown Artist',
//                             price: parseFloat(item.price),
//                             type: 'merchandise',
//                             quantity: 1
//                           })}
//                         >
//                           <ShoppingCart className="w-4 h-4 mr-1" />
//                           Add to Cart
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-600 mb-2">No merchandise available</h3>
//                 <p className="text-gray-500">This artist doesn't have any merchandise for sale yet.</p>
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </section>

//       {/* Profile Edit Modal - Available when user views their own profile */}
//       {profileEditOpen && user && (artist as any).userId === user.id && (
//         <ProfileEditModal 
//           open={profileEditOpen} 
//           onOpenChange={setProfileEditOpen}
//           userType={[3, 4].includes(user.roleId) ? 'artist' : [5, 6].includes(user.roleId) ? 'musician' : [7, 8].includes(user.roleId) ? 'professional' : 'fan'}
//           userSpecializations={(user as any)?.roleData?.specializations || []}
//           user={user}
//         />
//       )}
//     </div>
//   );
// }


// pages/artists/[id].tsx
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import WebsiteIntegrationModal from '@/components/WebsiteIntegrationModal';
import ProfileEditModal from '@/components/modals/ProfileEditModal';
import { Music, Star, MapPin, Calendar, Users, Play, ShoppingCart, ExternalLink, Check, Heart, Share2, Globe, Edit, Crown } from 'lucide-react';

export default function ArtistDetail() {
  const { id } = useParams();
  const query = new URLSearchParams(window.location.search);
  const type = query.get("type");
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // Fetch performer data
  const { data: performer, isLoading, error } = useQuery({
    queryKey: [`/api/artists/${id}?type=${type}`], 
    enabled: !!id ,
  });
  
  console.log(`/api/artists/${id}?type=${type}`)

  const artistSongs = Array.isArray(performer?.songs) ? performer.songs : [];
  const artistMerchandise = Array.isArray(performer?.merchandise) ? performer.merchandise : [];

  const getUpcomingEvents = () => performer?.events || [];

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/artists/${id}?type=${type}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: performer?.stageName || 'Performer',
          text: `Check out ${performer?.stageName || 'this performer'}`,
          url: profileUrl,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') copyToClipboard(profileUrl);
      }
    } else copyToClipboard(profileUrl);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Profile link copied!', description: 'Link copied to clipboard.' });
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ title: 'Profile link copied!', description: 'Link copied to clipboard.' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col gap-4 p-4 animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (!performer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Performer not found</h1>
          <p className="text-gray-600 mb-4">The performer you're looking for doesn't exist.</p>
          <Button onClick={() => (window.location.href = '/artists')}>Browse All</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-end">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-6xl mx-auto w-full px-4 pb-8 flex items-end gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
            {performer.profile?.avatarUrl ? (
              <img src={performer.profile.avatarUrl} alt={performer.stageName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-primary">{(performer.stageName || 'P')[0]}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold">{performer.stageName}</h1>
              {performer.isManaged && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Managed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-6 text-lg">
              <div className="flex items-center"><Music className="w-5 h-5 mr-2" />{performer.genre || 'Multi-Genre'}</div>
              <div className="flex items-center"><Star className="w-5 h-5 mr-2 fill-yellow-400 text-yellow-400" />4.8 (156 reviews)</div>
              <div className="flex items-center"><MapPin className="w-5 h-5 mr-2" />Worldwide</div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100" onClick={() => window.location.href = `/booking?${type}=${performer.userId}`}>
                <Calendar className="w-5 h-5 mr-2" /> Book
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100" onClick={handleShareProfile}>
                <Share2 className="w-5 h-5 mr-2" /> Share
              </Button>
              {user && (
                <WebsiteIntegrationModal artistId={performer.userId} artistName={performer.stageName}>
                  <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100">
                    <Globe className="w-5 h-5 mr-2" /> Website Integration
                  </Button>
                </WebsiteIntegrationModal>
              )}
              {user && performer.userId === user.id && (
                <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100" onClick={() => setProfileEditOpen(true)}>
                  <Edit className="w-5 h-5 mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle>About {performer.stageName}</CardTitle></CardHeader>
                  <CardContent><p className="text-gray-600 leading-relaxed">{performer.profile?.bio || `${performer.stageName} is a talented performer.`}</p></CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center"><Music className="w-5 h-5 mr-2" />Popular Tracks</CardTitle></CardHeader>
                  <CardContent>
                    {artistSongs.length > 0 ? (
                      <div className="space-y-3">
                        {artistSongs.slice(0, 3).map((song: any) => (
                          <div key={song.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center"><Music className="w-5 h-5 text-primary" /></div>
                              <div>
                                <h4 className="font-medium">{song.title}</h4>
                                <p className="text-sm text-gray-600">{performer.isManaged ? 'Full Preview' : '30s Preview'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost"><Play className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost"><Heart className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No tracks available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center"><Calendar className="w-5 h-5 mr-2" />Booking Info</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between"><span className="text-gray-600">Base Price:</span><span className="font-semibold">{performer.basePrice ? `$${performer.basePrice}` : 'Contact'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Response Time:</span><span className="font-semibold text-green-600">Within 2 hours</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Availability:</span><span className="font-semibold">Available</span></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Music */}
          <TabsContent value="music" className="space-y-6">
            {artistSongs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artistSongs.map((song: any) => (
                  <Card key={song.id}>
                    <CardContent>
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg mb-4 flex items-center justify-center"><Music className="w-12 h-12 text-primary/80" /></div>
                      <h3 className="font-semibold mb-2">{song.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">ISRC: {song.isrcCode}</p>
                      <div className="flex items-center justify-between">
                        <Button size="sm" variant="outline"><Play className="w-4 h-4 mr-1" />Play</Button>
                        {song.price && (
                          <Button size="sm" onClick={() => addItem({ itemId: song.id, title: song.title, artist: performer.stageName, price: parseFloat(song.price), type: 'song', quantity: 1 })}>
                            <ShoppingCart className="w-4 h-4 mr-1" />${song.price}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12"><Music className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3>No music available</h3></div>
            )}
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="space-y-6">
            {getUpcomingEvents().length > 0 ? (
              getUpcomingEvents().map((event: any) => (
                <Card key={event.id}><CardContent>{event.name}</CardContent></Card>
              ))
            ) : (
              <div className="text-center py-12">No upcoming events</div>
            )}
          </TabsContent>

          {/* Merchandise */}
          <TabsContent value="merchandise" className="space-y-6">
            {artistMerchandise.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artistMerchandise.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent>
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center"><ShoppingCart className="w-12 h-12 text-gray-400" /></div>
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${item.price}</span>
                        <Button size="sm" onClick={() => addItem({ itemId: item.id, title: item.name, artist: performer.stageName, price: parseFloat(item.price), type: 'merchandise', quantity: 1 })}>
                          <ShoppingCart className="w-4 h-4 mr-1" /> Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12"><ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3>No merchandise available</h3></div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {profileEditOpen && user && performer.userId === user.id && (
        <ProfileEditModal open={profileEditOpen} onOpenChange={setProfileEditOpen} userType="artist" user={user} />
      )}
    </div>
  );
}
