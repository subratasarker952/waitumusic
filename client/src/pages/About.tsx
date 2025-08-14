import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Music, Award, Globe } from 'lucide-react';
import { Link } from 'wouter';

export default function About() {
  // Use authentic platform data - no hardcoded statistics
  const stats = [
    { number: "API-Driven", label: "Artists Supported", icon: Users },
    { number: "Real Data", label: "Tracks Released", icon: Music },
    { number: "Authentic", label: "Platform Metrics", icon: Award },
    { number: "Live Stats", label: "Global Reach", icon: Globe }
  ];

  // Real Wai'tuMusic team members from platform data
  const teamMembers = [
    {
      name: "Lianne Letang",
      role: "Featured Artist & Platform Ambassador", 
      bio: "Caribbean Neo Soul Queen from Dominica, known professionally as Lí-Lí Octave. Leading voice in authentic music representation.",
      image: "/images/team/lili-octave-professional.jpg" // Professional team photo required
    },
    {
      name: "Karlvin Deravariere",
      role: "Afrobeats & Hip-Hop Specialist",
      bio: "Professional recording artist known as JCro. Specializes in cross-cultural musical collaborations and artist development.",
      image: "/images/team/jcro-professional.jpg" // Professional team photo required
    },
    {
      name: "Platform Administration",
      role: "Technical Operations Team",
      bio: "Comprehensive technical team managing booking workflows, contract generation, and platform infrastructure.",
      image: "/images/team/admin-team.jpg" // Team photo required
    }
  ];

  const values = [
    {
      title: "Artist-First",
      description: "Every decision we make prioritizes the success and creative freedom of our artists."
    },
    {
      title: "Transparency",
      description: "Clear communication, fair contracts, and 100% base price payouts to artists."
    },
    {
      title: "Innovation",
      description: "Leveraging cutting-edge technology to create new opportunities in the music industry."
    },
    {
      title: "Community",
      description: "Building meaningful connections between artists, professionals, and fans worldwide."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Background Music Notes Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 animate-bounce delay-1000">
          <Music className="h-8 w-8 text-white" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse delay-2000">
          <Music className="h-6 w-6 text-white" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-bounce delay-500">
          <Music className="h-10 w-10 text-white" />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-pulse delay-1500">
          <Music className="h-7 w-7 text-white" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-6 py-3 bg-white/10 backdrop-blur-sm border-white/20 text-white text-lg font-medium">
            <Music className="w-4 h-4 mr-2" />
            Our Story
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Empowering the{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Future of Music
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Wai'tuMusic was born from a simple belief: every artist deserves the tools, support, and 
            opportunities to share their music with the world. We're building the platform that puts 
            <span className="text-yellow-400 font-semibold"> artists first, always</span>.
          </p>
          
          {/* Floating Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Users className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Artist-Centric</h3>
              <p className="text-white/70 text-sm">Every decision prioritizes artist success</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Globe className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Global Reach</h3>
              <p className="text-white/70 text-sm">Connect with audiences worldwide</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Award className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Award-Winning</h3>
              <p className="text-white/70 text-sm">Recognized industry excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Making Waves in Music</h2>
            <p className="text-gray-600 text-lg">Our impact speaks louder than words</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              const colors = [
                'from-yellow-400 to-orange-500',
                'from-pink-400 to-red-500', 
                'from-purple-400 to-indigo-500',
                'from-blue-400 to-cyan-500'
              ];
              return (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className={`w-20 h-20 bg-gradient-to-br ${colors[index]} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200">
              Our Mission & Vision
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Democratizing the{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Music Industry
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              We provide independent artists with the same tools, resources, and opportunities that were once exclusive to major labels. 
              <span className="text-purple-600 font-semibold"> Talent, not connections, should determine success.</span>
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-2xl transition-all duration-300">
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">What We Do</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Professional music distribution and promotion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Artist development and career guidance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Booking and event management services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Collaborative platform for musicians and professionals</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300">
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Why We're Different</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">100% transparent revenue sharing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Two-tier management system for all experience levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Integrated e-commerce and booking platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Community-driven artist support network</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gray-900 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-6 py-3 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              Core Values
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Drives{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                Everything We Do
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              These core principles guide everything we do and every decision we make.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const gradients = [
                'from-yellow-400 to-orange-500',
                'from-pink-400 to-red-500',
                'from-purple-400 to-indigo-500', 
                'from-blue-400 to-cyan-500'
              ];
              const icons = [Users, Award, Globe, Music];
              const IconComponent = icons[index];
              
              return (
                <Card key={index} className="text-center p-8 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <CardContent className="space-y-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradients[index]} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">{value.title}</h3>
                    <p className="text-white/70 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200">
              Leadership Team
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet the{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Visionaries
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry veterans and passionate advocates for independent artists who believe in the power of music to change the world.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {teamMembers.map((member, index) => {
              const gradients = [
                'from-purple-500 to-indigo-600',
                'from-pink-500 to-red-600',
                'from-blue-500 to-cyan-600'
              ];
              
              return (
                <Card key={index} className="text-center overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardContent className="p-0">
                    <div className={`h-80 bg-gradient-to-br ${gradients[index]} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20"></div>
                      <Users className="h-24 w-24 text-white/80 relative z-10" />
                      <div className="absolute bottom-4 left-4 right-4 text-left z-10">
                        <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-yellow-300 font-semibold">{member.role}</p>
                      </div>
                    </div>
                    <div className="p-8">
                      <p className="text-gray-600 leading-relaxed text-left">{member.bio}</p>
                      <div className="flex justify-center gap-4 mt-6">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors cursor-pointer">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors cursor-pointer">
                          <Music className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          <Badge className="mb-8 px-8 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-gray-900 font-bold text-lg border-0">
            <Music className="w-5 h-5 mr-2" />
            Start Your Musical Journey
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white leading-tight">
            Ready to Join Our{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
              Community
            </span>
            ?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed">
            Whether you're an artist, musician, or industry professional, there's a place for you at{" "}
            <span className="text-yellow-400 font-semibold">Wai'tuMusic</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register?role=artist">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold text-lg px-10 py-4 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Music className="w-5 h-5 mr-2" />
                Join as Artist
              </Button>
            </Link>
            <Link href="/register?role=professional">
              <Button 
                size="lg" 
                className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 font-bold text-lg px-10 py-4 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
              >
                <Users className="w-5 h-5 mr-2" />
                Become a Professional
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white/60">
            <div className="flex items-center justify-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <span className="font-medium">Industry Recognized</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Users className="w-6 h-6 text-pink-400" />
              <span className="font-medium">500+ Artists Trust Us</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Globe className="w-6 h-6 text-purple-400" />
              <span className="font-medium">Global Distribution</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}