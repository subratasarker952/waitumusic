// Admin configuration type
export type AdminConfigType = typeof DEFAULT_ADMIN_CONFIG;

// Default admin configuration
export const DEFAULT_ADMIN_CONFIG = {
  platform: {
    name: "Wai'tuMusic",
    tagline: "Empowering Artists, Connecting Talent",
    description: "Comprehensive music industry management platform",
    version: "2.0.0"
  },
  features: {
    enableBookings: true,
    enableEcommerce: true,
    enableSplitsheets: true,
    enableOppHub: true,
    enableSocialMedia: true,
    enableAnalytics: true,
    enableNewsletter: true,
    enablePressReleases: true
  },
  security: {
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 86400, // 24 hours in seconds
    maxLoginAttempts: 5,
    maxFailedAttempts: 5,
    lockoutDuration: 900 // 15 minutes in seconds
  },
  notifications: {
    emailProvider: "sendgrid",
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    enableSMSNotifications: false
  },
  payments: {
    provider: "stripe",
    currency: "USD",
    enableSubscriptions: true,
    enableOneTimePayments: true
  },
  storage: {
    provider: "local",
    maxFileSize: 104857600, // 100MB in bytes
    allowedFileTypes: ["mp3", "wav", "flac", "mp4", "pdf", "jpg", "jpeg", "png", "gif"]
  },
  ui: {
    toast: {
      duration: 5000,
      maxToasts: 5
    },
    colors: {
      primary: "#7C3AED",
      secondary: "#10B981",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6"
    },
    modal: {
      animationDuration: 300
    }
  },
  technicalRider: {
    autoSaveInterval: 30000,
    maxBandMembers: 50,
    maxTeamMembers: 30,
    maxManagementMembers: 20,
    allowAssignedTalentAccess: false // Controls whether assigned talent can view/download technical riders
  },
  api: {
    timeout: {
      short: 5000,
      medium: 15000,
      long: 30000
    }
  }
};

// Helper function to get UI config (if needed by other components)
export function getUIConfig() {
  return DEFAULT_ADMIN_CONFIG;
}