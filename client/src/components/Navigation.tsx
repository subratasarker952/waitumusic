import { useState, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Menu, User, ShoppingCart, X, UserPlus, Volume2, VolumeX, LogIn, LogOut, Settings, Home } from 'lucide-react';
import { WaituMusicLogo } from './WaituMusicLogo';
import { Badge } from '@/components/ui/badge';
import ManagementApplicationModal from '@/components/modals/ManagementApplicationModal';

export default function Navigation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pianoSoundsEnabled, setPianoSoundsEnabled] = useState(true);
  const { user, role, logout } = useAuth();
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  // Piano sound frequencies (in Hz) for musical notes - complete chromatic scale
  const pianoNotes = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33
  };

  // Create a persistent audio context with proper initialization
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const initializeAudio = useCallback(async () => {
    try {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        setAudioInitialized(true);
        // Audio context initialized successfully
      }
    } catch (error) {
      // Audio initialization failed silently
    }
  }, [audioContext]);

  const playPianoNote = useCallback(async (note: keyof typeof pianoNotes) => {
    if (!pianoSoundsEnabled) return;

    try {
      // Initialize audio context on first interaction if needed
      if (!audioContext) {
        await initializeAudio();
        return; // Try again on next interaction
      }

      // Resume if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        // Audio context resumed
      }

      // Create oscillator and gain
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect audio nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency and waveform
      oscillator.frequency.value = pianoNotes[note];
      oscillator.type = 'sine';

      // Set up gain envelope for natural piano-like sound
      const currentTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);

      // Play the note
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.6);

      // Playing musical note for navigation feedback
    } catch (error) {
      // Audio playback error handled silently
      // Reset audio context on error
      setAudioContext(null);
      setAudioInitialized(false);
    }
  }, [pianoSoundsEnabled, audioContext, initializeAudio]);

  const isActive = (path: string) => location === path;

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/artists', label: 'Artists' },
    { href: '/store', label: 'Store' },
    { href: '/opphub', label: 'OppHub' },
    { href: '/booking', label: 'Bookings' },
    { href: '/services', label: 'Services' },
    { href: '/consultation', label: 'Consultation' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="nav-musical sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" className="text-lg font-bold text-primary hover:text-primary/80 px-2">
                <WaituMusicLogo size="md" showText className="mr-1" />
              </Button>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-1">
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(item.href)
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg animate-pulse-slow'
                    : 'text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-600 hover:bg-clip-text hover:font-bold'
                    }`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className={`relative btn-musical hover:rotate-6 transition-all duration-300 cart-icon ${itemCount > 0 ? 'animate-cart-glow' : ''}`}>
                <ShoppingCart className={`h-5 w-5 transition-all duration-300 ${itemCount > 0 ? 'text-blue-600 animate-pulse' : 'text-white'}`} />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white animate-bounce border-2 border-white shadow-lg">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user.fullName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>



                    {/* Show Apply for Management for eligible non-admin users */}
                    {user && ![1, 2, 3, 5, 7].includes(user.roleId) && (
                      <>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <button
                            className="w-full flex items-center gap-2 text-left px-2"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent dropdown from closing
                              setIsModalOpen(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4" />
                            Apply for Management
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={logout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>


                <ManagementApplicationModal
                  isOpen={isModalOpen}
                  onOpenChange={setIsModalOpen}
                />


              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="gradient-primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Side - Enhanced for touch */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart - Touch-friendly */}
            <Link href="/cart">
              <Button variant="ghost" size="lg" className={`relative cart-icon h-12 w-12 p-0 ${itemCount > 0 ? 'animate-cart-glow' : ''}`}>
                <ShoppingCart className={`h-6 w-6 transition-all duration-300 ${itemCount > 0 ? 'text-blue-600 animate-pulse' : 'text-gray-600'}`} />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white animate-bounce border-2 border-white shadow-lg">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-12 w-12 p-0"
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </Button>
          </div>
        </div>


      </div>

      {/* Piano Dropdown Menu - Opens below navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-[999]">
          {/* Piano Container with Opening Animation */}
          <div className="relative overflow-hidden">
            {/* Piano Body Background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #92400e 100%)'
              }}
            ></div>

            {/* Piano Cover - Slides up to reveal keys */}
            <div
              className={`relative transition-all duration-1000 ease-out ${mobileMenuOpen ? 'transform -translate-y-0 opacity-100' : 'transform translate-y-full opacity-0'
                }`}
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #2d2d2d 75%, #1a1a1a 100%)',
                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3)'
              }}
            >
              {/* Loading State */}
              <div className={`transition-all duration-500 ${mobileMenuOpen ? 'opacity-0 h-0' : 'opacity-100 h-16'}`}>
                <div className="flex items-center justify-center h-16">
                  <div className="text-center text-amber-200">
                    <div className="text-2xl">🎹 Opening Piano...</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Piano Keys Container - Revealed after cover animation */}
            <div className={`transition-all duration-800 delay-500 ${mobileMenuOpen ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0'
              } overflow-hidden`}>

              {/* Piano Header */}
              <div
                className="p-4 border-b-4 border-amber-700"
                style={{
                  background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #92400e 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="text-amber-100 font-serif text-lg">🎹 Musical Navigation 🎹</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      // Initialize audio on first interaction if needed
                      if (!audioContext) {
                        await initializeAudio();
                      }
                      setPianoSoundsEnabled(!pianoSoundsEnabled);
                    }}
                    className="text-amber-100 hover:bg-amber-800/50 h-10 w-10 p-0 rounded-full border border-amber-600"
                    title={pianoSoundsEnabled ? "Disable piano sounds" : "Enable piano sounds"}
                  >
                    {pianoSoundsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Real Piano Keyboard Layout */}
              <div className="p-4">
                {/* Navigation Items in Piano Layout */}
                <div className="mb-4">
                  <div className="text-center text-gray-600 text-sm mb-2">Navigation Keys</div>
                  <div className="relative" style={{ height: '225px' }}>
                    {/* White Keys - Horizontal Row (50% longer than before) */}
                    <div className="absolute inset-x-0 bottom-0 flex" style={{ height: '225px' }}>
                      {navigationItems.slice(1, 8).map((item, index) => {
                        const whiteKeyNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
                        const note = whiteKeyNotes[index] as keyof typeof pianoNotes;

                        // Dynamic width based on specific text requirements
                        const getKeyWidth = (label: string, index: number) => {
                          const baseWidth = 14.29; // Base percentage for equal distribution (100/7)

                          // Specific adjustments for each navigation item - maximum widths for text visibility
                          if (label === 'Book Talent') {
                            return baseWidth + 8; // Extra wide for longer text
                          } else if (label === 'Consultation') {
                            return baseWidth + 10; // Maximum width for "Consultation" (12 chars)
                          } else if (label === 'Services') {
                            return baseWidth + 6; // Width for "Services" (8 chars)
                          } else if (label === 'Artists') {
                            return baseWidth + 2; // Extra for "Artists"
                          } else if (label === 'Contact') {
                            return baseWidth + 2; // Extra for "Contact"
                          } else if (label === 'OppHub') {
                            return baseWidth + 2; // Extra for "OppHub"
                          }
                          return baseWidth; // Standard width for "Store" and "About"
                        };

                        const keyWidth = getKeyWidth(item.label, index);

                        return (
                          <div
                            key={item.href}
                            className={`border-2 border-gray-400 border-r-0 last:border-r-2 bg-white hover:bg-gray-50 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium relative overflow-hidden ${isActive(item.href) ? 'bg-blue-100 border-blue-400' : ''
                              }`}
                            onClick={async (e) => {
                              // Only play sound if clicking on the key background, not the navigation area
                              if (pianoSoundsEnabled && e.target === e.currentTarget) {
                                // Initialize audio context on first interaction if needed
                                if (!audioContext) {
                                  await initializeAudio();
                                  // Try to play note after initialization
                                  setTimeout(() => playPianoNote(note), 100);
                                } else {
                                  playPianoNote(note);
                                }
                              }
                            }}
                            onTouchStart={async (e) => {
                              if (pianoSoundsEnabled && e.target === e.currentTarget) {
                                // Initialize audio context on first interaction if needed
                                if (!audioContext) {
                                  await initializeAudio();
                                  // Try to play note after initialization
                                  setTimeout(() => playPianoNote(note), 100);
                                } else {
                                  playPianoNote(note);
                                }
                              }
                            }}
                            style={{
                              width: `${keyWidth}%`,
                              background: isActive(item.href)
                                ? 'linear-gradient(to bottom, #dbeafe 0%, #93c5fd 100%)'
                                : 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                              padding: '2px' // Add inner padding to create safe zone
                            }}
                          >
                            {/* Navigation box - compact sizing for all keys */}
                            <Link
                              href={item.href}
                              className="text-center bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md absolute text-xs font-semibold"
                              style={{
                                top: '60%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                maxWidth: 'calc(100% - 8px)', // Always leave 4px margin on each side
                                width: item.label === 'Book an Artist' ? 'calc(100% - 12px)' :
                                  item.label === 'Consultation' ? 'calc(100% - 10px)' :
                                    item.label === 'Services' ? 'calc(100% - 10px)' :
                                      item.label === 'About' ? 'calc(100% - 20px)' : 'calc(100% - 16px)',
                                minWidth: '40px',
                                padding: '1px 3px', // Minimal uniform padding
                                whiteSpace: item.label === 'Book an Artist' ? 'normal' : 'nowrap',
                                lineHeight: item.label === 'Book an Artist' ? '1.1' : '1.2',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-word',
                                boxSizing: 'border-box' // Include border/padding in width calculation
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setMobileMenuOpen(false);
                              }}
                            >
                              <div className="text-blue-700 leading-tight" style={{ fontSize: item.label.length > 10 ? '10px' : '11px' }}>
                                {item.label}
                              </div>
                              <div className="text-purple-600 font-bold text-xs">♪</div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>


                    {/* Black Keys - Music Only (no navigation) */}
                    <div className="absolute inset-x-0 top-0 flex" style={{ height: '105px' }}>
                      {/* Spacer for first key */}
                      <div style={{ width: '16.67%' }}></div>

                      {[0, 1, 2, 3, 4].map((blackKeyIndex) => {
                        const blackKeyNotes = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4'];
                        const note = blackKeyNotes[blackKeyIndex] as keyof typeof pianoNotes;

                        return (
                          <div key={blackKeyIndex} className="flex" style={{ width: blackKeyIndex === 2 ? '16.67%' : '16.67%' }}>
                            <div
                              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium cursor-pointer"
                              onClick={async () => {
                                if (pianoSoundsEnabled) {
                                  // Initialize audio context on first interaction if needed
                                  if (!audioContext) {
                                    await initializeAudio();
                                    setTimeout(() => playPianoNote(note), 100);
                                  } else {
                                    playPianoNote(note);
                                  }
                                }
                              }}
                              onTouchStart={async () => {
                                if (pianoSoundsEnabled) {
                                  // Initialize audio context on first interaction if needed
                                  if (!audioContext) {
                                    await initializeAudio();
                                    setTimeout(() => playPianoNote(note), 100);
                                  } else {
                                    playPianoNote(note);
                                  }
                                }
                              }}
                              style={{
                                width: '60%',
                                margin: '0 auto',
                                background: 'linear-gradient(to bottom, #374151 0%, #1f2937 100%)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                              }}
                            >
                              <div className="text-yellow-400 font-bold text-lg">♫</div>
                            </div>
                            {blackKeyIndex === 1 && <div style={{ width: '16.67%' }}></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Keys Section */}
                <div className="mb-4">
                  <div className="text-center text-gray-600 text-sm mb-2">Action Keys</div>
                  <div className="relative" style={{ height: '100px' }}>
                    {/* White Action Keys */}
                    <div className="absolute inset-x-0 bottom-0 flex" style={{ height: '80px' }}>
                      {/* Home Key */}
                      <div
                        className={`flex-1 border-2 border-gray-400 border-r-0 bg-white hover:bg-gray-50 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium relative ${isActive('/') ? 'bg-blue-100 border-blue-400' : ''
                          }`}
                        onClick={async (e) => {
                          if (pianoSoundsEnabled && e.target === e.currentTarget) {
                            // Initialize audio context on first interaction if needed
                            if (!audioContext) {
                              await initializeAudio();
                              setTimeout(() => playPianoNote('B4'), 100);
                            } else {
                              playPianoNote('B4');
                            }
                          }
                        }}
                        onTouchStart={async (e) => {
                          if (pianoSoundsEnabled && e.target === e.currentTarget) {
                            // Initialize audio context on first interaction if needed
                            if (!audioContext) {
                              await initializeAudio();
                              setTimeout(() => playPianoNote('B4'), 100);
                            } else {
                              playPianoNote('B4');
                            }
                          }
                        }}
                        style={{
                          background: isActive('/')
                            ? 'linear-gradient(to bottom, #dbeafe 0%, #93c5fd 100%)'
                            : 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                        }}
                      >
                        {/* Clickable navigation area - highlighted */}
                        <Link
                          href="/"
                          className="bg-blue-50 hover:bg-blue-100 rounded-lg px-2 py-1 border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Home className="h-4 w-4 text-blue-700" />
                          <div className="text-blue-700 font-semibold">Home ♪</div>
                        </Link>
                      </div>

                      {/* Cart Key */}
                      <div
                        className={`flex-1 border-2 border-gray-400 border-r-0 bg-white hover:bg-gray-50 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium relative ${itemCount > 0 ? 'bg-orange-100 border-orange-400' : ''
                          }`}
                        onClick={async (e) => {
                          if (pianoSoundsEnabled && e.target === e.currentTarget) {
                            // Initialize audio context on first interaction if needed
                            if (!audioContext) {
                              await initializeAudio();
                              setTimeout(() => playPianoNote('C5'), 100);
                            } else {
                              playPianoNote('C5');
                            }
                          }
                        }}
                        onTouchStart={async (e) => {
                          if (pianoSoundsEnabled && e.target === e.currentTarget) {
                            // Initialize audio context on first interaction if needed
                            if (!audioContext) {
                              await initializeAudio();
                              setTimeout(() => playPianoNote('C5'), 100);
                            } else {
                              playPianoNote('C5');
                            }
                          }
                        }}
                        style={{
                          background: itemCount > 0
                            ? 'linear-gradient(to bottom, #fed7aa 0%, #fb923c 100%)'
                            : 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                        }}
                      >
                        {/* Clickable navigation area - highlighted */}
                        <Link
                          href="/cart"
                          className="bg-blue-50 hover:bg-blue-100 rounded-lg px-2 py-1 border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <ShoppingCart className={`h-4 w-4 ${itemCount > 0 ? 'text-orange-600' : 'text-blue-700'}`} />
                            {itemCount > 0 && (
                              <Badge className="bg-red-500 text-white h-4 w-4 p-0 flex items-center justify-center text-xs">
                                {itemCount}
                              </Badge>
                            )}
                          </div>
                          <div className="text-blue-700 font-semibold">Cart ♪</div>
                        </Link>
                      </div>

                      {/* Dashboard/Login Key */}
                      {user ? (
                        <div
                          className="flex-1 border-2 border-gray-400 border-r-0 bg-white hover:bg-blue-50 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium relative"
                          onClick={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('D5'), 100);
                              } else {
                                playPianoNote('D5');
                              }
                            }
                          }}
                          onTouchStart={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('D5'), 100);
                              } else {
                                playPianoNote('D5');
                              }
                            }
                          }}
                          style={{
                            background: 'linear-gradient(to bottom, #dbeafe 0%, #93c5fd 100%)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                          }}
                        >
                          {/* Clickable navigation area - highlighted */}
                          <Link
                            href="/dashboard"
                            className="bg-blue-100 hover:bg-blue-200 rounded-lg px-2 py-1 border border-blue-300 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <User className="h-4 w-4 text-blue-700" />
                            <div className="text-blue-700 font-semibold">Dashboard ♪</div>
                          </Link>
                        </div>
                      ) : (
                        <div
                          className="flex-1 border-2 border-gray-400 border-r-0 bg-white hover:bg-blue-50 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium relative"
                          onClick={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('D5'), 100);
                              } else {
                                playPianoNote('D5');
                              }
                            }
                          }}
                          onTouchStart={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('D5'), 100);
                              } else {
                                playPianoNote('D5');
                              }
                            }
                          }}
                          style={{
                            background: 'linear-gradient(to bottom, #dbeafe 0%, #93c5fd 100%)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                          }}
                        >
                          {/* Clickable navigation area - highlighted */}
                          <Link
                            href="/login"
                            className="bg-blue-100 hover:bg-blue-200 rounded-lg px-2 py-1 border border-blue-300 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <LogIn className="h-4 w-4 text-blue-700" />
                            <div className="text-blue-700 font-semibold">Sign In ♪</div>
                          </Link>
                        </div>
                      )}

                      {/* Logout/Register Key */}
                      {user ? (
                        <div
                          className="flex-1 border-2 border-gray-400 bg-white hover:bg-red-50 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium relative"
                          onClick={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('E5'), 100);
                              } else {
                                playPianoNote('E5');
                              }
                            }
                          }}
                          onTouchStart={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('E5'), 100);
                              } else {
                                playPianoNote('E5');
                              }
                            }
                          }}
                          style={{
                            background: 'linear-gradient(to bottom, #fecaca 0%, #f87171 100%)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                          }}
                        >
                          {/* Clickable navigation area - highlighted */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              logout();
                              setMobileMenuOpen(false);
                            }}
                            className="bg-red-100 hover:bg-red-200 rounded-lg px-2 py-1 border border-red-300 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col items-center"
                          >
                            <LogOut className="h-4 w-4 text-red-700" />
                            <div className="text-red-700 font-semibold">Logout ♪</div>
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex-1 border-2 border-gray-400 bg-white hover:bg-purple-50 transform transition-all duration-200 touch-manipulation active:scale-95 flex flex-col items-center justify-center text-xs font-medium relative"
                          onClick={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('E5'), 100);
                              } else {
                                playPianoNote('E5');
                              }
                            }
                          }}
                          onTouchStart={async (e) => {
                            if (pianoSoundsEnabled && e.target === e.currentTarget) {
                              // Initialize audio context on first interaction if needed
                              if (!audioContext) {
                                await initializeAudio();
                                setTimeout(() => playPianoNote('E5'), 100);
                              } else {
                                playPianoNote('E5');
                              }
                            }
                          }}
                          style={{
                            background: 'linear-gradient(to bottom, #e9d5ff 0%, #c084fc 100%)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                          }}
                        >
                          {/* Clickable navigation area - highlighted */}
                          <Link
                            href="/register"
                            className="bg-purple-100 hover:bg-purple-200 rounded-lg px-2 py-1 border border-purple-300 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <UserPlus className="h-4 w-4 text-purple-700" />
                            <div className="text-purple-700 font-semibold">Register ♪</div>
                          </Link>
                        </div>
                      )}
                    </div>


                  </div>
                </div>
              </div>

              {/* Piano Bench - Close Button */}
              <div
                className="p-4"
                style={{
                  background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #92400e 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <button
                  onClick={() => {
                    if (pianoSoundsEnabled) playPianoNote('C4');
                    setMobileMenuOpen(false);
                  }}
                  onTouchStart={() => {
                    if (pianoSoundsEnabled) playPianoNote('C4');
                  }}
                  className="w-full h-12 rounded-lg border-2 border-amber-600 shadow-lg transform transition-all duration-200 touch-manipulation active:scale-95 hover:shadow-xl text-amber-100 flex items-center justify-center font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  Close Piano ♪ ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
