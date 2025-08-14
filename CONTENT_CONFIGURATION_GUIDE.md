# WaituMusic Content Configuration Guide

## Overview
This guide explains how to modify all public-facing text content on the WaituMusic platform through the centralized content configuration system.

## Configuration File Location
All content is managed through: `shared/content-config.ts`

## Available Configuration Sections

### 1. Site-Wide Configuration (`SITE_CONFIG`)
- **name**: Platform name (currently "Wai'tuMusic")
- **tagline**: Platform tagline
- **description**: Platform description for SEO and meta tags
- **domain**: Platform domain name

### 2. Homepage Content (`HOMEPAGE_CONTENT`)

#### Hero Section
- **title**: Main hero title
- **subtitle**: Hero description text
- **cta**: Call-to-action button text (primary, secondary, tertiary)

#### Features Section
- **title**: Features section title
- **subtitle**: Features section subtitle
- **items**: Array of feature objects with title and description

#### Services Section
- **title**: Services section title
- **subtitle**: Services section subtitle
- **items**: Array of service objects with name, description, basePrice, category

#### User Roles Section
- **title**: User roles section title
- **subtitle**: User roles section subtitle
- **roles**: Array of role objects with title, description, access level, color

### 3. Navigation Labels (`NAVIGATION_LABELS`)
- **main**: Main navigation items (home, artists, bookings, services, store)
- **auth**: Authentication buttons (login, register, logout, dashboard)
- **mobile.pianoKeys**: Mobile navigation with musical note decorations

### 4. Login Page Content (`LOGIN_CONTENT`)
- **title**: Login form title
- **subtitle**: Login page subtitle
- **description**: Login form description
- **form**: Form field labels and placeholders
- **demoSection**: Demo account section text
- **footer**: Footer links and text

### 5. Modal Content (`MODAL_CONTENT`)
- **common**: Common modal buttons and text
- **pressRelease**: Press release modal text
- **onboarding**: Onboarding modal steps and content

### 6. Error & Success Messages
- **ERROR_MESSAGES**: All error messages
- **SUCCESS_MESSAGES**: All success confirmation messages

### 7. Action Text (`ACTION_TEXT`)
- **buttons**: All button text throughout the platform
- **forms**: Form action text (save, cancel, submit, etc.)

### 8. Demo Content (`DEMO_CONTENT`)
- **title**: Demo accounts section title
- **subtitle**: Demo accounts description
- **accounts**: Array of demo account information

### 9. Footer Content (`FOOTER_CONTENT`)
- **company**: Company information
- **links**: Footer navigation links
- **copyright**: Copyright text

## How to Modify Content

### Example 1: Change Platform Name
```typescript
export const SITE_CONFIG = {
  name: "Your Music Platform", // Change this line
  tagline: "Your custom tagline",
  // ... rest of config
};
```

### Example 2: Update Hero Section
```typescript
export const HOMEPAGE_CONTENT = {
  hero: {
    title: "Your Custom Hero Title",
    subtitle: "Your custom hero description",
    cta: {
      primary: "Get Started",
      secondary: "Learn More", 
      tertiary: "Sign In"
    }
  },
  // ... rest of config
};
```

### Example 3: Modify Service Pricing
```typescript
services: {
  items: [
    {
      name: "Live Performance Booking",
      description: "Professional live performance booking",
      basePrice: 750, // Change price here
      currency: "USD",
      category: "Performance",
      popular: true
    }
    // ... other services
  ]
}
```

### Example 4: Update Button Text
```typescript
export const ACTION_TEXT = {
  buttons: {
    signUp: "Join Now", // Change from "Sign Up Now"
    bookArtist: "Hire Artist", // Change from "Book an Artist"
    // ... other buttons
  }
};
```

## Components Using Content Configuration

### Already Integrated:
- Home.tsx (hero, services, features, user roles)
- Login.tsx (complete login page)
- Navigation components (main and mobile navigation)
- Press release modals
- Onboarding modals

### To Be Integrated:
- Register.tsx
- Services.tsx  
- Store.tsx
- Artists.tsx
- All other public-facing pages

## Benefits

1. **Easy Content Updates**: Change text without touching component code
2. **Consistent Messaging**: Centralized content prevents inconsistencies
3. **Multi-language Ready**: Structure supports internationalization
4. **SEO Management**: Meta descriptions and titles centrally managed
5. **Brand Consistency**: Unified voice and messaging across platform
6. **No Code Changes**: Content team can update text independently

## Adding New Configurable Content

1. Add new content section to `shared/content-config.ts`
2. Import the configuration in your component
3. Replace hardcoded text with configuration variables
4. Update this guide with the new section

## Zero Dummy Data Policy

The content configuration system ensures:
- No hardcoded placeholder text
- All content is production-ready
- Easy switching between staging and production content
- Authentic data integration while maintaining text flexibility

This system enables complete control over all public-facing text while maintaining the platform's zero dummy data policy.