import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { HOMEPAGE_CONTENT, SITE_CONFIG } from '@shared/content-config';
import { 
  Crown, 
  Shield, 
  Mic, 
  Guitar, 
  Users, 
  Heart,
  Calendar,
  FileText,
  DollarSign,
  Music,
  Star,
  Rocket,
  Headphones,
  Trophy,
  ChevronRight,
  Play,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Award,
  Upload,
  Check,
  Image,
  Lock,
  Unlock,
  ShoppingCart,
  Clock,
  MessageCircle,
  Video,
  Zap,
  GitBranch,
  Share2,
  UserPlus,
  Download,
  Eye
} from 'lucide-react';

export default function Home() {
  // Fetch data for featured sections - made optional for guests
  const { data: artists = [] } = useQuery({
    queryKey: ['/api/artists'],
  });

  const { data: songs = [] } = useQuery({
    queryKey: ['/api/songs'],
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: false, // Disable bookings for guest users - requires auth
  });

  // Get featured artists (managed artists or those with high stats)
  const featuredArtists = (artists as any[])?.filter((artist: any) => artist.isManaged).slice(0, 6) || [];

  // Popular services from configuration
  const popularServices = HOMEPAGE_CONTENT.services.items.map((service, index) => ({
    id: index + 1,
    name: service.name,
    description: service.description,
    price: `From $${service.basePrice}`,
    category: service.category,
    popular: service.popular,
    icon: index === 0 ? Mic : index === 1 ? Music : Users
  }));
  // User roles from configuration with icons
  const iconMap = { Mic, Music, Guitar, Headphones, Users, Heart };
  const userRoles = HOMEPAGE_CONTENT.userRoles.roles.map((role, index) => ({
    icon: [Mic, Music, Guitar, Headphones, Users, Heart][index],
    title: role.title,
    description: role.description,
    gradient: `from-${role.color}-600 to-${role.color}-800`,
    access: role.access
  }));

  // Features from configuration with icons
  const features = HOMEPAGE_CONTENT.features.items.map((feature, index) => ({
    icon: [Calendar, FileText, DollarSign, Music, Users, Star][index],
    title: feature.title,
    description: feature.description
  }));

  // Dynamic platform statistics
  const stats = [
    { 
      number: (artists as any[])?.length?.toString() || '0', 
      label: "Active Artists", 
      change: "+3 this month",
      icon: Users,
      trend: "up"
    },
    { 
      number: (bookings as any[])?.length?.toString() || '0', 
      label: "Total Bookings", 
      change: "+12% this month",
      icon: Calendar,
      trend: "up"
    },
    { 
      number: (songs as any[])?.length?.toString() || '0', 
      label: "Songs Released", 
      change: "+8 this week",
      icon: Music,
      trend: "up"
    },
    { 
      number: "4.9/5", 
      label: "User Satisfaction", 
      change: "156 reviews",
      icon: Star,
      trend: "stable"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-musical relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                Music Professional
                <span className="block gradient-text animate-music-note">
                  Management Platform ✨
                </span>
              </h1>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-pulse-slow">
                Comprehensive artist management, automated booking workflows, contract generation, 
                and revenue optimization for the modern music industry. 🎵
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/artists">
                <Button size="lg" className="btn-musical ripple">
                  <Music className="mr-2 h-5 w-5 animate-bounce-slow" />
                  Discover Artists
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="lg" className="btn-secondary-musical ripple">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" className="glass-effect text-white hover:bg-white/20 font-semibold px-8 py-3 ripple">
                  <Users className="mr-2 h-5 w-5" />
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists Carousel */}
      {featuredArtists.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <Badge variant="outline" className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none animate-shimmer">
                <Star className="w-4 h-4 mr-2" />
                Featured Artists
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Discover Our <span className="gradient-text">Featured Artists</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professionally managed artists ready for your next event or collaboration 🎤
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtists.map((artist: any, index: number) => (
                <Card key={`featured-artist-${artist.userId}-${index}`} className={`card-artist group stagger-item transition-all duration-500 hover:scale-105 cursor-pointer`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
                    <div className="flex items-center mb-4 relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300 animate-pulse-slow">
                        <Music className="h-8 w-8 text-white animate-music-note" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">{artist.stageName}</h3>
                        <p className="text-gray-600">{artist.genre || 'Multi-Genre'} 🎵</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-shimmer">
                        <Crown className="w-3 h-3 mr-1" />
                        Managed
                      </Badge>
                      <div className="flex items-center group-hover:scale-110 transition-transform">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1 animate-bounce-slow" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      Professional artist with management benefits and booking calendar access.
                    </p>

                    <div className="flex gap-2">
                      <Link href={`/artists/${artist.userId}`}>
                        <Button variant="outline" size="sm" className="flex-1 btn-musical">
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                      </Link>
                      <Link href="/booking">
                        <Button size="sm" className="flex-1 btn-secondary-musical">
                          <Calendar className="w-4 h-4 mr-1" />
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/artists">
                <Button variant="outline" size="lg">
                  View All Artists
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Services Showcase */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white border-none animate-shimmer">
              <Zap className="w-4 h-4 mr-2" />
              Popular Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Professional <span className="gradient-text">Music Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              High-quality professional services to elevate your music career 🎯
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularServices.map((service, index) => (
              <Card key={`popular-service-${service.id}`} className={`card-booking group stagger-item transition-all duration-500 hover:scale-105 cursor-pointer`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-xl"></div>
                  <div className="flex items-center justify-between mb-4 relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 animate-pulse-slow">
                      <service.icon className="h-6 w-6 text-white animate-music-note" />
                    </div>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white animate-shimmer">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-orange-600 transition-colors">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.description} 🎤</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold gradient-text group-hover:scale-110 transition-transform">{service.price}</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none">{service.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/services">
                      <Button variant="outline" size="sm" className="flex-1 btn-musical">
                        <Eye className="w-4 h-4 mr-1" />
                        Learn More
                      </Button>
                    </Link>
                    <Link href="/consultation">
                      <Button size="sm" className="flex-1 btn-secondary-musical">
                        <Rocket className="w-4 h-4 mr-1" />
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none animate-shimmer">
              <Users className="w-4 h-4 mr-2" />
              User Roles
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Distinct Music Industry <span className="gradient-text">Membership</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Six distinct user roles with hierarchical permissions and management tier benefits 🎭
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userRoles.map((role, index) => {
              const IconComponent = role.icon;
              return (
                <Card key={`user-role-${role.title.replace(/\s+/g, '-').toLowerCase()}-${index}`} className={`card-musical relative overflow-hidden bg-gradient-to-br ${role.gradient} text-gray-600 border-0 group stagger-item transition-all duration-500 hover:scale-105 cursor-pointer`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="relative z-10 p-6">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300 animate-pulse-slow">
                      <IconComponent className="h-6 w-6 text-gray-600 animate-music-note" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:scale-105 transition-transform">{role.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {role.description} ✨
                    </p>
                    <Badge className="bg-white/20 text-gray-600 hover:bg-white/30 animate-shimmer">
                      <Award className="w-3 h-3 mr-1" />
                      <p className='text-gray-600'>
                      {role.access}
                      </p>
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Comprehensive Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage artists, bookings, contracts, and revenue in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-dark mb-4">
                <Calendar className="inline text-primary mr-3" />
                Smart Booking Calendar System
              </h3>
              <p className="text-gray-600 mb-6">
                Color-coded dual calendar system with role restrictions. Only managed artists, musicians, 
                and professionals can access booking functionalities with automated conflict detection.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm">Available dates</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                  <span className="text-sm">Booked dates</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span className="text-sm">Unavailable dates</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded mr-3"></div>
                  <span className="text-sm">Past dates</span>
                </div>
              </div>
            </div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">December 2024</h4>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={`weekday-${day}-${index}`} className="p-2 font-semibold text-gray-500">{day}</div>
                ))}
                {[1,2,3,4].map((day, index) => (
                  <div key={`calendar-day-${day}-${index}`} className="p-2 text-gray-400">{day}</div>
                ))}
                <div className="p-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600">5</div>
                <div className="p-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600">6</div>
                <div className="p-2 bg-orange-500 text-white rounded">7</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.slice(1).map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={`feature-${feature.title.replace(/\s+/g, '-').toLowerCase()}-${index}`} className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Role-Optimized Dashboards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each user role sees a customized dashboard with relevant tools and information
            </p>
          </div>

          <Card className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => (
                <Card key={`stat-${stat.label.replace(/\s+/g, '-').toLowerCase()}-${index}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-primary">{stat.number}</p>
                    </div>
                    <div className="text-primary text-xl">
                      {index === 0 && <Calendar />}
                      {index === 1 && <DollarSign />}
                      {index === 2 && <Mic />}
                      {index === 3 && <Star />}
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">{stat.change}</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Music Catalog Management */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Professional Music Catalog Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry-standard music distribution platform with comprehensive monetization and rights management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Upload System</h3>
              <p className="text-gray-600 mb-4">
                ISRC validation, metadata extraction, and automatic quality checks ensure distribution-ready content
              </p>
              <Badge variant="secondary">Industry Standard</Badge>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Monetization</h3>
              <p className="text-gray-600 mb-4">
                Free or paid distribution with transparent pricing and 100% base price protection for artists
              </p>
              <Badge variant="secondary">Revenue Protection</Badge>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rights Management</h3>
              <p className="text-gray-600 mb-4">
                Role-based access controls with preview management and digital rights protection
              </p>
              <Badge variant="secondary">Secure Platform</Badge>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Technical Requirements & Standards</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">ISRC Code Validation</h4>
                    <p className="text-gray-600">Mandatory ISRC codes for global distribution, royalty tracking, and rights management compliance</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Required</Badge>
                      <span className="text-xs text-gray-500">Format: CC-XXX-YY-NNNNN</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Image className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Professional Cover Art Standards</h4>
                    <p className="text-gray-600">Minimum 3000x3000px resolution in RGB color space for streaming platform requirements</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">3000x3000px+</Badge>
                      <Badge variant="outline" className="text-xs">RGB</Badge>
                      <Badge variant="outline" className="text-xs">300 DPI</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Advanced Audio Processing</h4>
                    <p className="text-gray-600">Automated preview generation, waveform analysis, and quality optimization</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">WAV/FLAC</Badge>
                      <Badge variant="outline" className="text-xs">24-bit/96kHz</Badge>
                      <Badge variant="outline" className="text-xs">Auto Preview</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">E-commerce Integration</h4>
                    <p className="text-gray-600">Seamless shopping cart integration with digital download capabilities and inventory management</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">Digital Downloads</Badge>
                      <Badge variant="outline" className="text-xs">Cart System</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <Card className="p-6">
                <h4 className="text-xl font-bold mb-6">Role-Based Preview System</h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-700">Independent Artists</h5>
                      <Badge variant="outline">Standard</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">30-second fixed previews from track beginning</p>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Play className="w-5 h-5 text-gray-500" />
                        <div className="flex-1 bg-gray-300 rounded-full h-2">
                          <div className="bg-gray-500 rounded-full h-2 w-1/3"></div>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">0:30 / 3:45</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Lock className="w-3 h-3" />
                        <span>Fixed 30s preview</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-primary">Managed Artists</h5>
                      <Badge className="bg-primary">Premium</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Flexible 15-second to full-track previews with custom controls</p>
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <Play className="w-5 h-5 text-primary" />
                        <div className="flex-1 bg-primary/20 rounded-full h-2">
                          <div className="bg-primary rounded-full h-2 w-3/4"></div>
                        </div>
                        <span className="text-xs text-primary font-mono">2:51 / 3:45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-xs h-6">15s</Button>
                          <Button size="sm" variant="outline" className="text-xs h-6">30s</Button>
                          <Button size="sm" className="text-xs h-6 bg-primary">Full</Button>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-primary">
                          <Unlock className="w-3 h-3" />
                          <span>Custom preview control</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <h4 className="text-lg font-bold mb-4 text-primary">Revenue Transparency</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Artist Base Price:</span>
                    <span className="font-semibold">100% Protected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Platform Fees:</span>
                    <span className="font-semibold">Transparent</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing:</span>
                    <span className="font-semibold">Itemized</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-bold text-primary">
                    <span>Artist Payout:</span>
                    <span>Guaranteed Base</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Upload Your Music?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of artists using our professional catalog management system with industry-standard requirements and transparent revenue sharing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Upload className="w-5 h-5 mr-2" />
                Start Uploading Music
              </Button>
              <Button size="lg" variant="outline">
                <FileText className="w-5 h-5 mr-2" />
                View Upload Guidelines
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Breakdown Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Financial Transparency
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clear revenue breakdown ensuring artists receive 100% of their set base price
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Revenue Breakdown Example</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Artist Base Price</span>
                  <span className="text-xl font-bold text-green-600">$1,000.00</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Platform Fee (5%)</span>
                  <span className="text-lg font-semibold">$50.00</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Processing Fee (2.9%)</span>
                  <span className="text-lg font-semibold">$30.00</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Additional Services</span>
                  <span className="text-lg font-semibold">$50.00</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <span className="text-xl font-bold">Total Client Investment</span>
                    <span className="text-2xl font-bold text-primary">$1,130.00</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Key Benefits</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Artist receives full $1,000 base price with no deductions
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Complete pricing transparency for all stakeholders
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Platform and processing fees clearly itemized
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Additional services priced separately and transparently
                  </li>
                </ul>
              </div>
            </div>

            <Card className="p-8">
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold mb-2">Artist Protection Guarantee</h4>
                <p className="text-gray-600">100% base price protection policy</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Artist Payout</span>
                    <span className="text-sm font-medium">88.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '88.5%' }}></div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Platform Operations</span>
                    <span className="text-sm font-medium">4.4%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '4.4%' }}></div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Processing Fees</span>
                    <span className="text-sm font-medium">2.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '2.7%' }}></div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Additional Services</span>
                    <span className="text-sm font-medium">4.4%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: '4.4%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-700">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Artist First Policy</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Artists always receive their full base price regardless of additional platform fees
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-dark to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Music Career?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of artists, musicians, and industry professionals already using Wai'tuMusic 
            to streamline their operations and maximize their revenue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Rocket, title: "Quick Setup", desc: "Get started in minutes with our intuitive onboarding process" },
              { icon: Headphones, title: "Expert Support", desc: "24/7 support from music industry professionals who understand your needs" },
              { icon: Trophy, title: "Proven Results", desc: "Artists report 40% increase in booking efficiency and revenue optimization" }
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={`benefit-${benefit.title.replace(/\s+/g, '-').toLowerCase()}-${index}`} className="glass-effect text-white border-white/20 p-6">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Play className="mr-2 h-5 w-5" />
                {HOMEPAGE_CONTENT.hero.cta.primary}
              </Button>
            </Link>
            <Link href="/booking">
              <Button size="lg" variant="outline" className="bg-primary hover:bg-primary/90 hover:text-dark">
                <Calendar className="mr-2 h-5 w-5" />
                {HOMEPAGE_CONTENT.hero.cta.secondary}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                <Users className="mr-2 h-5 w-5" />
                {HOMEPAGE_CONTENT.hero.cta.tertiary}
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            <p>No credit card required • Full feature access • Cancel anytime</p>
          </div>
        </div>
      </section>
    </div>
  );
}
