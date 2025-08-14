import React from "react";
import { useNavigation } from '@/hooks/useNavigation';
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Link, ExternalLink, Music, ShoppingBag, 
  Instagram, Youtube, Globe,
  Mail, Phone, MapPin, Heart, Share2, MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebsiteIntegration {
  id: number;
  userId: number;
  slug: string;
  isActive: boolean;
  accessLevel: string;
  socialLinks: Array<{ url: string; platform: string; label: string }>;
  musicLinks: Array<{ url: string; platform: string; label: string }>;
  bookingLinks: Array<{ url: string; platform: string; label: string }>;
  storeLinks: Array<{ url: string; platform: string; label: string }>;
  customLinks: Array<{ url: string; title?: string; label?: string; description?: string }>;
  enabledWidgets?: { [key: string]: boolean };
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Artist {
  userId: number;
  stageNames: Array<{ name: string; isPrimary: boolean }>;
  primaryGenre: string;
  secondaryGenres: string[];
  socialMediaHandles: Array<{ url: string; platform: string; handle: string }>;
  basePrice: string;
  isManaged: boolean;
  bookingFormPictureUrl?: string;
}

interface Song {
  id: number;
  title: string;
  artistUserId: number;
  mp3Url?: string;
  mp4Url?: string;
  price?: number;
  isForSale: boolean;
}

interface Album {
  id: number;
  title: string;
  artistUserId: number;
  coverImageUrl?: string;
  releaseDate?: string;
  price?: number;
  isForSale: boolean;
}

interface Merchandise {
  id: number;
  artistUserId: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  youtube: Youtube,
  spotify: Music,
  website: Globe,
  email: Mail,
  phone: Phone,
  default: ExternalLink
};

export default function AllLinksPage() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug;
  const { toast } = useToast();

  // Fetch the website integration by slug
  const { data: integration, isLoading: integrationLoading, error: integrationError } = useQuery<WebsiteIntegration>({
    queryKey: ["/api/website-integrations/public", slug],
    enabled: !!slug,
  });

  // Fetch artist information
  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ["/api/artists", integration?.userId],
    enabled: !!integration?.userId,
  });

  // Fetch artist's songs
  const { data: songs = [], isLoading: songsLoading } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
    enabled: !!integration?.userId,
  });

  // Fetch artist's albums  
  const { data: albums = [], isLoading: albumsLoading } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
    enabled: !!integration?.userId,
  });

  // Fetch artist's merchandise
  const { data: merchandise = [], isLoading: merchLoading } = useQuery<Merchandise[]>({
    queryKey: ["/api/merchandise"],
    enabled: !!integration?.userId,
  });

  const isLoading = integrationLoading || artistLoading || songsLoading || albumsLoading || merchLoading;

  if (integrationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (integrationError || !integration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">The page you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => window.location.href = "/"}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!integration.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Temporarily Unavailable</h1>
          <p className="text-lg text-gray-600">This page is currently inactive.</p>
        </div>
      </div>
    );
  }

  const primaryStageName = artist?.stageNames?.find(sn => sn.isPrimary)?.name || "Artist";
  const artistSongs = songs.filter(song => song.artistUserId === integration.userId);
  const artistAlbums = albums.filter(album => album.artistUserId === integration.userId);
  const artistMerch = merchandise.filter(merch => merch.artistUserId === integration.userId);

  const handleShare = async () => {
    const url = `${window.location.origin}/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${primaryStageName} - All Links`,
          text: `Check out all of ${primaryStageName}'s links and music!`,
          url: url,
        });
      } catch (error) {
        // Fall back to copying to clipboard
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const IconComponent = platformIcons[platform.toLowerCase()] || platformIcons.default;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          {artist?.bookingFormPictureUrl && (
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-purple-200">
              <img 
                src={artist.bookingFormPictureUrl} 
                alt={primaryStageName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{primaryStageName}</h1>
          
          {artist?.primaryGenre && (
            <Badge variant="secondary" className="mb-4">
              {artist.primaryGenre}
            </Badge>
          )}
          
          {artist?.secondaryGenres && artist.secondaryGenres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {artist.secondaryGenres.slice(0, 3).map((genre, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <div className="flex items-center text-sm text-gray-500">
              <Heart className="h-4 w-4 mr-1" />
              {integration.viewCount || 0} views
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Social Media Links */}
          {integration.socialLinks && integration.socialLinks.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center">
                  <Instagram className="h-5 w-5 mr-2 text-pink-500" />
                  Social Media
                </h2>
              </CardHeader>
              <CardContent className="grid gap-3">
                {integration.socialLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <div className="flex items-center w-full">
                      {getPlatformIcon(link.platform)}
                      <div className="ml-3 text-left">
                        <div className="font-medium">{link.label}</div>
                        <div className="text-sm text-gray-500">{link.platform}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Music Links */}
          {integration.musicLinks && integration.musicLinks.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center">
                  <Music className="h-5 w-5 mr-2 text-green-500" />
                  Music Platforms
                </h2>
              </CardHeader>
              <CardContent className="grid gap-3">
                {integration.musicLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <div className="flex items-center w-full">
                      {getPlatformIcon(link.platform)}
                      <div className="ml-3 text-left">
                        <div className="font-medium">{link.label}</div>
                        <div className="text-sm text-gray-500">{link.platform}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Custom Links */}
          {integration.customLinks && integration.customLinks.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center">
                  <Link className="h-5 w-5 mr-2 text-gray-500" />
                  More Links
                </h2>
              </CardHeader>
              <CardContent className="grid gap-3">
                {integration.customLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <div className="flex items-center w-full">
                      <Link className="h-5 w-5" />
                      <div className="ml-3 text-left">
                        <div className="font-medium">{link.title || link.label}</div>
                        {link.description && (
                          <div className="text-sm text-gray-500">{link.description}</div>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Enabled Widgets */}
          {integration.enabledWidgets && Object.keys(integration.enabledWidgets).some(key => integration.enabledWidgets?.[key]) && (
            <>
              {/* Music Player Widget */}
              {integration.enabledWidgets?.musicPlayer && artistSongs.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center">
                      <Music className="h-5 w-5 mr-2 text-blue-500" />
                      Featured Songs
                    </h2>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {artistSongs.slice(0, 5).map((song) => (
                      <div key={song.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{song.title}</div>
                          {song.isForSale && song.price && (
                            <div className="text-sm text-green-600">${song.price}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {song.mp3Url && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Music player works in any context - self-contained
                                const audio = new Audio(song.mp3Url);
                                audio.play().catch(() => {
                                  toast({ title: "Playback Error", description: "Unable to play audio" });
                                });
                              }}
                            >
                              <Music className="h-4 w-4 mr-1" />
                              Play
                            </Button>
                          )}
                          {song.isForSale && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                // Song purchases require platform integration - redirect to WaituMusic
                                if (window.parent !== window) {
                                  // Embedded - open in new tab
                                  window.open(`${window.location.origin}/songs/${song.id}`, '_blank');
                                } else {
                                  // Direct link - navigate within same window
                                  window.location.href = `/songs/${song.id}`;
                                }
                              }}
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Buy
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Booking Widget */}
              {integration.enabledWidgets?.bookingWidget && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-red-500" />
                      Book a Performance
                    </h2>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <Button
                      className="w-full justify-start h-auto p-4"
                      onClick={() => {
                        // Check if this is embedded - redirect to WaituMusic platform
                        if (window.parent !== window) {
                          // Embedded - open in new tab
                          window.open(`${window.location.origin}/booking?artist=${artist?.userId}`, '_blank');
                        } else {
                          // Direct link - navigate within same window
                          window.location.href = `/booking?artist=${artist?.userId}`;
                        }
                      }}
                    >
                      <div className="flex items-center w-full">
                        <MapPin className="h-5 w-5" />
                        <div className="ml-3 text-left text-white">
                          <div className="font-medium">Book Performance</div>
                          <div className="text-sm opacity-80">Direct booking available</div>
                        </div>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Merchandise Store Widget */}
              {integration.enabledWidgets?.merchandiseStore && artistMerch.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2 text-orange-500" />
                      Merchandise Store
                    </h2>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {artistMerch.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                          <div className="text-sm font-medium text-green-600">${item.price}</div>
                        </div>
                        {item.isAvailable && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              // Merchandise requires platform integration - redirect to WaituMusic
                              if (window.parent !== window) {
                                // Embedded - open in new tab
                                window.open(`${window.location.origin}/merchandise/${item.id}`, '_blank');
                              } else {
                                // Direct link - navigate within same window
                                window.location.href = `/merchandise/${item.id}`;
                              }
                            }}
                          >
                            <ShoppingBag className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Signup Widget */}
              {integration.enabledWidgets?.newsletterSignup && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-purple-500" />
                      Stay Updated
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Get the latest updates on new music, tours, and exclusive content.</p>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter your email" 
                          className="flex-1"
                          id="newsletter-email"
                        />
                        <Button
                          onClick={async () => {
                            const emailInput = document.getElementById('newsletter-email') as HTMLInputElement;
                            const email = emailInput?.value;
                            
                            if (!email) {
                              toast({ title: "Email Required", description: "Please enter your email address" });
                              return;
                            }
                            
                            try {
                              // Newsletter signup works in any context - self-contained
                              const response = await fetch('/api/newsletter/subscribe', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  email,
                                  artistId: artist?.userId,
                                  source: 'all-links-page',
                                  subscriptionType: 'artist_updates',
                                  honeypot: '' // Bot detection field
                                })
                              });
                              
                              if (response.ok) {
                                toast({ title: "Success!", description: "You've been subscribed to updates" });
                                emailInput.value = '';
                              } else {
                                toast({ title: "Error", description: "Failed to subscribe. Please try again." });
                              }
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to subscribe. Please try again." });
                            }
                          }}
                        >
                          Subscribe
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Form Widget */}
              {integration.enabledWidgets?.contactForm && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                      Get in Touch
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Input placeholder="Your name" id="contact-name" />
                      <Input placeholder="Your email" id="contact-email" />
                      <Textarea placeholder="Your message" rows={3} id="contact-message" />
                      <Button 
                        className="w-full"
                        onClick={async () => {
                          const nameInput = document.getElementById('contact-name') as HTMLInputElement;
                          const emailInput = document.getElementById('contact-email') as HTMLInputElement;
                          const messageInput = document.getElementById('contact-message') as HTMLTextAreaElement;
                          
                          const name = nameInput?.value;
                          const email = emailInput?.value;
                          const message = messageInput?.value;
                          
                          if (!name || !email || !message) {
                            toast({ title: "All fields required", description: "Please fill out all fields" });
                            return;
                          }
                          
                          try {
                            // Contact form works in any context - self-contained
                            const response = await fetch('/api/contact', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                name,
                                email,
                                message,
                                artistId: artist?.userId,
                                source: 'all-links-page',
                                honeypot: '' // Bot detection field
                              })
                            });
                            
                            if (response.ok) {
                              toast({ title: "Message Sent!", description: "Thank you for your message. We'll get back to you soon." });
                              nameInput.value = '';
                              emailInput.value = '';
                              messageInput.value = '';
                            } else {
                              toast({ title: "Error", description: "Failed to send message. Please try again." });
                            }
                          } catch (error) {
                            toast({ title: "Error", description: "Failed to send message. Please try again." });
                          }
                        }}
                      >
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Albums Widget */}
              {artistAlbums.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center">
                      <Music className="h-5 w-5 mr-2 text-purple-500" />
                      Albums
                    </h2>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {artistAlbums.slice(0, 3).map((album) => (
                      <div key={album.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        {album.coverImageUrl && (
                          <img 
                            src={album.coverImageUrl} 
                            alt={album.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{album.title}</div>
                          {album.releaseDate && (
                            <div className="text-sm text-gray-500">
                              Released: {new Date(album.releaseDate).getFullYear()}
                            </div>
                          )}
                          {album.isForSale && album.price && (
                            <div className="text-sm text-green-600">${album.price}</div>
                          )}
                        </div>
                        {album.isForSale && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              // Album purchases require platform integration - redirect to WaituMusic
                              if (window.parent !== window) {
                                // Embedded - open in new tab
                                window.open(`${window.location.origin}/albums?id=${album.id}`, '_blank');
                              } else {
                                // Direct link - navigate within same window
                                window.location.href = `/albums?id=${album.id}`;
                              }
                            }}
                          >
                            <ShoppingBag className="h-4 w-4 mr-1" />
                            Buy Album
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t">
          <p className="text-sm text-gray-500 mb-2">
            Powered by WaituMusic
          </p>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/"}>
            Create your own All-Links page
          </Button>
        </div>
      </div>
    </div>
  );
}