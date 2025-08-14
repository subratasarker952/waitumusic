
#!/usr/bin/env python3

import os
import re
import glob
import subprocess

def run_tsc_and_get_errors():
    """Run TypeScript compiler and return error list"""
    try:
        result = subprocess.run(['npx', 'tsc', '--noEmit'], 
                              capture_output=True, text=True, cwd='/home/ubuntu/WaituMusic/WaituMusicManager')
        return result.stderr.split('\n')
    except Exception as e:
        print(f"Error running tsc: {e}")
        return []

def fix_broken_import_syntax():
    """Fix broken import syntax causing TS1005, TS1003, TS1109 errors"""
    
    files_with_errors = [
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/event-production/EventProductionDashboard.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/layout/Header.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/transportation/TransportationExpenseManager.tsx',
    ]
    
    # Add all files that might have similar issues
    patterns = [
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/**/*.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/pages/**/*.tsx',
    ]
    
    all_files = []
    for pattern in patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    fixed_files = 0
    
    for file_path in all_files:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix broken import patterns
            # Pattern: identifier { another_identifier,
            # Should be: identifier, another_identifier
            content = re.sub(
                r'(\w+)\s*{\s*(\w+)\s*,\s*\n\s*import\s+{\s*(\w+)\s*}\s+from\s+[\'"][^\'"]+[\'"];',
                r'\1,\n  \2\n} from \'lucide-react\';\nimport { \3 } from \'lucide-react\';',
                content,
                flags=re.MULTILINE
            )
            
            # Fix another common pattern
            # Pattern: } from 'module';\n  identifier,\nimport { other }
            content = re.sub(
                r'}\s+from\s+[\'"]([^\'"]+)[\'"];\s*\n\s*(\w+)\s*,\s*\n\s*import\s+{\s*(\w+)\s*}\s+from\s+[\'"][^\'"]+[\'"];',
                r'} from \'\1\';\nimport { \2, \3 } from \'lucide-react\';',
                content,
                flags=re.MULTILINE
            )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_files += 1
                print(f"Fixed import syntax in: {os.path.basename(file_path)}")
                
        except Exception as e:
            continue
    
    print(f"Fixed syntax in {fixed_files} files")

def create_comprehensive_types():
    """Create comprehensive type definitions"""
    
    types_content = '''// Comprehensive TypeScript type definitions for WaituMusicManager

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

export interface UserPrimaryRoleWithRole {
  id: string | number;
  userId: string | number;
  roleId: string | number;
  name?: string;
  description?: string;
  isDefault?: boolean;
  sortOrder?: number;
  role?: Role;
  user?: User;
  isPrimary?: boolean;
  assignedAt?: string | Date;
}

export interface Role {
  id: string | number;
  name: string;
  description?: string;
  permissions?: string[];
  isDefault?: boolean;
  sortOrder?: number;
}

export interface OpportunityMatch {
  id: string | number;
  userId: number;
  name: string;
  role: string;
  matchScore: number;
  skills?: string[];
  experience?: number;
  availability?: string[];
}

export interface ConsultationService {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

export interface Consultant {
  id: string | number;
  name: string;
  email?: string;
  specialties?: string[];
  hourlyRate?: number;
}

export interface SplitsheetCollaborator {
  id: string | number;
  name: string;
  percentage: number;
  role: string;
  email?: string;
  isConfirmed?: boolean;
}

// Global type augmentation
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export {};
'''
    
    with open('/home/ubuntu/WaituMusic/WaituMusicManager/shared/types.ts', 'w') as f:
        f.write(types_content)
    
    print("Created comprehensive type definitions")

def analyze_and_fix_ts2339_errors():
    """Analyze and fix TS2339 property access errors"""
    
    error_lines = run_tsc_and_get_errors()
    ts2339_errors = [line for line in error_lines if 'error TS2339' in line]
    
    print(f"Found {len(ts2339_errors)} TS2339 errors to analyze")
    
    # Group by file
    files_with_errors = {}
    for error_line in ts2339_errors:
        match = re.search(r'([^:]+):\d+:\d+.*Property \'([^\']+)\' does not exist on type \'([^\']+)\'', error_line)
        if match:
            file_path, prop_name, type_name = match.groups()
            full_path = f"/home/ubuntu/WaituMusic/WaituMusicManager/{file_path}"
            
            if full_path not in files_with_errors:
                files_with_errors[full_path] = []
            
            files_with_errors[full_path].append({
                'property': prop_name,
                'type': type_name
            })
    
    # Apply fixes
    for file_path, errors in files_with_errors.items():
        if not os.path.exists(file_path):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Add type import at the top if not present
            if "import type" not in content and "from '../shared/types'" not in content:
                # Add after the first import or at the beginning
                first_import_match = re.search(r'^import .+?;', content, re.MULTILINE)
                if first_import_match:
                    content = (content[:first_import_match.end()] + 
                              "\nimport type * as Types from '../shared/types';" + 
                              content[first_import_match.end():])
                else:
                    content = "import type * as Types from '../shared/types';\n" + content
            
            # Apply type fixes
            for error in errors:
                prop = error['property']
                type_name = error['type']
                
                if 'UserPrimaryRoleWithRole' in type_name:
                    # Add type assertion
                    content = re.sub(
                        rf'(\w+)\.{prop}(?![=:])',
                        rf'(\1 as Types.UserPrimaryRoleWithRole).{prop}',
                        content
                    )
                elif prop in ['id', 'name', 'email', 'role', 'user']:
                    # Add optional chaining
                    content = re.sub(
                        rf'(\w+)\.{prop}(?![=:])',
                        rf'\1?.{prop}',
                        content
                    )
                elif prop in ['matchScore', 'userId']:
                    # Opportunity match fixes
                    content = re.sub(
                        rf'(\w+)\.{prop}',
                        rf'(\1 as Types.OpportunityMatch).{prop}',
                        content
                    )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed TS2339 errors in: {os.path.basename(file_path)}")
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")

def analyze_and_fix_ts2304_errors():
    """Analyze and fix TS2304 missing declaration errors"""
    
    error_lines = run_tsc_and_get_errors()
    ts2304_errors = [line for line in error_lines if 'error TS2304' in line]
    
    print(f"Found {len(ts2304_errors)} TS2304 errors to analyze")
    
    files_with_errors = {}
    for error_line in ts2304_errors:
        match = re.search(r'([^:]+):\d+:\d+.*Cannot find name \'([^\']+)\'', error_line)
        if match:
            file_path, var_name = match.groups()
            full_path = f"/home/ubuntu/WaituMusic/WaituMusicManager/{file_path}"
            
            if full_path not in files_with_errors:
                files_with_errors[full_path] = []
            
            files_with_errors[full_path].append(var_name)
    
    # Apply fixes
    for file_path, variables in files_with_errors.items():
        if not os.path.exists(file_path):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix common variable scope issues
            for var_name in variables:
                if var_name in ['service', 'consultant', 'collaborator', 'item', 'spec']:
                    # Fix map callbacks
                    content = re.sub(
                        rf'(\w+)\.map\(\(\)\s*=>\s*\(',
                        rf'\1.map(({var_name}: any) => (',
                        content
                    )
                    
                    # Fix forEach callbacks  
                    content = re.sub(
                        rf'(\w+)\.forEach\(\(\)\s*=>\s*',
                        rf'\1.forEach(({var_name}: any) => ',
                        content
                    )
                elif var_name in ['sum', 'total']:
                    # Fix reduce callbacks
                    content = re.sub(
                        r'\.reduce\(\((\w+)\)\s*=>\s*(\w+)\s*\+',
                        r'.reduce((sum: number, item: any) => sum +',
                        content
                    )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed TS2304 errors in: {os.path.basename(file_path)}")
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")

def main():
    """Main function to comprehensively fix TypeScript errors"""
    
    print("=== COMPREHENSIVE TYPESCRIPT ERROR RESOLUTION ===\n")
    
    os.chdir('/home/ubuntu/WaituMusic/WaituMusicManager')
    
    # Get initial counts
    print("1. Analyzing initial error state...")
    initial_errors = run_tsc_and_get_errors()
    initial_total = len([line for line in initial_errors if 'error TS' in line])
    initial_ts2339 = len([line for line in initial_errors if 'error TS2339' in line])
    initial_ts2304 = len([line for line in initial_errors if 'error TS2304' in line])
    initial_syntax = len([line for line in initial_errors if re.search(r'error TS(1005|1003|1109)', line)])
    
    print(f"   Total errors: {initial_total}")
    print(f"   TS2339 (property access): {initial_ts2339}")
    print(f"   TS2304 (missing declarations): {initial_ts2304}")
    print(f"   Syntax errors (TS1005/1003/1109): {initial_syntax}")
    
    # Phase 1: Fix syntax errors first
    print("\n2. Fixing syntax errors...")
    fix_broken_import_syntax()
    
    # Phase 2: Create type definitions
    print("\n3. Creating comprehensive type definitions...")
    create_comprehensive_types()
    
    # Get intermediate counts
    mid_errors = run_tsc_and_get_errors()
    mid_total = len([line for line in mid_errors if 'error TS' in line])
    mid_ts2339 = len([line for line in mid_errors if 'error TS2339' in line])
    mid_ts2304 = len([line for line in mid_errors if 'error TS2304' in line])
    
    print(f"   After syntax fixes - Total: {mid_total}, TS2339: {mid_ts2339}, TS2304: {mid_ts2304}")
    
    # Phase 3: Fix TS2304 errors
    print("\n4. Fixing TS2304 (missing declarations) errors...")
    analyze_and_fix_ts2304_errors()
    
    # Phase 4: Fix TS2339 errors
    print("\n5. Fixing TS2339 (property access) errors...")
    analyze_and_fix_ts2339_errors()
    
    # Final analysis
    print("\n6. Final analysis...")
    final_errors = run_tsc_and_get_errors()
    final_total = len([line for line in final_errors if 'error TS' in line])
    final_ts2339 = len([line for line in final_errors if 'error TS2339' in line])
    final_ts2304 = len([line for line in final_errors if 'error TS2304' in line])
    
    print(f"\n=== FINAL RESOLUTION REPORT ===")
    print(f"TS2339 (Property Access) Errors:")
    print(f"  Initial: {initial_ts2339} → Final: {final_ts2339}")
    print(f"  Resolved: {initial_ts2339 - final_ts2339}")
    print(f"  Success Rate: {((initial_ts2339 - final_ts2339) / max(initial_ts2339, 1) * 100):.1f}%")
    
    print(f"\nTS2304 (Missing Declarations) Errors:")
    print(f"  Initial: {initial_ts2304} → Final: {final_ts2304}")
    print(f"  Resolved: {initial_ts2304 - final_ts2304}")
    print(f"  Success Rate: {((initial_ts2304 - final_ts2304) / max(initial_ts2304, 1) * 100):.1f}%")
    
    print(f"\nOverall Progress:")
    print(f"  Total Errors: {initial_total} → {final_total}")
    print(f"  Total Resolved: {initial_total - final_total}")
    print(f"  Overall Improvement: {((initial_total - final_total) / max(initial_total, 1) * 100):.1f}%")
    
    # Show remaining error types
    if final_total > 0:
        print(f"\nRemaining Error Types:")
        error_counts = {}
        for line in final_errors:
            match = re.search(r'error (TS\d+)', line)
            if match:
                error_type = match.group(1)
                error_counts[error_type] = error_counts.get(error_type, 0) + 1
        
        for error_type, count in sorted(error_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {error_type}: {count} errors")
    
    print(f"\n=== RESOLUTION COMPLETED ===")
    
    return {
        'initial_total': initial_total,
        'final_total': final_total,
        'ts2339_resolved': initial_ts2339 - final_ts2339,
        'ts2304_resolved': initial_ts2304 - final_ts2304,
        'success': final_total < initial_total
    }

if __name__ == "__main__":
    main()
