import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, Type, Layout, Brush, Save, FileText, Edit3
} from 'lucide-react';

interface WYSIWYGConfigControlsProps {
  onSave: () => void;
  isLoading: boolean;
}

export const WYSIWYGConfigControls: React.FC<WYSIWYGConfigControlsProps> = ({ onSave, isLoading }) => {
  const { toast } = useToast();
  
  // Local config state with defaults
  const [uiConfig, setUiConfig] = useState({
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b', 
      accent: '#f59e0b',
      background: '#ffffff',
      card: '#f8fafc'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseFontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0
    },
    layout: {
      maxWidth: 1200,
      sectionPadding: 24,
      borderRadius: 8,
      stickyHeader: false
    },
    theme: {
      darkMode: false,
      autoTheme: false
    },
    animations: {
      enabled: true
    },
    toast: {
      duration: 5000
    },
    branding: {
      platformName: "Wai'tuMusic",
      tagline: 'Music Industry Management Platform',
      logoUrl: '',
      faviconUrl: '',
      copyright: "© 2025 Wai'tuMusic. All rights reserved.",
      showPoweredBy: false
    },
    content: {
      navigation: {
        home: 'Home',
        artists: 'Artists',
        music: 'Music',
        booking: 'Booking',
        about: 'About',
        contact: 'Contact',
        login: 'Login',
        signup: 'Sign Up',
        dashboard: 'Dashboard',
        profile: 'Profile'
      },
      homepage: {
        heroTitle: 'Welcome to the Music Industry Management Platform',
        heroSubtitle: 'Connect artists, professionals, and fans through our comprehensive ecosystem',
        heroButtonPrimary: 'Get Started',
        heroButtonSecondary: 'Learn More',
        featuresTitle: 'Platform Features',
        aboutTitle: 'About Wai\'tuMusic',
        aboutText: 'We empower artists and music professionals with cutting-edge tools for career growth and industry networking.'
      },
      booking: {
        title: 'Book Your Next Performance',
        subtitle: 'Connect with top talent for your events',
        searchPlaceholder: 'Search artists, genres, or locations...',
        bookNowButton: 'Book Now',
        viewProfileButton: 'View Profile',
        priceLabel: 'Starting at',
        availabilityLabel: 'Available',
        genreLabel: 'Genre',
        locationLabel: 'Location'
      },
      dashboard: {
        welcomeMessage: 'Welcome back',
        overviewTitle: 'Dashboard Overview',
        recentActivity: 'Recent Activity',
        upcomingEvents: 'Upcoming Events',
        analytics: 'Analytics',
        quickActions: 'Quick Actions',
        notifications: 'Notifications',
        settings: 'Settings'
      },
      profile: {
        editProfile: 'Edit Profile',
        personalInfo: 'Personal Information',
        professionalInfo: 'Professional Information',
        mediaLibrary: 'Media Library',
        bookingSettings: 'Booking Settings',
        privacySettings: 'Privacy Settings',
        saveChanges: 'Save Changes',
        cancelChanges: 'Cancel'
      },
      forms: {
        emailLabel: 'Email Address',
        passwordLabel: 'Password',
        confirmPasswordLabel: 'Confirm Password',
        fullNameLabel: 'Full Name',
        phoneLabel: 'Phone Number',
        submitButton: 'Submit',
        cancelButton: 'Cancel',
        saveButton: 'Save',
        deleteButton: 'Delete',
        editButton: 'Edit',
        addButton: 'Add',
        removeButton: 'Remove',
        uploadButton: 'Upload',
        downloadButton: 'Download'
      },
      messages: {
        successTitle: 'Success',
        errorTitle: 'Error',
        warningTitle: 'Warning',
        infoTitle: 'Information',
        confirmationTitle: 'Confirmation',
        loadingMessage: 'Loading...',
        noDataMessage: 'No data available',
        unauthorizedMessage: 'Access denied',
        networkErrorMessage: 'Network connection error',
        genericErrorMessage: 'Something went wrong'
      },
      footer: {
        copyright: '© 2025 Wai\'tuMusic. All rights reserved.',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        contactUs: 'Contact Us',
        socialMediaTitle: 'Follow Us',
        newsletterTitle: 'Newsletter',
        newsletterSubtitle: 'Stay updated with the latest news'
      },
      modals: {
        emailConfig: {
          title: 'Email Configuration',
          smtpServer: 'SMTP Server',
          smtpPort: 'SMTP Port',
          securityType: 'Security Type',
          username: 'Username',
          password: 'Password',
          platformName: 'Platform Name',
          fromEmail: 'From Email',
          testEmail: 'Test Email',
          saveConfig: 'Save Configuration'
        },
        musicUpload: {
          title: 'Upload Music',
          trackTitle: 'Track Title',
          trackTitlePlaceholder: 'Enter track title',
          genre: 'Genre',
          genreSelectPlaceholder: 'Select genre',
          isrcCode: 'ISRC Code',
          isrcPlaceholder: 'e.g., USRC17607839',
          duration: 'Duration',
          durationPlaceholder: 'e.g., 3:45',
          description: 'Description',
          descriptionPlaceholder: 'Describe your track...',
          lyrics: 'Lyrics',
          lyricsPlaceholder: 'Enter song lyrics...',
          price: 'Price',
          pricePlaceholder: '0.99',
          uploadFile: 'Upload File',
          saveTrack: 'Save Track'
        },
        calendarModal: {
          title: 'Calendar Event',
          eventTitle: 'Event Title',
          eventTitlePlaceholder: 'Enter event title',
          startDate: 'Start Date',
          endDate: 'End Date',
          startTime: 'Start Time',
          endTime: 'End Time',
          location: 'Location',
          description: 'Description',
          allDay: 'All Day Event',
          recurring: 'Recurring Event',
          reminder: 'Set Reminder',
          saveEvent: 'Save Event',
          deleteEvent: 'Delete Event'
        },
        userEdit: {
          title: 'Edit User',
          personalInfo: 'Personal Information',
          setPrimary: 'Set as primary',
          removePackage: 'Remove package',
          consultationRates: 'Consultation Rates',
          bookingRates: 'Booking Rates'
        },
        setlistManager: {
          title: 'Setlist Manager',
          addSong: 'Add Song',
          generateChords: 'Generate chord charts for this song',
          addYouTubeLink: 'Add YouTube link for chord generation',
          uploadAudio: 'Upload audio file for chord generation',
          energyLevel: 'Energy Level',
          chordProgression: 'Chord Progression'
        }
      },
      collaboration: {
        title: 'Collaboration Rooms',
        createRoom: 'Create Room',
        roomName: 'Room Name',
        roomNamePlaceholder: 'Enter room name',
        roomDescription: 'Room Description',
        roomDescriptionPlaceholder: 'Describe the purpose of this room',
        joinRoom: 'Join Room',
        leaveRoom: 'Leave Room',
        typeMessage: 'Type your message...',
        sendMessage: 'Send Message'
      },
      managementApplication: {
        title: 'Management Application Walkthrough',
        steps: {
          submission: 'Application Submission',
          adminReview: 'Admin Review',
          professionalAssignment: 'Professional Assignment',
          contractGeneration: 'Contract Generation',
          multiPartySigning: 'Multi-Party Signing',
          roleTransition: 'Role Transition'
        },
        status: {
          pending: 'Pending',
          completed: 'Completed',
          inProgress: 'In Progress'
        },
        businessDescription: 'Business Description',
        managementTier: 'Management Tier',
        benefits: 'Benefits',
        submitApplication: 'Submit Application',
        approveApplication: 'Approve Application',
        rejectApplication: 'Reject Application'
      },
      technicalRider: {
        title: 'Technical Rider',
        bandMakeup: 'Band Makeup & Instrumentation',
        mixerInputs: 'Mixer Input Patch List',
        lightingRequirements: 'Lighting Requirements',
        hospitalityRequirements: 'Hospitality & Dressing Rooms',
        equipmentSpecs: 'Equipment Specifications',
        soundRequirements: 'Sound Reinforcement',
        stageSetup: 'Stage Setup',
        assignedTo: 'Assigned to',
        channelAssignment: 'Channel Assignment',
        phantomPower: 'Phantom Power Required'
      },
      artists: {
        profileSection: 'Artist Profile',
        musicSection: 'Music & Albums',
        bookingSection: 'Booking Information',
        contactSection: 'Contact Details',
        socialMedia: 'Social Media',
        genres: 'Musical Genres',
        instruments: 'Instruments & Skills',
        performanceHistory: 'Performance History',
        availability: 'Availability',
        rates: 'Performance Rates'
      },
      search: {
        searchPlaceholder: 'Search...',
        filterResults: 'Filter Results',
        sortBy: 'Sort By',
        noResults: 'No results found',
        showMore: 'Show More',
        showLess: 'Show Less',
        clearFilters: 'Clear Filters',
        applyFilters: 'Apply Filters',
        searchResults: 'Search Results',
        resultsPerPage: 'Results per page'
      },
      fileUpload: {
        dragAndDrop: 'Drag and drop files here',
        browseFiles: 'Browse Files',
        selectFiles: 'Select Files',
        uploadProgress: 'Upload Progress',
        cancelUpload: 'Cancel Upload',
        removeFile: 'Remove File',
        fileSize: 'File Size',
        allowedFormats: 'Allowed Formats',
        maxFileSize: 'Maximum File Size'
      },
      notifications: {
        newMessage: 'New Message',
        newBooking: 'New Booking',
        bookingConfirmed: 'Booking Confirmed',
        paymentReceived: 'Payment Received',
        profileUpdated: 'Profile Updated',
        systemMaintenance: 'System Maintenance',
        markAsRead: 'Mark as Read',
        markAllAsRead: 'Mark All as Read',
        clearNotifications: 'Clear Notifications'
      },
      calendar: {
        today: 'Today',
        previousMonth: 'Previous Month',
        nextMonth: 'Next Month',
        selectDate: 'Select Date',
        selectTime: 'Select Time',
        availability: 'Availability',
        booked: 'Booked',
        available: 'Available',
        unavailable: 'Unavailable',
        timeSlot: 'Time Slot',
        duration: 'Duration'
      },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        first: 'First',
        last: 'Last',
        page: 'Page',
        of: 'of',
        goToPage: 'Go to page',
        itemsPerPage: 'Items per page',
        showing: 'Showing',
        to: 'to',
        entries: 'entries'
      },
      errorMessages: {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordsNoMatch: 'Passwords do not match',
        fileTooBig: 'File size is too large',
        invalidFileType: 'Invalid file type',
        networkError: 'Network connection failed',
        serverError: 'Server error occurred',
        notFound: 'Item not found',
        unauthorized: 'Access denied',
        sessionExpired: 'Session has expired',
        uploadFailed: 'Upload failed'
      },
      successMessages: {
        saved: 'Successfully saved',
        uploaded: 'File uploaded successfully',
        created: 'Successfully created',
        updated: 'Successfully updated',
        deleted: 'Successfully deleted',
        sent: 'Message sent successfully',
        loggedIn: 'Login successful',
        loggedOut: 'Logged out successfully',
        passwordChanged: 'Password changed successfully',
        emailVerified: 'Email verified successfully'
      },
      loadingMessages: {
        loading: 'Loading...',
        saving: 'Saving...',
        uploading: 'Uploading...',
        processing: 'Processing...',
        connecting: 'Connecting...',
        authenticating: 'Authenticating...',
        verifying: 'Verifying...',
        sending: 'Sending...',
        updating: 'Updating...',
        deleting: 'Deleting...'
      },
      tooltips: {
        edit: 'Edit this item',
        delete: 'Delete this item',
        view: 'View details',
        download: 'Download file',
        share: 'Share this item',
        copy: 'Copy to clipboard',
        refresh: 'Refresh data',
        settings: 'Open settings',
        help: 'Get help',
        close: 'Close this dialog',
        minimize: 'Minimize window',
        maximize: 'Maximize window'
      },
      accessibility: {
        closeDialog: 'Close dialog',
        openMenu: 'Open menu',
        toggleSidebar: 'Toggle sidebar',
        skipToContent: 'Skip to main content',
        breadcrumbNavigation: 'Breadcrumb navigation',
        pagination: 'Pagination navigation',
        sortColumn: 'Sort by this column',
        expandSection: 'Expand this section',
        collapseSection: 'Collapse this section'
      }
    }
  });

  const updateConfig = (section: string, key: string, value: any) => {
    setUiConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const updateNestedConfig = (section: string, subsection: string, value: any) => {
    setUiConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: value
      }
    }));
  };

  const handleSave = () => {
    toast({ title: 'Success', description: 'Configuration saved successfully!' });
    onSave();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Platform Configuration - UI Controls</h3>
          <p className="text-sm text-muted-foreground">
            WYSIWYG customization system for fonts, colors, layouts, branding, and ALL platform text content
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Apply Changes'}
        </Button>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors & Theme
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout & Spacing
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content Management
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Brush className="h-4 w-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme & Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Primary Colors</Label>
                  <div className="space-y-3">
                    {Object.entries(uiConfig.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')} Color</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="color" 
                            value={value}
                            onChange={(e) => updateConfig('colors', key, e.target.value)}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input 
                            value={value}
                            onChange={(e) => updateConfig('colors', key, e.target.value)}
                            className="w-20 text-xs"
                            placeholder={value}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Theme Mode</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={uiConfig.theme.darkMode}
                        onCheckedChange={(checked) => updateConfig('theme', 'darkMode', checked)}
                      />
                      <Label>Enable Dark Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={uiConfig.theme.autoTheme}
                        onCheckedChange={(checked) => updateConfig('theme', 'autoTheme', checked)}
                      />
                      <Label>Auto Theme (System Preference)</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography & Font Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Font Families</Label>
                  <div className="space-y-3">
                    <div>
                      <Label>Heading Font</Label>
                      <Select 
                        value={uiConfig.typography.headingFont}
                        onValueChange={(value) => updateConfig('typography', 'headingFont', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Body Font</Label>
                      <Select 
                        value={uiConfig.typography.bodyFont}
                        onValueChange={(value) => updateConfig('typography', 'bodyFont', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Font Sizes</Label>
                  <div className="space-y-3">
                    <div>
                      <Label>Base Font Size: {uiConfig.typography.baseFontSize}px</Label>
                      <Slider
                        value={[uiConfig.typography.baseFontSize]}
                        onValueChange={([value]) => updateConfig('typography', 'baseFontSize', value)}
                        max={24}
                        min={12}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Line Height: {uiConfig.typography.lineHeight}</Label>
                      <Slider
                        value={[uiConfig.typography.lineHeight]}
                        onValueChange={([value]) => updateConfig('typography', 'lineHeight', value)}
                        max={2.5}
                        min={1}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout & Spacing Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Max Content Width: {uiConfig.layout.maxWidth}px</Label>
                  <Slider
                    value={[uiConfig.layout.maxWidth]}
                    onValueChange={([value]) => updateConfig('layout', 'maxWidth', value)}
                    max={1600}
                    min={800}
                    step={50}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Toast Duration: {uiConfig.toast.duration}ms</Label>
                  <Slider
                    value={[uiConfig.toast.duration]}
                    onValueChange={([value]) => updateConfig('toast', 'duration', value)}
                    max={10000}
                    min={1000}
                    step={500}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={uiConfig.animations.enabled}
                    onCheckedChange={(checked) => updateConfig('animations', 'enabled', checked)}
                  />
                  <Label>Enable Animations</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Platform Content Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Edit ALL text content across the platform including navigation, pages, forms, and messages
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Navigation Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Navigation Menu Text
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Home</Label>
                    <Input
                      value={uiConfig.content.navigation.home}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, home: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Artists</Label>
                    <Input
                      value={uiConfig.content.navigation.artists}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, artists: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Music</Label>
                    <Input
                      value={uiConfig.content.navigation.music}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, music: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Booking</Label>
                    <Input
                      value={uiConfig.content.navigation.booking}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, booking: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>About</Label>
                    <Input
                      value={uiConfig.content.navigation.about}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, about: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Contact</Label>
                    <Input
                      value={uiConfig.content.navigation.contact}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, contact: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Login</Label>
                    <Input
                      value={uiConfig.content.navigation.login}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, login: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Sign Up</Label>
                    <Input
                      value={uiConfig.content.navigation.signup}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, signup: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Dashboard</Label>
                    <Input
                      value={uiConfig.content.navigation.dashboard}
                      onChange={(e) => updateNestedConfig('content', 'navigation', {...uiConfig.content.navigation, dashboard: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Homepage Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Homepage Content</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Hero Title</Label>
                    <Input
                      value={uiConfig.content.homepage.heroTitle}
                      onChange={(e) => updateConfig('content', 'homepage', {...uiConfig.content.homepage, heroTitle: e.target.value})}
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <Label>Hero Subtitle</Label>
                    <Input
                      value={uiConfig.content.homepage.heroSubtitle}
                      onChange={(e) => updateConfig('content', 'homepage', {...uiConfig.content.homepage, heroSubtitle: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Button Text</Label>
                      <Input
                        value={uiConfig.content.homepage.heroButtonPrimary}
                        onChange={(e) => updateConfig('content', 'homepage', {...uiConfig.content.homepage, heroButtonPrimary: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Secondary Button Text</Label>
                      <Input
                        value={uiConfig.content.homepage.heroButtonSecondary}
                        onChange={(e) => updateConfig('content', 'homepage', {...uiConfig.content.homepage, heroButtonSecondary: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Features Section Title</Label>
                    <Input
                      value={uiConfig.content.homepage.featuresTitle}
                      onChange={(e) => updateConfig('content', 'homepage', {...uiConfig.content.homepage, featuresTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>About Section Title</Label>
                    <Input
                      value={uiConfig.content.homepage.aboutTitle}
                      onChange={(e) => updateConfig('content', 'homepage', {...uiConfig.content.homepage, aboutTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>About Section Text</Label>
                    <textarea 
                      className="w-full p-3 border rounded-md"
                      rows={3}
                      value={uiConfig.content.homepage.aboutText}
                      onChange={(e) => updateConfig('content', 'homepage', {...uiConfig.content.homepage, aboutText: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking Page Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Booking System Content</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Page Title</Label>
                    <Input
                      value={uiConfig.content.booking.title}
                      onChange={(e) => updateConfig('content', 'booking', {...uiConfig.content.booking, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Page Subtitle</Label>
                    <Input
                      value={uiConfig.content.booking.subtitle}
                      onChange={(e) => updateConfig('content', 'booking', {...uiConfig.content.booking, subtitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Search Placeholder</Label>
                    <Input
                      value={uiConfig.content.booking.searchPlaceholder}
                      onChange={(e) => updateConfig('content', 'booking', {...uiConfig.content.booking, searchPlaceholder: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Book Now Button</Label>
                    <Input
                      value={uiConfig.content.booking.bookNowButton}
                      onChange={(e) => updateConfig('content', 'booking', {...uiConfig.content.booking, bookNowButton: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>View Profile Button</Label>
                    <Input
                      value={uiConfig.content.booking.viewProfileButton}
                      onChange={(e) => updateConfig('content', 'booking', {...uiConfig.content.booking, viewProfileButton: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Price Label</Label>
                    <Input
                      value={uiConfig.content.booking.priceLabel}
                      onChange={(e) => updateConfig('content', 'booking', {...uiConfig.content.booking, priceLabel: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Elements Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Form Elements & Buttons</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Email Label</Label>
                    <Input
                      value={uiConfig.content.forms.emailLabel}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, emailLabel: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Password Label</Label>
                    <Input
                      value={uiConfig.content.forms.passwordLabel}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, passwordLabel: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Full Name Label</Label>
                    <Input
                      value={uiConfig.content.forms.fullNameLabel}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, fullNameLabel: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Submit Button</Label>
                    <Input
                      value={uiConfig.content.forms.submitButton}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, submitButton: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Cancel Button</Label>
                    <Input
                      value={uiConfig.content.forms.cancelButton}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, cancelButton: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Save Button</Label>
                    <Input
                      value={uiConfig.content.forms.saveButton}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, saveButton: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Edit Button</Label>
                    <Input
                      value={uiConfig.content.forms.editButton}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, editButton: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Delete Button</Label>
                    <Input
                      value={uiConfig.content.forms.deleteButton}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, deleteButton: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Upload Button</Label>
                    <Input
                      value={uiConfig.content.forms.uploadButton}
                      onChange={(e) => updateConfig('content', 'forms', {...uiConfig.content.forms, uploadButton: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* System Messages */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">System Messages & Notifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Success Title</Label>
                    <Input
                      value={uiConfig.content.messages.successTitle}
                      onChange={(e) => updateConfig('content', 'messages', {...uiConfig.content.messages, successTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Error Title</Label>
                    <Input
                      value={uiConfig.content.messages.errorTitle}
                      onChange={(e) => updateConfig('content', 'messages', {...uiConfig.content.messages, errorTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Loading Message</Label>
                    <Input
                      value={uiConfig.content.messages.loadingMessage}
                      onChange={(e) => updateConfig('content', 'messages', {...uiConfig.content.messages, loadingMessage: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>No Data Message</Label>
                    <Input
                      value={uiConfig.content.messages.noDataMessage}
                      onChange={(e) => updateConfig('content', 'messages', {...uiConfig.content.messages, noDataMessage: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Unauthorized Message</Label>
                    <Input
                      value={uiConfig.content.messages.unauthorizedMessage}
                      onChange={(e) => updateConfig('content', 'messages', {...uiConfig.content.messages, unauthorizedMessage: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Network Error Message</Label>
                    <Input
                      value={uiConfig.content.messages.networkErrorMessage}
                      onChange={(e) => updateConfig('content', 'messages', {...uiConfig.content.messages, networkErrorMessage: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dashboard Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Dashboard Content</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Welcome Message</Label>
                    <Input
                      value={uiConfig.content.dashboard.welcomeMessage}
                      onChange={(e) => updateNestedConfig('content', 'dashboard', {...uiConfig.content.dashboard, welcomeMessage: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Overview Title</Label>
                    <Input
                      value={uiConfig.content.dashboard.overviewTitle}
                      onChange={(e) => updateNestedConfig('content', 'dashboard', {...uiConfig.content.dashboard, overviewTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Recent Activity</Label>
                    <Input
                      value={uiConfig.content.dashboard.recentActivity}
                      onChange={(e) => updateNestedConfig('content', 'dashboard', {...uiConfig.content.dashboard, recentActivity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Upcoming Events</Label>
                    <Input
                      value={uiConfig.content.dashboard.upcomingEvents}
                      onChange={(e) => updateNestedConfig('content', 'dashboard', {...uiConfig.content.dashboard, upcomingEvents: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Analytics</Label>
                    <Input
                      value={uiConfig.content.dashboard.analytics}
                      onChange={(e) => updateNestedConfig('content', 'dashboard', {...uiConfig.content.dashboard, analytics: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Quick Actions</Label>
                    <Input
                      value={uiConfig.content.dashboard.quickActions}
                      onChange={(e) => updateNestedConfig('content', 'dashboard', {...uiConfig.content.dashboard, quickActions: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Modal Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Modal Content</h4>
                
                {/* Email Config Modal */}
                <div className="space-y-3">
                  <h5 className="font-medium">Email Configuration Modal</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Modal Title</Label>
                      <Input
                        value={uiConfig.content.modals.emailConfig.title}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, emailConfig: {...uiConfig.content.modals.emailConfig, title: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>SMTP Server</Label>
                      <Input
                        value={uiConfig.content.modals.emailConfig.smtpServer}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, emailConfig: {...uiConfig.content.modals.emailConfig, smtpServer: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={uiConfig.content.modals.emailConfig.username}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, emailConfig: {...uiConfig.content.modals.emailConfig, username: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                {/* Music Upload Modal */}
                <div className="space-y-3">
                  <h5 className="font-medium">Music Upload Modal</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Track Title</Label>
                      <Input
                        value={uiConfig.content.modals.musicUpload.trackTitle}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, musicUpload: {...uiConfig.content.modals.musicUpload, trackTitle: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Genre</Label>
                      <Input
                        value={uiConfig.content.modals.musicUpload.genre}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, musicUpload: {...uiConfig.content.modals.musicUpload, genre: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>ISRC Code</Label>
                      <Input
                        value={uiConfig.content.modals.musicUpload.isrcCode}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, musicUpload: {...uiConfig.content.modals.musicUpload, isrcCode: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={uiConfig.content.modals.musicUpload.duration}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, musicUpload: {...uiConfig.content.modals.musicUpload, duration: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={uiConfig.content.modals.musicUpload.description}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, musicUpload: {...uiConfig.content.modals.musicUpload, description: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        value={uiConfig.content.modals.musicUpload.price}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, musicUpload: {...uiConfig.content.modals.musicUpload, price: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                {/* Calendar Modal */}
                <div className="space-y-3">
                  <h5 className="font-medium">Calendar Modal</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Event Title</Label>
                      <Input
                        value={uiConfig.content.modals.calendarModal.eventTitle}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, calendarModal: {...uiConfig.content.modals.calendarModal, eventTitle: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={uiConfig.content.modals.calendarModal.startDate}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, calendarModal: {...uiConfig.content.modals.calendarModal, startDate: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={uiConfig.content.modals.calendarModal.location}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, calendarModal: {...uiConfig.content.modals.calendarModal, location: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>All Day Event</Label>
                      <Input
                        value={uiConfig.content.modals.calendarModal.allDay}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, calendarModal: {...uiConfig.content.modals.calendarModal, allDay: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Save Event</Label>
                      <Input
                        value={uiConfig.content.modals.calendarModal.saveEvent}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, calendarModal: {...uiConfig.content.modals.calendarModal, saveEvent: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Delete Event</Label>
                      <Input
                        value={uiConfig.content.modals.calendarModal.deleteEvent}
                        onChange={(e) => updateNestedConfig('content', 'modals', {...uiConfig.content.modals, calendarModal: {...uiConfig.content.modals.calendarModal, deleteEvent: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Search & Filter Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Search & Filter Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Search Placeholder</Label>
                    <Input
                      value={uiConfig.content.search.searchPlaceholder}
                      onChange={(e) => updateNestedConfig('content', 'search', {...uiConfig.content.search, searchPlaceholder: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Filter Results</Label>
                    <Input
                      value={uiConfig.content.search.filterResults}
                      onChange={(e) => updateNestedConfig('content', 'search', {...uiConfig.content.search, filterResults: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Sort By</Label>
                    <Input
                      value={uiConfig.content.search.sortBy}
                      onChange={(e) => updateNestedConfig('content', 'search', {...uiConfig.content.search, sortBy: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>No Results</Label>
                    <Input
                      value={uiConfig.content.search.noResults}
                      onChange={(e) => updateNestedConfig('content', 'search', {...uiConfig.content.search, noResults: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Clear Filters</Label>
                    <Input
                      value={uiConfig.content.search.clearFilters}
                      onChange={(e) => updateNestedConfig('content', 'search', {...uiConfig.content.search, clearFilters: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Apply Filters</Label>
                    <Input
                      value={uiConfig.content.search.applyFilters}
                      onChange={(e) => updateNestedConfig('content', 'search', {...uiConfig.content.search, applyFilters: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* File Upload Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">File Upload Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Drag and Drop</Label>
                    <Input
                      value={uiConfig.content.fileUpload.dragAndDrop}
                      onChange={(e) => updateNestedConfig('content', 'fileUpload', {...uiConfig.content.fileUpload, dragAndDrop: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Browse Files</Label>
                    <Input
                      value={uiConfig.content.fileUpload.browseFiles}
                      onChange={(e) => updateNestedConfig('content', 'fileUpload', {...uiConfig.content.fileUpload, browseFiles: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Upload Progress</Label>
                    <Input
                      value={uiConfig.content.fileUpload.uploadProgress}
                      onChange={(e) => updateNestedConfig('content', 'fileUpload', {...uiConfig.content.fileUpload, uploadProgress: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Cancel Upload</Label>
                    <Input
                      value={uiConfig.content.fileUpload.cancelUpload}
                      onChange={(e) => updateNestedConfig('content', 'fileUpload', {...uiConfig.content.fileUpload, cancelUpload: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Remove File</Label>
                    <Input
                      value={uiConfig.content.fileUpload.removeFile}
                      onChange={(e) => updateNestedConfig('content', 'fileUpload', {...uiConfig.content.fileUpload, removeFile: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Allowed Formats</Label>
                    <Input
                      value={uiConfig.content.fileUpload.allowedFormats}
                      onChange={(e) => updateNestedConfig('content', 'fileUpload', {...uiConfig.content.fileUpload, allowedFormats: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notifications Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Notifications Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>New Message</Label>
                    <Input
                      value={uiConfig.content.notifications.newMessage}
                      onChange={(e) => updateNestedConfig('content', 'notifications', {...uiConfig.content.notifications, newMessage: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>New Booking</Label>
                    <Input
                      value={uiConfig.content.notifications.newBooking}
                      onChange={(e) => updateNestedConfig('content', 'notifications', {...uiConfig.content.notifications, newBooking: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Booking Confirmed</Label>
                    <Input
                      value={uiConfig.content.notifications.bookingConfirmed}
                      onChange={(e) => updateNestedConfig('content', 'notifications', {...uiConfig.content.notifications, bookingConfirmed: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Mark as Read</Label>
                    <Input
                      value={uiConfig.content.notifications.markAsRead}
                      onChange={(e) => updateNestedConfig('content', 'notifications', {...uiConfig.content.notifications, markAsRead: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Mark All as Read</Label>
                    <Input
                      value={uiConfig.content.notifications.markAllAsRead}
                      onChange={(e) => updateNestedConfig('content', 'notifications', {...uiConfig.content.notifications, markAllAsRead: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Clear Notifications</Label>
                    <Input
                      value={uiConfig.content.notifications.clearNotifications}
                      onChange={(e) => updateNestedConfig('content', 'notifications', {...uiConfig.content.notifications, clearNotifications: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Calendar Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Calendar Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Today</Label>
                    <Input
                      value={uiConfig.content.calendar.today}
                      onChange={(e) => updateNestedConfig('content', 'calendar', {...uiConfig.content.calendar, today: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Previous Month</Label>
                    <Input
                      value={uiConfig.content.calendar.previousMonth}
                      onChange={(e) => updateNestedConfig('content', 'calendar', {...uiConfig.content.calendar, previousMonth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Next Month</Label>
                    <Input
                      value={uiConfig.content.calendar.nextMonth}
                      onChange={(e) => updateNestedConfig('content', 'calendar', {...uiConfig.content.calendar, nextMonth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Select Date</Label>
                    <Input
                      value={uiConfig.content.calendar.selectDate}
                      onChange={(e) => updateNestedConfig('content', 'calendar', {...uiConfig.content.calendar, selectDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Available</Label>
                    <Input
                      value={uiConfig.content.calendar.available}
                      onChange={(e) => updateNestedConfig('content', 'calendar', {...uiConfig.content.calendar, available: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Booked</Label>
                    <Input
                      value={uiConfig.content.calendar.booked}
                      onChange={(e) => updateNestedConfig('content', 'calendar', {...uiConfig.content.calendar, booked: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pagination Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Pagination Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Previous</Label>
                    <Input
                      value={uiConfig.content.pagination.previous}
                      onChange={(e) => updateNestedConfig('content', 'pagination', {...uiConfig.content.pagination, previous: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Next</Label>
                    <Input
                      value={uiConfig.content.pagination.next}
                      onChange={(e) => updateNestedConfig('content', 'pagination', {...uiConfig.content.pagination, next: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Page</Label>
                    <Input
                      value={uiConfig.content.pagination.page}
                      onChange={(e) => updateNestedConfig('content', 'pagination', {...uiConfig.content.pagination, page: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Of</Label>
                    <Input
                      value={uiConfig.content.pagination.of}
                      onChange={(e) => updateNestedConfig('content', 'pagination', {...uiConfig.content.pagination, of: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Showing</Label>
                    <Input
                      value={uiConfig.content.pagination.showing}
                      onChange={(e) => updateNestedConfig('content', 'pagination', {...uiConfig.content.pagination, showing: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Entries</Label>
                    <Input
                      value={uiConfig.content.pagination.entries}
                      onChange={(e) => updateNestedConfig('content', 'pagination', {...uiConfig.content.pagination, entries: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Collaboration Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Collaboration Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Collaboration Title</Label>
                    <Input
                      value={uiConfig.content.collaboration.title}
                      onChange={(e) => updateNestedConfig('content', 'collaboration', {...uiConfig.content.collaboration, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Create Room</Label>
                    <Input
                      value={uiConfig.content.collaboration.createRoom}
                      onChange={(e) => updateNestedConfig('content', 'collaboration', {...uiConfig.content.collaboration, createRoom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Room Name</Label>
                    <Input
                      value={uiConfig.content.collaboration.roomName}
                      onChange={(e) => updateNestedConfig('content', 'collaboration', {...uiConfig.content.collaboration, roomName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Join Room</Label>
                    <Input
                      value={uiConfig.content.collaboration.joinRoom}
                      onChange={(e) => updateNestedConfig('content', 'collaboration', {...uiConfig.content.collaboration, joinRoom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Send Message</Label>
                    <Input
                      value={uiConfig.content.collaboration.sendMessage}
                      onChange={(e) => updateNestedConfig('content', 'collaboration', {...uiConfig.content.collaboration, sendMessage: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Leave Room</Label>
                    <Input
                      value={uiConfig.content.collaboration.leaveRoom}
                      onChange={(e) => updateNestedConfig('content', 'collaboration', {...uiConfig.content.collaboration, leaveRoom: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Management Application Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Management Application Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Application Title</Label>
                    <Input
                      value={uiConfig.content.managementApplication.title}
                      onChange={(e) => updateNestedConfig('content', 'managementApplication', {...uiConfig.content.managementApplication, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Submit Application</Label>
                    <Input
                      value={uiConfig.content.managementApplication.submitApplication}
                      onChange={(e) => updateNestedConfig('content', 'managementApplication', {...uiConfig.content.managementApplication, submitApplication: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Approve Application</Label>
                    <Input
                      value={uiConfig.content.managementApplication.approveApplication}
                      onChange={(e) => updateNestedConfig('content', 'managementApplication', {...uiConfig.content.managementApplication, approveApplication: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Business Description</Label>
                    <Input
                      value={uiConfig.content.managementApplication.businessDescription}
                      onChange={(e) => updateNestedConfig('content', 'managementApplication', {...uiConfig.content.managementApplication, businessDescription: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Management Tier</Label>
                    <Input
                      value={uiConfig.content.managementApplication.managementTier}
                      onChange={(e) => updateNestedConfig('content', 'managementApplication', {...uiConfig.content.managementApplication, managementTier: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Benefits</Label>
                    <Input
                      value={uiConfig.content.managementApplication.benefits}
                      onChange={(e) => updateNestedConfig('content', 'managementApplication', {...uiConfig.content.managementApplication, benefits: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Technical Rider Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Technical Rider Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Technical Rider Title</Label>
                    <Input
                      value={uiConfig.content.technicalRider.title}
                      onChange={(e) => updateNestedConfig('content', 'technicalRider', {...uiConfig.content.technicalRider, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Band Makeup</Label>
                    <Input
                      value={uiConfig.content.technicalRider.bandMakeup}
                      onChange={(e) => updateNestedConfig('content', 'technicalRider', {...uiConfig.content.technicalRider, bandMakeup: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Mixer Inputs</Label>
                    <Input
                      value={uiConfig.content.technicalRider.mixerInputs}
                      onChange={(e) => updateNestedConfig('content', 'technicalRider', {...uiConfig.content.technicalRider, mixerInputs: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Lighting Requirements</Label>
                    <Input
                      value={uiConfig.content.technicalRider.lightingRequirements}
                      onChange={(e) => updateNestedConfig('content', 'technicalRider', {...uiConfig.content.technicalRider, lightingRequirements: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Equipment Specs</Label>
                    <Input
                      value={uiConfig.content.technicalRider.equipmentSpecs}
                      onChange={(e) => updateNestedConfig('content', 'technicalRider', {...uiConfig.content.technicalRider, equipmentSpecs: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Stage Setup</Label>
                    <Input
                      value={uiConfig.content.technicalRider.stageSetup}
                      onChange={(e) => updateNestedConfig('content', 'technicalRider', {...uiConfig.content.technicalRider, stageSetup: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Artist Profile Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Artist Profile Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Profile Section</Label>
                    <Input
                      value={uiConfig.content.artists.profileSection}
                      onChange={(e) => updateNestedConfig('content', 'artists', {...uiConfig.content.artists, profileSection: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Music Section</Label>
                    <Input
                      value={uiConfig.content.artists.musicSection}
                      onChange={(e) => updateNestedConfig('content', 'artists', {...uiConfig.content.artists, musicSection: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Booking Section</Label>
                    <Input
                      value={uiConfig.content.artists.bookingSection}
                      onChange={(e) => updateNestedConfig('content', 'artists', {...uiConfig.content.artists, bookingSection: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Contact Section</Label>
                    <Input
                      value={uiConfig.content.artists.contactSection}
                      onChange={(e) => updateNestedConfig('content', 'artists', {...uiConfig.content.artists, contactSection: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Social Media</Label>
                    <Input
                      value={uiConfig.content.artists.socialMedia}
                      onChange={(e) => updateNestedConfig('content', 'artists', {...uiConfig.content.artists, socialMedia: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Performance Rates</Label>
                    <Input
                      value={uiConfig.content.artists.rates}
                      onChange={(e) => updateNestedConfig('content', 'artists', {...uiConfig.content.artists, rates: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Error Messages Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Error Messages Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Required Field</Label>
                    <Input
                      value={uiConfig.content.errorMessages.required}
                      onChange={(e) => updateNestedConfig('content', 'errorMessages', {...uiConfig.content.errorMessages, required: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Invalid Email</Label>
                    <Input
                      value={uiConfig.content.errorMessages.invalidEmail}
                      onChange={(e) => updateNestedConfig('content', 'errorMessages', {...uiConfig.content.errorMessages, invalidEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Network Error</Label>
                    <Input
                      value={uiConfig.content.errorMessages.networkError}
                      onChange={(e) => updateNestedConfig('content', 'errorMessages', {...uiConfig.content.errorMessages, networkError: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Server Error</Label>
                    <Input
                      value={uiConfig.content.errorMessages.serverError}
                      onChange={(e) => updateNestedConfig('content', 'errorMessages', {...uiConfig.content.errorMessages, serverError: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Unauthorized</Label>
                    <Input
                      value={uiConfig.content.errorMessages.unauthorized}
                      onChange={(e) => updateNestedConfig('content', 'errorMessages', {...uiConfig.content.errorMessages, unauthorized: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Upload Failed</Label>
                    <Input
                      value={uiConfig.content.errorMessages.uploadFailed}
                      onChange={(e) => updateNestedConfig('content', 'errorMessages', {...uiConfig.content.errorMessages, uploadFailed: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Success Messages Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Success Messages Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Successfully Saved</Label>
                    <Input
                      value={uiConfig.content.successMessages.saved}
                      onChange={(e) => updateNestedConfig('content', 'successMessages', {...uiConfig.content.successMessages, saved: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>File Uploaded</Label>
                    <Input
                      value={uiConfig.content.successMessages.uploaded}
                      onChange={(e) => updateNestedConfig('content', 'successMessages', {...uiConfig.content.successMessages, uploaded: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Successfully Created</Label>
                    <Input
                      value={uiConfig.content.successMessages.created}
                      onChange={(e) => updateNestedConfig('content', 'successMessages', {...uiConfig.content.successMessages, created: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Successfully Updated</Label>
                    <Input
                      value={uiConfig.content.successMessages.updated}
                      onChange={(e) => updateNestedConfig('content', 'successMessages', {...uiConfig.content.successMessages, updated: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Login Successful</Label>
                    <Input
                      value={uiConfig.content.successMessages.loggedIn}
                      onChange={(e) => updateNestedConfig('content', 'successMessages', {...uiConfig.content.successMessages, loggedIn: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Message Sent</Label>
                    <Input
                      value={uiConfig.content.successMessages.sent}
                      onChange={(e) => updateNestedConfig('content', 'successMessages', {...uiConfig.content.successMessages, sent: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Loading Messages Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Loading Messages Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Loading</Label>
                    <Input
                      value={uiConfig.content.loadingMessages.loading}
                      onChange={(e) => updateNestedConfig('content', 'loadingMessages', {...uiConfig.content.loadingMessages, loading: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Saving</Label>
                    <Input
                      value={uiConfig.content.loadingMessages.saving}
                      onChange={(e) => updateNestedConfig('content', 'loadingMessages', {...uiConfig.content.loadingMessages, saving: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Uploading</Label>
                    <Input
                      value={uiConfig.content.loadingMessages.uploading}
                      onChange={(e) => updateNestedConfig('content', 'loadingMessages', {...uiConfig.content.loadingMessages, uploading: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Processing</Label>
                    <Input
                      value={uiConfig.content.loadingMessages.processing}
                      onChange={(e) => updateNestedConfig('content', 'loadingMessages', {...uiConfig.content.loadingMessages, processing: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Connecting</Label>
                    <Input
                      value={uiConfig.content.loadingMessages.connecting}
                      onChange={(e) => updateNestedConfig('content', 'loadingMessages', {...uiConfig.content.loadingMessages, connecting: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Authenticating</Label>
                    <Input
                      value={uiConfig.content.loadingMessages.authenticating}
                      onChange={(e) => updateNestedConfig('content', 'loadingMessages', {...uiConfig.content.loadingMessages, authenticating: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tooltips Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Tooltips Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Edit Tooltip</Label>
                    <Input
                      value={uiConfig.content.tooltips.edit}
                      onChange={(e) => updateNestedConfig('content', 'tooltips', {...uiConfig.content.tooltips, edit: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Delete Tooltip</Label>
                    <Input
                      value={uiConfig.content.tooltips.delete}
                      onChange={(e) => updateNestedConfig('content', 'tooltips', {...uiConfig.content.tooltips, delete: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>View Tooltip</Label>
                    <Input
                      value={uiConfig.content.tooltips.view}
                      onChange={(e) => updateNestedConfig('content', 'tooltips', {...uiConfig.content.tooltips, view: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Download Tooltip</Label>
                    <Input
                      value={uiConfig.content.tooltips.download}
                      onChange={(e) => updateNestedConfig('content', 'tooltips', {...uiConfig.content.tooltips, download: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Share Tooltip</Label>
                    <Input
                      value={uiConfig.content.tooltips.share}
                      onChange={(e) => updateNestedConfig('content', 'tooltips', {...uiConfig.content.tooltips, share: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Settings Tooltip</Label>
                    <Input
                      value={uiConfig.content.tooltips.settings}
                      onChange={(e) => updateNestedConfig('content', 'tooltips', {...uiConfig.content.tooltips, settings: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Accessibility Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Accessibility Content</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Close Dialog</Label>
                    <Input
                      value={uiConfig.content.accessibility.closeDialog}
                      onChange={(e) => updateNestedConfig('content', 'accessibility', {...uiConfig.content.accessibility, closeDialog: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Open Menu</Label>
                    <Input
                      value={uiConfig.content.accessibility.openMenu}
                      onChange={(e) => updateNestedConfig('content', 'accessibility', {...uiConfig.content.accessibility, openMenu: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Toggle Sidebar</Label>
                    <Input
                      value={uiConfig.content.accessibility.toggleSidebar}
                      onChange={(e) => updateNestedConfig('content', 'accessibility', {...uiConfig.content.accessibility, toggleSidebar: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Skip to Content</Label>
                    <Input
                      value={uiConfig.content.accessibility.skipToContent}
                      onChange={(e) => updateNestedConfig('content', 'accessibility', {...uiConfig.content.accessibility, skipToContent: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Breadcrumb Navigation</Label>
                    <Input
                      value={uiConfig.content.accessibility.breadcrumbNavigation}
                      onChange={(e) => updateNestedConfig('content', 'accessibility', {...uiConfig.content.accessibility, breadcrumbNavigation: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Sort Column</Label>
                    <Input
                      value={uiConfig.content.accessibility.sortColumn}
                      onChange={(e) => updateNestedConfig('content', 'accessibility', {...uiConfig.content.accessibility, sortColumn: e.target.value})}
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5" />
                Platform Branding & Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Platform Name</Label>
                    <Input
                      value={uiConfig.branding.platformName}
                      onChange={(e) => updateConfig('branding', 'platformName', e.target.value)}
                      placeholder="Enter platform name"
                    />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input
                      value={uiConfig.branding.tagline}
                      onChange={(e) => updateConfig('branding', 'tagline', e.target.value)}
                      placeholder="Enter platform tagline"
                    />
                  </div>
                </div>
                <div>
                  <Label>Copyright Text</Label>
                  <Input
                    value={uiConfig.branding.copyright}
                    onChange={(e) => updateConfig('branding', 'copyright', e.target.value)}
                    placeholder="Enter copyright text"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};