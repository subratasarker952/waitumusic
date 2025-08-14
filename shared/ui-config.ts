/**
 * Centralized UI Configuration Module
 * All UI elements, messages, durations, and styling should use these configurations
 * Now integrated with unified admin configuration system
 */

// ===== TOAST CONFIGURATION =====
// Duration is now controlled by admin configuration system
import { getUIConfig } from '@shared/admin-config';

export const getToastDuration = () => {
  try {
    const uiConfig = getUIConfig();
    return uiConfig.toast.duration || 500; // Default to system default
  } catch (error) {
    return 500; // Fallback to system default if admin config system isn't loaded
  }
};

export const TOAST_DURATION = 500; // Legacy constant for backward compatibility

export const TOAST_CONFIGS = {
  SUCCESS: {
    SAVE: {
      title: "Success",
      description: "Technical rider saved successfully",
      get duration() { return getToastDuration(); }
    },
    EXPORT: {
      title: "Success", 
      description: "Technical rider PDF exported successfully",
      get duration() { return getToastDuration(); }
    },
    LOAD: {
      title: "Technical Rider Loaded",
      description: "Enhanced technical rider loaded successfully",
      get duration() { return getToastDuration(); }
    },
    SETLIST_LOAD: {
      title: "Setlist Loaded",
      description: "Setlist template loaded successfully",
      get duration() { return getToastDuration(); }
    },
    ASSIGNMENT_CREATED: {
      title: "Assignment Created",
      description: "Talent assigned successfully",
      get duration() { return getToastDuration(); }
    },
    BOOKING_UPDATED: {
      title: "Booking Updated",
      description: "Booking information updated successfully",
      get duration() { return getToastDuration(); }
    }
  },
  ERROR: {
    CANNOT_REMOVE: {
      title: "Cannot Remove",
      description: "Main Booked Talent cannot be removed from the technical rider",
      variant: "destructive" as const,
      get duration() { return getToastDuration(); }
    },
    SAVE_FAILED: {
      title: "Save Failed",
      description: "Failed to save technical rider",
      variant: "destructive" as const,
      get duration() { return getToastDuration(); }
    },
    EXPORT_FAILED: {
      title: "Export Failed",
      description: "Failed to export technical rider PDF",
      variant: "destructive" as const,
      get duration() { return getToastDuration(); }
    },
    EXPORT_FAILED_WITH_MESSAGE: (message: string) => ({
      title: "Export Failed",
      description: message || "Failed to export PDF",
      variant: "destructive" as const,
      duration: getToastDuration()
    }),
    ASSIGNMENT_FAILED: {
      title: "Assignment Failed",
      description: "Failed to assign talent to booking",
      variant: "destructive" as const,
      get duration() { return getToastDuration(); }
    },
    BOOKING_UPDATE_FAILED: {
      title: "Update Failed",
      description: "Failed to update booking information",
      variant: "destructive" as const,
      get duration() { return getToastDuration(); }
    }
  },
  INFO: {
    MANUAL_SETUP: {
      title: "Manual Setup Recommended",
      description: "Use the tabs below to configure your technical rider sections manually for precise control.",
      get duration() { return getToastDuration(); }
    },
    LOADING: {
      title: "Loading",
      description: "Please wait while we process your request",
      get duration() { return getToastDuration(); }
    }
  }
} as const;

// ===== MODAL CONFIGURATION =====
export const MODAL_CONFIGS = {
  SIZES: {
    SMALL: "max-w-md",
    MEDIUM: "max-w-2xl", 
    LARGE: "max-w-4xl",
    EXTRA_LARGE: "max-w-6xl",
    FULL: "max-w-full"
  },
  ANIMATIONS: {
    FADE_DURATION: 200,
    SLIDE_DURATION: 300,
    SCALE_DURATION: 250
  }
} as const;

// ===== BUTTON CONFIGURATION =====
export const BUTTON_CONFIGS = {
  VARIANTS: {
    PRIMARY: "default",
    SECONDARY: "secondary", 
    DESTRUCTIVE: "destructive",
    OUTLINE: "outline",
    GHOST: "ghost",
    LINK: "link"
  },
  SIZES: {
    SMALL: "sm",
    MEDIUM: "default",
    LARGE: "lg",
    ICON: "icon"
  },
  LOADING_STATES: {
    SAVING: "Saving...",
    LOADING: "Loading...",
    EXPORTING: "Exporting...",
    PROCESSING: "Processing...",
    SUBMITTING: "Submitting..."
  }
} as const;

// ===== FORM CONFIGURATION =====
export const FORM_CONFIGS = {
  VALIDATION_MESSAGES: {
    REQUIRED: "This field is required",
    EMAIL_INVALID: "Please enter a valid email address",
    PHONE_INVALID: "Please enter a valid phone number",
    URL_INVALID: "Please enter a valid URL",
    MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
    MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
    NUMERIC_ONLY: "Please enter numbers only",
    ALPHANUMERIC_ONLY: "Please enter letters and numbers only"
  },
  INPUT_SIZES: {
    SMALL: "h-8 text-sm",
    MEDIUM: "h-10", 
    LARGE: "h-12 text-lg"
  },
  FIELD_SPACING: {
    TIGHT: "space-y-2",
    NORMAL: "space-y-4",
    LOOSE: "space-y-6"
  }
} as const;

// ===== LOADING CONFIGURATION =====
export const LOADING_CONFIGS = {
  SPINNER_SIZES: {
    SMALL: "h-4 w-4",
    MEDIUM: "h-6 w-6",
    LARGE: "h-8 w-8",
    EXTRA_LARGE: "h-12 w-12"
  },
  SKELETON_HEIGHTS: {
    TEXT: "h-4",
    TITLE: "h-6", 
    BUTTON: "h-10",
    CARD: "h-32",
    IMAGE: "h-48"
  },
  TIMEOUTS: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 10000,
    EXTENDED: 30000
  }
} as const;

// ===== COLOR CONFIGURATION =====
export const COLOR_CONFIGS = {
  STATUS: {
    SUCCESS: "text-green-600 bg-green-50 border-green-200",
    ERROR: "text-red-600 bg-red-50 border-red-200", 
    WARNING: "text-yellow-600 bg-yellow-50 border-yellow-200",
    INFO: "text-blue-600 bg-blue-50 border-blue-200",
    NEUTRAL: "text-gray-600 bg-gray-50 border-gray-200"
  },
  BADGES: {
    PRIMARY: "bg-blue-100 text-blue-800",
    SECONDARY: "bg-gray-100 text-gray-800",
    SUCCESS: "bg-green-100 text-green-800",
    WARNING: "bg-yellow-100 text-yellow-800", 
    ERROR: "bg-red-100 text-red-800",
    INFO: "bg-cyan-100 text-cyan-800"
  },
  MEMBERSHIP: {
    BAND: "border-blue-500 text-blue-600",
    TEAM: "border-orange-500 text-orange-600", 
    MANAGEMENT: "border-purple-500 text-purple-600"
  }
} as const;

// ===== SPACING CONFIGURATION =====
export const SPACING_CONFIGS = {
  MARGINS: {
    TIGHT: "m-2",
    NORMAL: "m-4",
    LOOSE: "m-6",
    EXTRA_LOOSE: "m-8"
  },
  PADDING: {
    TIGHT: "p-2",
    NORMAL: "p-4", 
    LOOSE: "p-6",
    EXTRA_LOOSE: "p-8"
  },
  GAPS: {
    TIGHT: "gap-2",
    NORMAL: "gap-4",
    LOOSE: "gap-6",
    EXTRA_LOOSE: "gap-8"
  }
} as const;

// ===== TECHNICAL RIDER SPECIFIC CONFIGS =====
export const TECHNICAL_RIDER_CONFIGS = {
  TABS: {
    OVERVIEW: "overview",
    BAND_MAKEUP: "band-makeup",
    STAGE_PLOT: "stage-plot", 
    MIXER_PATCH: "mixer-patch",
    SETLIST: "setlist",
    REQUIREMENTS: "requirements",
    CONTRACTS: "contracts"
  },
  MEMBERSHIP_TYPES: {
    BAND: "BAND",
    TEAM: "TEAM",
    MANAGEMENT: "MANAGEMENT"
  },
  ROLE_PRIORITIES: {
    PRIMARY: 1,
    ASSIGNED: 2,
    ASSIGNMENT: 3,
    AVAILABLE: 4,
    GENERIC: 5
  }
} as const;

// ===== API CONFIGURATION =====
export const API_CONFIGS = {
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000
  },
  RETRY_ATTEMPTS: {
    LOW: 1,
    MEDIUM: 3,
    HIGH: 5
  },
  CACHE_DURATIONS: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    EXTENDED: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;

// ===== CREATIVE MIXER PATCH NOMENCLATURE CONFIGURATION =====
// Ensures perfect auto-assignment between creative user roles and mixer channels
export const MIXER_PATCH_ROLES = {
  // Vocal Superstars - Channels 1-8
  VOCALS: {
    "Neo Soul Queen": { channels: [1, 2], instruments: ["Soulful Vocals", "Lead Voice"], priority: 1 },
    "Jazz Fusion King": { channels: [1, 2], instruments: ["Smooth Jazz Vocals", "Vocal Styling"], priority: 1 },
    "Indie Rock Star": { channels: [1, 2], instruments: ["Rock Vocals", "Power Voice"], priority: 1 },
    "Pop Sensation": { channels: [1, 2], instruments: ["Pop Vocals", "Catchy Melodies"], priority: 1 },
    "Singer-Songwriter": { channels: [1, 2], instruments: ["Acoustic Vocals", "Storytelling Voice"], priority: 1 },
    "Folk Artist": { channels: [1, 2], instruments: ["Folk Vocals", "Narrative Voice"], priority: 1 },
    "Backing Vocalist": { channels: [3, 4], instruments: ["Harmony Vocals", "Supporting Voice"], priority: 2 },
    "Vocal Stylist": { channels: [5, 6], instruments: ["Creative Vocals", "Unique Voice"], priority: 2 }
  },
  
  // Rhythm Powerhouse - Channels 9-20
  RHYTHM: {
    "Beat Master": { channels: [9, 10, 11, 12, 13, 14, 15, 16], instruments: ["Thunderous Drums", "Kick Power", "Snare Snap", "Hi-Hat Sizzle", "Tom Thunder", "Cymbal Crash"], priority: 1 },
    "Groove Specialist": { channels: [17, 18], instruments: ["Deep Bass", "Funky Bass Lines", "Low End Rumble"], priority: 1 },
    "Riff Master": { channels: [19, 20], instruments: ["Killer Riffs", "Guitar Solos", "String Magic"], priority: 1 },
    "Rhythm Wizard": { channels: [21, 22], instruments: ["Chord Progressions", "Strumming Patterns", "Guitar Layers"], priority: 2 },
    "Synth Wizard": { channels: [23, 24], instruments: ["Piano Magic", "Synthesizer Waves", "Key Melodies"], priority: 1 },
    "Studio Pro": { channels: [19, 20], instruments: ["Professional Instruments", "Multi-Talents"], priority: 1 }
  },
  
  // Creative Specialists - Channels 25-32
  ADDITIONAL: {
    "Audio Engineer Supreme": { channels: [25, 26], instruments: ["Sound Engineering", "Audio Magic"], priority: 1 },
    "Marketing Mastermind": { channels: [27], instruments: ["Creative Direction", "Brand Voice"], priority: 3 },
    "Producer Extraordinaire": { channels: [28, 29], instruments: ["Production Skills", "Creative Vision"], priority: 1 },
    "Visual Artist Creator": { channels: [30], instruments: ["Visual Content", "Creative Media"], priority: 3 },
    "Music Professional": { channels: [31], instruments: ["Industry Expertise", "Professional Skills"], priority: 3 },
    "Creative Backup": { channels: [32], instruments: ["Auxiliary Support", "Creative Input"], priority: 4 }
  }
} as const;

// Role-to-Channel Auto-Assignment Logic
export const getChannelsForRole = (primaryRole: string, skills: string[] = []): number[] => {
  // Check primary role first
  for (const [category, roles] of Object.entries(MIXER_PATCH_ROLES)) {
    const roleConfig = roles[primaryRole as keyof typeof roles];
    if (roleConfig && 'channels' in roleConfig) {
      return roleConfig.channels;
    }
  }
  
  // Check skills/instruments for fallback assignment
  const allSkills = skills.join(' ').toLowerCase();
  for (const [category, roles] of Object.entries(MIXER_PATCH_ROLES)) {
    for (const [roleName, config] of Object.entries(roles)) {
      if (config.instruments.some((instrument: string) => 
        allSkills.includes(instrument.toLowerCase()) || 
        allSkills.includes(roleName.toLowerCase())
      )) {
        return config.channels;
      }
    }
  }
  
  // Default fallback
  return [31, 32];
};

// Get instrument names for role
export const getInstrumentsForRole = (primaryRole: string): string[] => {
  for (const [category, roles] of Object.entries(MIXER_PATCH_ROLES)) {
    const roleConfig = roles[primaryRole as keyof typeof roles];
    if (roleConfig && 'instruments' in roleConfig) {
      return roleConfig.instruments;
    }
  }
  return ["Aux Input"];
};

// Channel naming convention
export const MIXER_CHANNEL_NAMES = {
  1: "Lead Vocal 1",
  2: "Lead Vocal 2", 
  3: "Backing Vocal 1",
  4: "Backing Vocal 2",
  5: "Vocal 3",
  6: "Vocal 4",
  7: "Vocal 5", 
  8: "Vocal 6",
  9: "Kick Drum",
  10: "Snare Drum",
  11: "Hi-Hat",
  12: "Tom 1",
  13: "Tom 2",
  14: "Overhead L",
  15: "Overhead R",
  16: "Drum Aux",
  17: "Bass DI",
  18: "Bass Amp",
  19: "Lead Guitar",
  20: "Guitar Amp",
  21: "Rhythm Guitar",
  22: "Acoustic Guitar",
  23: "Piano/Keys L",
  24: "Piano/Keys R",
  25: "Saxophone",
  26: "Trumpet",
  27: "Violin",
  28: "Percussion",
  29: "DJ/Playback L",
  30: "DJ/Playback R",
  31: "Aux 1",
  32: "Aux 2"
} as const;

// ===== ANIMATION CONFIGURATION =====
export const ANIMATION_CONFIGS = {
  TRANSITIONS: {
    FAST: "transition-all duration-150",
    NORMAL: "transition-all duration-300",
    SLOW: "transition-all duration-500"
  },
  HOVER_EFFECTS: {
    LIFT: "hover:shadow-lg hover:-translate-y-1",
    GLOW: "hover:shadow-2xl hover:shadow-blue-500/25",
    SCALE: "hover:scale-105",
    FADE: "hover:opacity-80"
  },
  SCROLL_BEHAVIOR: {
    SMOOTH: "scroll-smooth",
    AUTO: "scroll-auto"
  }
} as const;