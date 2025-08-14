// WaituMusic Platform Content Configuration
// This file contains all public-facing text content for easy modification

export const SITE_CONFIG = {
  name: "Wai'tuMusic",
  tagline: "Professional Music Industry Management Platform",
  description: "Comprehensive music label management platform connecting artists, professionals, and fans through role-based access control, booking management, and e-commerce functionality.",
  domain: "waitumusic.com"
};

export const HOMEPAGE_CONTENT = {
  hero: {
    title: "Caribbean's Premier Music Industry Platform",
    subtitle: "Connect with artists, book talent, and grow your music career with professional-grade tools and AI-powered opportunities",
    cta: {
      primary: "Sign Up Now",
      secondary: "Book an Artist",
      tertiary: "Login"
    }
  },
  
  features: {
    title: "Platform Features",
    subtitle: "Everything you need to succeed in the music industry",
    items: [
      {
        title: "Smart Booking Calendar System",
        description: "Color-coded dual calendar system with role restrictions. Only managed artists, musicians, and professionals can access booking functionalities with automated conflict detection."
      },
      {
        title: "Automated Contracts",
        description: "Generate booking agreements, technical riders, and performance contracts automatically upon booking initiation."
      },
      {
        title: "Dynamic Pricing",
        description: "100% base price payout guarantee with transparent add-on pricing and residual income tracking."
      },
      {
        title: "Music Catalog",
        description: "Comprehensive music library with streaming capabilities, purchase options, and artist management tools."
      },
      {
        title: "Professional Networking",
        description: "Connect with industry professionals, collaborate on projects, and access exclusive opportunities."
      },
      {
        title: "AI-Powered Opportunities",
        description: "Intelligent opportunity matching system connecting artists with relevant industry opportunities and collaborations."
      }
    ]
  },

  services: {
    title: "Popular Services",
    subtitle: "Professional music industry services",
    items: [
      {
        name: "Live Performance Booking",
        description: "Professional live performance booking with automated contracts",
        basePrice: 500,
        currency: "USD",
        category: "Performance",
        popular: true
      },
      {
        name: "Music Production",
        description: "Full-service music production from recording to mastering",
        basePrice: 300,
        currency: "USD",
        category: "Production",
        popular: true
      },
      {
        name: "Artist Consultation",
        description: "One-on-one career consultation with industry professionals",
        basePrice: 150,
        currency: "USD",
        category: "Consultation",
        popular: true
      }
    ]
  },

  userRoles: {
    title: "User Roles & Access Levels",
    subtitle: "Choose your path in the music industry",
    roles: [
      {
        title: "Managed Artist",
        description: "Full/Admin management tiers, booking calendar access, EPK system",
        access: "Tier Benefits",
        color: "green"
      },
      {
        title: "Artist",
        description: "Independent artists with standard permissions, music catalog, 30-second previews",
        access: "Standard Access",
        color: "orange"
      },
      {
        title: "Managed Musician",
        description: "Session musicians with management benefits, booking assignments",
        access: "Tier Benefits",
        color: "blue"
      },
      {
        title: "Musician",
        description: "Independent session musicians with standard booking capabilities",
        access: "Standard Access",
        color: "purple"
      },
      {
        title: "Music Professional",
        description: "Industry professionals offering specialized services and consultations",
        access: "Professional Access",
        color: "indigo"
      },
      {
        title: "Fan",
        description: "General browsing, purchasing, upgrade requests to higher roles",
        access: "Public Access",
        color: "gray"
      }
    ]
  },

  stats: {
    title: "Platform Statistics",
    items: [
      {
        label: "Active Artists",
        apiEndpoint: "/api/stats/artists"
      },
      {
        label: "Successful Bookings",
        apiEndpoint: "/api/stats/bookings"
      },
      {
        label: "Music Tracks",
        apiEndpoint: "/api/stats/songs"
      },
      {
        label: "Industry Professionals",
        apiEndpoint: "/api/stats/professionals"
      }
    ]
  }
};

export const NAVIGATION_CONTENT = {
  main: [
    { label: "Home", href: "/" },
    { label: "Artists", href: "/artists" },
    { label: "Bookings", href: "/booking" },
    { label: "Services", href: "/services" },
    { label: "Store", href: "/store" }
  ],
  auth: {
    login: "Sign In",
    register: "Sign Up",
    logout: "Logout",
    dashboard: "Dashboard"
  }
};

export const LOGIN_CONTENT = {
  title: "Welcome Back",
  subtitle: "Sign in to your account",
  description: "Enter your credentials to access your dashboard",
  form: {
    email: {
      label: "Email",
      placeholder: "Enter your email"
    },
    password: {
      label: "Password",
      placeholder: "Enter your password"
    },
    submit: "Sign In",
    submitting: "Signing in..."
  },
  demoSection: {
    title: "Or try demo accounts",
    subtitle: "Explore the platform with pre-configured demo accounts"
  },
  footer: {
    noAccount: "Don't have an account?",
    signUp: "Sign up"
  }
};

export const MODAL_CONTENT = {
  common: {
    close: "Close",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    loading: "Loading...",
    success: "Success",
    error: "Error"
  },
  
  pressRelease: {
    view: {
      title: "View Press Release",
      description: "Review the complete press release content and details"
    },
    edit: {
      title: "Edit Press Release",
      description: "Modify press release content and settings",
      saveButton: "Save Changes"
    }
  },

  onboarding: {
    title: "Intelligent Onboarding",
    description: "Let's personalize your experience",
    steps: [
      {
        title: "Welcome to Wai'tuMusic",
        description: "Let's personalize your experience"
      },
      {
        title: "Choose Your Role",
        description: "Help us understand how you'll use the platform"
      },
      {
        title: "Your Preferences",
        description: "Tell us about your musical interests and goals"
      },
      {
        title: "AI Personalization",
        description: "Our AI creates your personalized experience"
      },
      {
        title: "Your Recommendations",
        description: "Discover features and opportunities tailored for you"
      }
    ]
  }
};

export const ERROR_MESSAGES = {
  generic: "Something went wrong. Please try again.",
  network: "Network error. Please check your connection.",
  unauthorized: "You don't have permission to access this resource.",
  notFound: "The requested resource was not found.",
  validation: "Please check your input and try again."
};

export const SUCCESS_MESSAGES = {
  saved: "Changes saved successfully",
  created: "Created successfully",
  updated: "Updated successfully",
  deleted: "Deleted successfully",
  published: "Published successfully"
};

// Navigation content configuration
export const NAVIGATION_LABELS = {
  main: {
    home: "Home",
    artists: "Artists", 
    bookings: "Bookings",
    services: "Services",
    store: "Store"
  },
  auth: {
    login: "Sign In",
    register: "Sign Up",
    logout: "Logout",
    dashboard: "Dashboard"
  },
  mobile: {
    pianoKeys: {
      home: "Home ♪",
      artists: "Artists ♫", 
      bookings: "Book ♪",
      services: "Services ♫",
      store: "Store ♪",
      login: "Sign In ♪"
    }
  }
};

// Footer content configuration
export const FOOTER_CONTENT = {
  company: {
    name: SITE_CONFIG.name,
    description: "Professional music industry management platform",
    address: "Caribbean Music Industry Hub"
  },
  links: {
    about: "About Us",
    contact: "Contact",
    privacy: "Privacy Policy", 
    terms: "Terms of Service",
    support: "Support"
  },
  copyright: `© ${new Date().getFullYear()} ${SITE_CONFIG.name}. All rights reserved.`
};

// Demo mode content configuration - Only includes accounts that exist AND are marked as demo in database
export const DEMO_CONTENT = {
  title: "Demo Accounts",
  subtitle: "Try the platform with pre-configured demo accounts",
  accounts: [
    { role: 'Fan', email: 'fan@waitumusic.com', password: 'secret123' },
    { role: 'Consultant', email: 'consultant@waitumusic.com', password: 'secret123' },
    { role: 'Artist - Princess Trinidad', email: 'princesstrinidad@waitumusic.com', password: 'secret123' },
    { role: 'Artist - Sarah J', email: 'artist2@waitumusic.com', password: 'secret123' },
    { role: 'Musician - Mike Rodriguez', email: 'musician2@waitumusic.com', password: 'secret123' },
    { role: 'Managed Artist', email: 'managed_artist2@waitumusic.com', password: 'secret123' },
    { role: 'Managed Musician', email: 'managed_musician2@waitumusic.com', password: 'secret123' }
  ]
};

// Button and action text configuration
export const ACTION_TEXT = {
  buttons: {
    getStarted: "Get Started",
    learnMore: "Learn More",
    signUp: "Sign Up Now",
    bookArtist: "Book an Artist",
    viewServices: "View Services",
    discoverArtists: "Discover Artists",
    bookNow: "Book Now",
    viewDetails: "View Details",
    contactUs: "Contact Us"
  },
  forms: {
    save: "Save Changes",
    cancel: "Cancel",
    submit: "Submit",
    reset: "Reset",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close"
  }
};