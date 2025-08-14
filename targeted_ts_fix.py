
#!/usr/bin/env python3
import re
import os
import subprocess
from pathlib import Path

PROJECT_ROOT = "/home/ubuntu/WaituMusic/WaituMusicManager"
os.chdir(PROJECT_ROOT)

def create_type_definitions():
    """Create comprehensive type definitions"""
    type_defs = '''// Type Definitions for WaituMusic Manager
export interface QueryParams {
  [key: string]: string | string[] | undefined;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface DatabaseResult<T = any> {
  rows: T[];
  rowCount?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Function type helpers
export type MapCallback<T, R> = (item: T, index?: number, array?: T[]) => R;
export type FilterCallback<T> = (item: T, index?: number, array?: T[]) => boolean;
export type ReduceCallback<T, R> = (acc: R, current: T, index?: number, array?: T[]) => R;

// Common data types
export interface BookingData {
  [key: string]: any;
}

export interface OpportunityData {
  [key: string]: any;
}
'''
    
    with open(os.path.join(PROJECT_ROOT, 'shared/types.ts'), 'w') as f:
        f.write(type_defs)
    print("✅ Created type definitions")

def fix_specific_callback_parameters():
    """Fix only specific callback parameter issues without breaking other code"""
    
    files_to_fix = [
        'server/routes.ts',
        'server/storage.ts'
    ]
    
    for file_path in files_to_fix:
        full_path = os.path.join(PROJECT_ROOT, file_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Very specific patterns that we know are problematic
                # Fix word parameter in capitalize functions
                content = re.sub(r'\.split\([\'"][^\'\"]*[\'\"]\)\.map\(word\s*=>', r'.split("").map((word: string) =>', content)
                content = re.sub(r'\.map\(word\s*=>', r'.map((word: string) =>', content)
                
                # Fix accumulator patterns in reduce
                content = re.sub(r'\.reduce\(acc,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=>', r'.reduce((acc: any, \1: any) =>', content)
                content = re.sub(r'\.reduce\(([a-zA-Z_][a-zA-Z0-9_]*),\s*acc\s*=>', r'.reduce((\1: any, acc: any) =>', content)
                
                # Fix specific patterns we found in the errors
                content = re.sub(r'(Parameter \'acc\' implicitly has an \'any\' type)', '', content)
                content = re.sub(r'(Parameter \'talent\' implicitly has an \'any\' type)', '', content)
                
                if content != original_content:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✅ Applied targeted fixes to: {file_path}")
            
            except Exception as e:
                print(f"❌ Error fixing {file_path}: {e}")

def fix_query_parameter_issues():
    """Fix request parameter type issues carefully"""
    
    files_to_fix = ['server/routes.ts']
    
    for file_path in files_to_fix:
        full_path = os.path.join(PROJECT_ROOT, file_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Fix specific query parameter parsing issues
                # Pattern: req.query.page, req.query.limit need to be converted to numbers
                content = re.sub(
                    r'req\.query\.page\s*\|\|\s*([\'\"]\d+[\'\"]\w*)',
                    r'parseInt(req.query.page as string) || \1',
                    content
                )
                content = re.sub(
                    r'req\.query\.limit\s*\|\|\s*([\'\"]\d+[\'\"]\w*)',
                    r'parseInt(req.query.limit as string) || \1',
                    content
                )
                
                if content != original_content:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✅ Fixed query parameters in: {file_path}")
                        
            except Exception as e:
                print(f"❌ Error fixing {file_path}: {e}")

def fix_specific_known_errors():
    """Fix the specific errors we identified from the error output"""
    
    # Fix the fileFilter issue we know about
    routes_file = os.path.join(PROJECT_ROOT, 'server/routes.ts')
    if os.path.exists(routes_file):
        try:
            with open(routes_file, 'r') as f:
                content = f.read()
            
            # Fix double parentheses in fileFilter if it exists
            content = re.sub(
                r'fileFilter:\s*\(\(req:\s*any,\s*file:\s*any,\s*cb:\s*any\)\s*=>\s*{',
                'fileFilter: (req: any, file: any, cb: any) => {',
                content
            )
            
            with open(routes_file, 'w') as f:
                f.write(content)
                
            print("✅ Fixed fileFilter syntax")
        except Exception as e:
            print(f"❌ Error fixing fileFilter: {e}")

def add_targeted_type_annotations():
    """Add type annotations only where specifically needed"""
    
    files_and_patterns = [
        ('server/routes.ts', [
            # Fix specific arrow function parameters that we know are problematic
            (r'\.reduce\(([a-zA-Z_][a-zA-Z0-9_]*),\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=>', r'.reduce((\1: any, \2: any) =>'),
            (r'\.map\(([a-zA-Z_][a-zA-Z0-9_]*)\s*=>\s*([a-zA-Z_][a-zA-Z0-9_]*)\.', r'.map((\1: any) => \2.'),
        ]),
    ]
    
    for file_path, patterns in files_and_patterns:
        full_path = os.path.join(PROJECT_ROOT, file_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                for pattern, replacement in patterns:
                    content = re.sub(pattern, replacement, content)
                
                if content != original_content:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"✅ Added type annotations to: {file_path}")
                        
            except Exception as e:
                print(f"❌ Error annotating {file_path}: {e}")

def main():
    print("🎯 TARGETED TYPESCRIPT ERROR FIXING")
    print("=" * 40)
    
    print("\n1. Creating type definitions...")
    create_type_definitions()
    
    print("\n2. Fixing specific callback parameters...")
    fix_specific_callback_parameters()
    
    print("\n3. Fixing query parameter issues...")
    fix_query_parameter_issues()
    
    print("\n4. Fixing specific known errors...")
    fix_specific_known_errors()
    
    print("\n5. Adding targeted type annotations...")
    add_targeted_type_annotations()
    
    print("\n6. Checking results...")
    result = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True, cwd=PROJECT_ROOT)
    
    if result.returncode == 0:
        print("🎉 ALL TYPESCRIPT ERRORS RESOLVED!")
    else:
        error_lines = result.stderr.split('\n')
        ts7006_count = len([line for line in error_lines if 'TS7006' in line])
        ts2345_count = len([line for line in error_lines if 'TS2345' in line])
        total_target_errors = ts7006_count + ts2345_count
        
        print(f"📊 TARGETED ERROR STATUS:")
        print(f"   - TS7006 errors: {ts7006_count}")
        print(f"   - TS2345 errors: {ts2345_count}")
        print(f"   - Total targeted errors: {total_target_errors}")
        
        if total_target_errors < 50:
            print("🎉 Significant progress on targeted errors!")
            
        # Show some example errors for manual fixing
        print(f"\n📋 Sample remaining errors:")
        remaining_errors = [line for line in error_lines if 'TS7006' in line or 'TS2345' in line]
        for error in remaining_errors[:5]:
            print(f"   {error}")

if __name__ == "__main__":
    main()
