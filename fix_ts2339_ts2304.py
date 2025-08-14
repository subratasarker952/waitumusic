
#!/usr/bin/env python3

import os
import re
import glob
import subprocess
from pathlib import Path
from typing import List, Dict, Set

def run_tsc_and_get_errors():
    """Run TypeScript compiler and return error list"""
    try:
        result = subprocess.run(['npx', 'tsc', '--noEmit'], 
                              capture_output=True, text=True, cwd='/home/ubuntu/WaituMusic/WaituMusicManager')
        return result.stderr.split('\n')
    except Exception as e:
        print(f"Error running tsc: {e}")
        return []

def create_missing_interfaces():
    """Create comprehensive interfaces for missing types"""
    
    interfaces_content = """// Enhanced type definitions for WaituMusicManager
import React from 'react';

// User and Role Types
export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isActive?: boolean;
  lastLoginAt?: string | Date;
}

export interface Role {
  id: string | number;
  name: string;
  description?: string;
  permissions?: string[];
  isDefault?: boolean;
  sortOrder?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserPrimaryRole {
  id: string | number;
  userId: string | number;
  roleId: string | number;
  isPrimary?: boolean;
  assignedAt?: string | Date;
  assignedBy?: string | number;
}

export interface UserPrimaryRoleWithRole extends UserPrimaryRole {
  role?: Role;
  user?: User;
  name?: string;
  description?: string;
  isDefault?: boolean;
  sortOrder?: number;
}

// Consultation Types
export interface ConsultationService {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  isActive?: boolean;
  requirements?: string[];
  maxParticipants?: number;
}

export interface Consultant {
  id: string | number;
  name: string;
  email?: string;
  bio?: string;
  specialties?: string[];
  hourlyRate?: number;
  availability?: string[];
  profilePicture?: string;
  rating?: number;
  totalSessions?: number;
}

export interface ConsultationBooking {
  id: string | number;
  serviceId: string | number;
  consultantId: string | number;
  userId: string | number;
  scheduledAt: string | Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
  paymentStatus?: string;
}

// Splitsheet Types
export interface SplitsheetCollaborator {
  id: string | number;
  name: string;
  email?: string;
  percentage: number;
  role: string;
  paymentInfo?: {
    method: string;
    details: Record<string, any>;
  };
}

export interface Splitsheet {
  id: string | number;
  songTitle: string;
  artistName: string;
  collaborators: SplitsheetCollaborator[];
  totalPercentage: number;
  status: 'draft' | 'pending' | 'signed' | 'finalized';
  createdAt: string | Date;
  updatedAt?: string | Date;
  signedAt?: string | Date;
}

// Opportunity Types
export interface Opportunity {
  id: string | number;
  title: string;
  description: string;
  category: string;
  location?: string;
  datePosted: string | Date;
  deadline?: string | Date;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  status: 'open' | 'closed' | 'in-progress' | 'completed';
  postedBy: string | number;
  applicants?: number;
  tags?: string[];
}

export interface OpportunityMatch {
  userId: number;
  name: string;
  role: string;
  matchScore: number;
  id?: string | number;
  skills?: string[];
  experience?: number;
  availability?: string[];
}

// Enhanced Event Types
export interface Event {
  id: string | number;
  title: string;
  description?: string;
  date: string | Date;
  venue: string;
  ticketPrice?: number;
  maxCapacity?: number;
  currentBookings?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer?: User;
  performers?: User[];
  requirements?: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Field Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  helperText?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Function Types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;
export type ChangeHandler<T = any> = (value: T) => void;

// State Management Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Context Types
export interface AuthContextValue {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
  phone?: string;
}

// Global extensions
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    analytics?: any;
    // Add other global properties as needed
  }
  
  // Extend NodeJS global if needed
  namespace NodeJS {
    interface Global {
      // Add global Node.js types here
    }
  }
}

export {};
"""
    
    with open('/home/ubuntu/WaituMusic/WaituMusicManager/shared/enhanced-types.ts', 'w') as f:
        f.write(interfaces_content)
    
    print("Created enhanced type definitions file")

def fix_ts2339_errors():
    """Fix TS2339 property access errors"""
    
    error_lines = run_tsc_and_get_errors()
    ts2339_errors = [line for line in error_lines if 'error TS2339' in line]
    
    files_to_fix = {}
    
    # Parse errors and group by file
    for error_line in ts2339_errors[:50]:  # Process first 50 errors
        match = re.search(r'([^:]+):\d+:\d+.*Property \'([^\']+)\' does not exist on type \'([^\']+)\'', error_line)
        if match:
            file_path, prop_name, type_name = match.groups()
            full_path = f"/home/ubuntu/WaituMusic/WaituMusicManager/{file_path}"
            
            if full_path not in files_to_fix:
                files_to_fix[full_path] = []
            
            files_to_fix[full_path].append({
                'property': prop_name,
                'type': type_name,
                'error_line': error_line
            })
    
    print(f"Found {len(files_to_fix)} files with TS2339 errors to fix")
    
    # Fix each file
    for file_path, errors in files_to_fix.items():
        if not os.path.exists(file_path):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Add type import if not present
            if not re.search(r'import.*from.*["\'][^"\']*enhanced-types["\']', content):
                # Find the first import statement
                first_import = re.search(r'^import .*?;', content, re.MULTILINE)
                if first_import:
                    import_statement = "import type * from '../shared/enhanced-types';\n"
                    content = content[:first_import.start()] + import_statement + content[first_import.start():]
                else:
                    # Add at the beginning of the file
                    content = "import type * from '../shared/enhanced-types';\n\n" + content
            
            # Apply specific fixes based on error patterns
            for error in errors:
                prop = error['property']
                type_name = error['type']
                
                # Add type assertions for common patterns
                if 'UserPrimaryRoleWithRole' in type_name:
                    # Fix UserPrimaryRoleWithRole property access
                    content = re.sub(
                        rf'(\w+)\.{prop}(?!\s*[=:])',
                        rf'(\1 as UserPrimaryRoleWithRole).{prop}',
                        content
                    )
                elif prop in ['user', 'id', 'name', 'email']:
                    # Add optional chaining for common properties
                    content = re.sub(
                        rf'(\w+)\.{prop}(?=\s*[^=:])',
                        rf'\1?.{prop}',
                        content
                    )
                elif prop in ['matchScore', 'userId', 'role']:
                    # Type assertion for opportunity matches
                    content = re.sub(
                        rf'(\w+)\.{prop}',
                        rf'(\1 as OpportunityMatch).{prop}',
                        content
                    )
            
            # Save if changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed TS2339 errors in: {os.path.basename(file_path)}")
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")

def fix_ts2304_errors():
    """Fix TS2304 missing name/declaration errors"""
    
    error_lines = run_tsc_and_get_errors()
    ts2304_errors = [line for line in error_lines if 'error TS2304' in line]
    
    files_to_fix = {}
    
    # Parse errors and group by file
    for error_line in ts2304_errors[:50]:  # Process first 50 errors
        match = re.search(r'([^:]+):\d+:\d+.*Cannot find name \'([^\']+)\'', error_line)
        if match:
            file_path, var_name = match.groups()
            full_path = f"/home/ubuntu/WaituMusic/WaituMusicManager/{file_path}"
            
            if full_path not in files_to_fix:
                files_to_fix[full_path] = []
            
            files_to_fix[full_path].append({
                'variable': var_name,
                'error_line': error_line
            })
    
    print(f"Found {len(files_to_fix)} files with TS2304 errors to fix")
    
    # Fix each file
    for file_path, errors in files_to_fix.items():
        if not os.path.exists(file_path):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix common variable scope issues
            for error in errors:
                var_name = error['variable']
                
                # Fix map/forEach callback parameter types
                if var_name in ['service', 'consultant', 'spec', 'sum', 'collab', 'person', 'num']:
                    # Fix map callbacks
                    content = re.sub(
                        rf'\.map\s*\(\s*\(\s*\)\s*=>\s*{{[^}}]*{var_name}',
                        rf'.map((item: any) => {{\n    const {var_name} = item;',
                        content,
                        flags=re.MULTILINE | re.DOTALL
                    )
                    
                    # Fix forEach callbacks
                    content = re.sub(
                        rf'\.forEach\s*\(\s*\(\s*\)\s*=>\s*{{[^}}]*{var_name}',
                        rf'.forEach((item: any) => {{\n    const {var_name} = item;',
                        content,
                        flags=re.MULTILINE | re.DOTALL
                    )
                    
                    # Fix reduce callbacks
                    content = re.sub(
                        rf'\.reduce\s*\(\s*\(\s*(\w+)\s*\)\s*=>\s*{{[^}}]*{var_name}',
                        rf'.reduce((acc: any, item: any) => {{\n    const {var_name} = item;',
                        content,
                        flags=re.MULTILINE | re.DOTALL
                    )
                    
                    # Fix map with proper parameter destructuring
                    content = re.sub(
                        rf'\.map\s*\(\s*{var_name}\s*=>\s*',
                        rf'.map(({var_name}: any) => ',
                        content
                    )
                    
                    # Fix forEach with proper parameter destructuring
                    content = re.sub(
                        rf'\.forEach\s*\(\s*{var_name}\s*=>\s*',
                        rf'.forEach(({var_name}: any) => ',
                        content
                    )
            
            # Save if changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed TS2304 errors in: {os.path.basename(file_path)}")
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")

def fix_specific_files():
    """Apply targeted fixes to specific problematic files"""
    
    # Fix ConsultationBookingSystem.tsx
    consultation_file = '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/ConsultationBookingSystem.tsx'
    if os.path.exists(consultation_file):
        with open(consultation_file, 'r') as f:
            content = f.read()
        
        # Fix the map/forEach callbacks properly
        fixes = [
            # Fix services.map callback
            (r'services\.map\(\(\) => \(\s*<div[^>]*>\s*<h3>{service\.name}</h3>',
             r'services.map((service: ConsultationService) => (\n      <div key={service.id}>\n        <h3>{service.name}</h3>'),
            
            # Fix consultants.map callback
            (r'consultants\.map\(\(\) => \(\s*<div[^>]*>\s*<h4>{consultant\.name}</h4>',
             r'consultants.map((consultant: Consultant) => (\n        <div key={consultant.id}>\n          <h4>{consultant.name}</h4>'),
            
            # Fix reduce callback
            (r'\.reduce\(\((\w+)\) => (\w+) \+',
             r'.reduce((sum: number, item: any) => sum +'),
        ]
        
        for pattern, replacement in fixes:
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
        
        with open(consultation_file, 'w') as f:
            f.write(content)
        print("Applied specific fixes to ConsultationBookingSystem.tsx")
    
    # Fix EnhancedSplitsheetManager.tsx
    splitsheet_file = '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/EnhancedSplitsheetManager.tsx'
    if os.path.exists(splitsheet_file):
        with open(splitsheet_file, 'r') as f:
            content = f.read()
        
        # Fix collaborators reduce callback
        content = re.sub(
            r'collaborators\.reduce\(\((\w+), (\w+)\) => \1 \+ \2\.percentage, 0\)',
            r'collaborators.reduce((sum: number, collab: SplitsheetCollaborator) => sum + collab.percentage, 0)',
            content
        )
        
        with open(splitsheet_file, 'w') as f:
            f.write(content)
        print("Applied specific fixes to EnhancedSplitsheetManager.tsx")

def add_missing_imports():
    """Add missing import statements to files"""
    
    common_imports = {
        'React': "import React from 'react';",
        'useState': "import { useState } from 'react';",
        'useEffect': "import { useEffect } from 'react';",
        'useCallback': "import { useCallback } from 'react';",
        'useMemo': "import { useMemo } from 'react';",
    }
    
    # Get all TypeScript/React files
    file_patterns = [
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.ts',
    ]
    
    all_files = []
    for pattern in file_patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    fixed_files = 0
    
    for file_path in all_files[:100]:  # Limit to first 100 files for safety
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Check for React usage without import
            if 'React.' in content or '<' in content and '>' in content:
                if not re.search(r'import.*React.*from.*["\']react["\']', content):
                    content = "import React from 'react';\n" + content
            
            # Check for hook usage without imports
            for hook, import_stmt in common_imports.items():
                if hook in content and import_stmt not in content:
                    if not re.search(rf'import.*{hook}.*from.*["\']react["\']', content):
                        content = import_stmt + '\n' + content
            
            # Add enhanced types import if TypeScript types are used
            if re.search(r': (User|Role|Opportunity|Consultant|Service)', content):
                if not re.search(r'import.*from.*["\'][^"\']*enhanced-types["\']', content):
                    content = "import type * from '../shared/enhanced-types';\n" + content
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_files += 1
                
        except Exception as e:
            continue
    
    print(f"Added missing imports to {fixed_files} files")

def main():
    """Main function to fix TS2339 and TS2304 errors"""
    
    print("=== TYPESCRIPT ERROR RESOLUTION: TS2339 & TS2304 ===\n")
    
    # Change to project directory
    os.chdir('/home/ubuntu/WaituMusic/WaituMusicManager')
    
    # Get initial error counts
    print("1. Analyzing initial errors...")
    initial_errors = run_tsc_and_get_errors()
    initial_ts2339 = len([line for line in initial_errors if 'error TS2339' in line])
    initial_ts2304 = len([line for line in initial_errors if 'error TS2304' in line])
    initial_total = len([line for line in initial_errors if 'error TS' in line])
    
    print(f"   Initial TS2339 errors: {initial_ts2339}")
    print(f"   Initial TS2304 errors: {initial_ts2304}")
    print(f"   Total initial errors: {initial_total}\n")
    
    # Phase 1: Create enhanced type definitions
    print("2. Creating enhanced type definitions...")
    create_missing_interfaces()
    
    # Phase 2: Add missing imports
    print("3. Adding missing imports...")
    add_missing_imports()
    
    # Phase 3: Fix specific files with targeted solutions
    print("4. Applying targeted fixes to specific files...")
    fix_specific_files()
    
    # Phase 4: Fix TS2304 errors (missing declarations)
    print("5. Fixing TS2304 errors (missing declarations)...")
    fix_ts2304_errors()
    
    # Phase 5: Fix TS2339 errors (property access)
    print("6. Fixing TS2339 errors (property access)...")
    fix_ts2339_errors()
    
    # Get final error counts
    print("7. Analyzing final results...")
    final_errors = run_tsc_and_get_errors()
    final_ts2339 = len([line for line in final_errors if 'error TS2339' in line])
    final_ts2304 = len([line for line in final_errors if 'error TS2304' in line])
    final_total = len([line for line in final_errors if 'error TS' in line])
    
    # Generate report
    print(f"\n=== RESOLUTION REPORT ===")
    print(f"TS2339 (Property Access) Errors:")
    print(f"  Before: {initial_ts2339}")
    print(f"  After: {final_ts2339}")
    print(f"  Resolved: {initial_ts2339 - final_ts2339}")
    print(f"  Improvement: {((initial_ts2339 - final_ts2339) / initial_ts2339 * 100):.1f}%" if initial_ts2339 > 0 else "N/A")
    
    print(f"\nTS2304 (Missing Declarations) Errors:")
    print(f"  Before: {initial_ts2304}")
    print(f"  After: {final_ts2304}")
    print(f"  Resolved: {initial_ts2304 - final_ts2304}")
    print(f"  Improvement: {((initial_ts2304 - final_ts2304) / initial_ts2304 * 100):.1f}%" if initial_ts2304 > 0 else "N/A")
    
    print(f"\nOverall Progress:")
    print(f"  Total Errors Before: {initial_total}")
    print(f"  Total Errors After: {final_total}")
    print(f"  Total Resolved: {initial_total - final_total}")
    print(f"  Overall Improvement: {((initial_total - final_total) / initial_total * 100):.1f}%" if initial_total > 0 else "N/A")
    
    if final_total > 0:
        print(f"\nRemaining error types:")
        error_types = {}
        for line in final_errors:
            match = re.search(r'error (TS\d+)', line)
            if match:
                error_type = match.group(1)
                error_types[error_type] = error_types.get(error_type, 0) + 1
        
        for error_type, count in sorted(error_types.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {error_type}: {count} errors")
    
    print(f"\n=== RESOLUTION COMPLETED ===")
    
    return final_ts2339 + final_ts2304 < initial_ts2339 + initial_ts2304

if __name__ == "__main__":
    main()
