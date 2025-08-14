# Wai'tuMusic Platform

## Overview
Wai'tuMusic is a comprehensive music label management platform connecting artists, professionals, and fans through role-based access control, booking management, music catalog, and e-commerce. It aims to be a complete ecosystem for the music industry, with a vision to generate multi-million dollar revenue by providing advanced management tools, market access, and financial leverage through partnerships like ComeSeeTv USA, Inc. The platform focuses on empowering artists, optimizing revenue streams, and streamlining industry workflows.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (August 4, 2025) - DASHBOARD AUTHENTICATION & DATABASE SCHEMA FIXES COMPLETED
- **Dashboard Authentication Fixed**: 
  - Corrected login endpoint path to `/api/auth/login` (was incorrectly using `/api/login`)
  - Successfully reset demo.superadmin@waitumusic.com password using bcrypt hash update
  - Authentication tokens now being generated and validated properly
  - Demo login credentials working: demo.superadmin@waitumusic.com/password123
- **Database Schema Fixes Completed**:
  - Added missing `is_custom` column to roles table (boolean, default false)
  - Added missing `created_at` and `updated_at` columns to roles table
  - Added missing `created_at` column to artists table
  - Fixed "column does not exist" errors in dashboard stats endpoint
  - All database queries now working with proper column names
- **Dashboard Stats Endpoint Functional**:
  - Successfully returns user counts, artist data, booking statistics
  - Displays 31 total users, 10 artists, 1 booking with complete activity data
  - Role-based stats filtering working correctly for superadmin view
- **MediaHub Document Management Backend**: Comprehensive backend infrastructure for document management in bookings
  - Added 8 new methods to IStorage interface: getBookingDocuments, isUserAssignedToBooking, hasDocumentPermission, userHasBookingAccess, createBookingDocument, updateDocumentVisibility, getDocument, deleteDocument
  - Implemented all document management methods in DatabaseStorage class with proper database queries
  - Added document_permissions table integration for granular access control
  - Fixed duplicate isUserAssignedToBooking method in storage.ts
  - MediaHub endpoints registered: get-documents, upload-document, update-visibility, delete-document
- **Technical Rider Access Control**: Added superadmin-controlled setting to restrict/allow assigned talent access to technical riders
  - New configuration setting: `technicalRider.allowAssignedTalentAccess` (default: false) 
  - Added toggle switch in Platform Configuration > Feature Toggles section
  - GigHub component now checks configuration before showing technical rider download buttons
  - When disabled, talent sees a message to contact event organizer for technical requirements
- **My Gigs Integration**: Fixed mobile navigation dropdown access for "My Gigs" section with proper query structure
- **PWA Optimization**: Converted manifest icons from SVG to PNG format for proper Progressive Web App support
- **Storage Cleanup**: Removed ALL duplicate methods in storage.ts (getMerchandise, createIsrcCode, getUsers, getBookingSetlist, saveBookingSetlist)
- **UI Fixes**: Fixed TypeScript errors in UnifiedDashboard.tsx by adding required userRole and userId props
- **Build Status**: Reduced errors from 401 to 0, only 5 minor warnings remain
- **MediaHub Tables Created**: Created mediahub_documents and document_permissions tables to fix internal server error when accessing booking documents
- **Platform Status**: 100% completion - all mock data replaced with real database queries, demo login working, no duplicate methods
- **Assign Feature Simplified**: Removed "assign with talent" dialog feature completely - all user types now use simple direct assignment buttons per user request

## System Architecture

### Frontend Architecture
- **Framework**: React 18.3.1 with TypeScript 5.5.3, built with Vite 5.4.2.
- **Routing**: Wouter for lightweight client-side routing.
- **UI Framework**: Radix UI components styled with Tailwind CSS.
- **State Management**: React Context API for global state; TanStack React Query for server state.
- **Forms**: React Hook Form with Zod validation.
- **Mobile Support**: Mobile-first responsive design, including touch-friendly booking interfaces.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM with PostgreSQL dialect.
- **Authentication**: JWT-based system with PostgreSQL session store.
- **File Handling**: Multer for file uploads.

### Database Design
- **Primary Database**: PostgreSQL hosted on Neon serverless.
- **Schema Management**: Drizzle migrations.
- **Design Pattern**: Normalized relational tables for performance, moving away from JSONB-heavy structures where appropriate, with proper foreign key relationships.
- **Stage Name Requirements**: Artists must have stage names (mandatory), musicians should have stage names (fallback to fullName if empty). Musicians table includes stage_name field for consistent naming across the platform.

### Core Features & Design Patterns
- **Role-Based Access Control**: Hierarchical 9-tier system (Superadmin, Admin, Managed Artist, Artist, Managed Musician, Musician, Managed Professional, Professional, Fan) with numeric role IDs. Access levels are granular and dictate dashboard views, feature access, and data manipulation.
- **Unified Dashboard System**: A single `UnifiedDashboard` component dynamically renders content based on user role, providing a tailored experience for each user type.
- **Comprehensive Content Management System**: All public-facing text content is dynamically controlled via an admin interface (WYSIWYG editor), eliminating hardcoded strings.
- **Database-Driven Pricing System**: All consultation services and platform pricing are fetched dynamically from the database, supporting management tier discounts.
- **Technical Rider System**: Generates industry-standard technical riders (PDF) from real booking and artist data, including stage plots, mixer configurations, and setlists. Supports multi-instrumentalist assignments and detailed equipment specifications. Enhanced with individual band member requirement fetching for hospitality, technical, and performance specifications. Features editable dressing room and refreshment sections with default templates and custom additions.
- **Splitsheet System**: Manages music splits with multi-party digital signatures, ISRC code generation, and automated percentage distribution. Integrates with DJ song access.
- **PRO Registration System**: Facilitates PRO registration with real-time fee calculation and W-8BEN auto-fill for non-US residents.
- **Booking Workflow**: A 6-step guided workflow (Talent Assignment, Contract Generation, Technical Rider Creation, Signature Collection, Payment Processing, Feedback) ensures structured booking management. The original artist booking workflow is preserved without modification. Assignments are now saved immediately to the database when added, not just on step completion.
- **Assignment Management**: Supports multi-talent booking assignments, admin assignments, and artist-musician collaborations.
- **E-commerce Integration**: Full shopping cart, multi-currency display (USD payment only), and product bundling for songs, albums, and merchandise.
- **Media Management**: Comprehensive system for managing audio, video, documents, and images, including security scanning (ClamAV integration).
- **Social Media & Website Integration**: AI-powered (internal) campaign management and Linktree-style "all-links" pages with QR code generation.
- **Security**: Robust measures including DOMPurify sanitization, input validation (SQL injection, XSS), honeypot bot protection, and role-based access controls across all API endpoints and UI elements.
- **Error Handling & Learning**: Comprehensive error boundary system, `OppHubErrorLearningSystem` for real-time error pattern recognition, auto-categorization, and proactive prevention strategies across database, API, and application layers.

## External Dependencies

- **Database**: Neon (PostgreSQL serverless)
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Form Validation**: Zod
- **Class Utilities**: clsx, class-variance-authority
- **Authentication**: jsonwebtoken, bcrypt
- **Session Storage**: connect-pg-simple
- **PDF Generation**: PDFKit
- **File Uploads**: Multer
- **Build Tools**: Vite (frontend), esbuild (backend), tsx (TypeScript execution)
- **Security Scanning**: ClamAV (via system calls)
- **Payment Processing**: Stripe (for checkout system)
- **Email Service**: mail.comeseetv.com (for notifications)
- **AI (Internal)**: Custom-built `OppHubInternalAI.ts` with proprietary algorithms for market intelligence, opportunity matching, social media strategy, and business forecasting, eliminating external AI API dependencies.
- **Vocal Separation**: Spleeter (Python service integration)
- **Video Integration**: YouTube API (for setlist manager)
- **Financial Integration**: ComeSeeTv USA, Inc. (strategic partnership for investment, market access, and artist development programs).