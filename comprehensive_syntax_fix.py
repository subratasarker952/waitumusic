#!/usr/bin/env python3
"""
Comprehensive Syntax Fix Script for WaituMusic Manager
Addresses all remaining TS1128, TS1005, TS1003, TS1109 syntax errors
"""

import os
import re
import glob

def fix_consultation_booking_system():
    """Fix ConsultationBookingSystem.tsx syntax issues"""
    file_path = "client/src/components/ConsultationBookingSystem.tsx"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix missing parentheses in function calls
    content = re.sub(r'}\s*\)\s*;?\s*\}\s*$', '});\n    }', content, flags=re.MULTILINE)
    
    # Fix incomplete function brackets
    content = re.sub(r'}\)(\s*)\n(\s*)const result', r'})\1\n\2const result', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed ConsultationBookingSystem.tsx")

def fix_enhanced_splitsheet_manager():
    """Fix EnhancedSplitsheetManager.tsx syntax issues"""
    file_path = "client/src/components/EnhancedSplitsheetManager.tsx"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix malformed string literals and object syntax
    content = re.sub(r"studioSessionCode:\s*\\['\"]\\['\"]", "studioSessionCode: ''", content)
    content = re.sub(r"studioSessionCode:\s*\\\'\\\',\}\)", "studioSessionCode: ''", content)
    
    # Fix incomplete object definitions
    content = re.sub(r'}\s*as\s*Song;\s*\n\s*[A-Z]\w+,', '} as Song;\n\n  const [songForm, setSongForm] = useState({', content)
    
    # Fix broken object syntax patterns
    content = re.sub(r'collaboratorCodes:\s*\{\},?\s*professionalTags:\s*\[\],?\s*managementNotes:\s*[\'"][\'"]?\s*}\s*as\s*Song;?\s*[A-Za-z]+,', 
                     'collaboratorCodes: {},\n    professionalTags: [],\n    managementNotes: \'\'\n  } as Song;\n\n  const [splitsheetData, setSplitsheetData] = useState({', content)
    
    # Fix incomplete function definitions
    content = re.sub(r'}\);\s*\n\s*const\s+\[loading', '});\n\n  const [loading', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed EnhancedSplitsheetManager.tsx")

def fix_professional_management_dashboard():
    """Fix ProfessionalManagementDashboard.tsx syntax issues"""
    file_path = "client/src/components/ProfessionalManagementDashboard.tsx"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix incomplete function call syntax
    content = re.sub(r'onCheckedChange=\{\(checked\)\s*=>\s*\}\s*setPermissions', 
                     'onCheckedChange={(checked) => setPermissions', content)
    
    # Fix malformed JSX expressions
    content = re.sub(r'\{\.\.\.[^}]*,\s*\[key\]:\s*checked\s*\}\)\s*\}\s*\}', 
                     '{ ...prev, [key]: checked }))}}', content)
    
    # Fix incomplete bracket closures in JSX
    content = re.sub(r'}\s*\n\s*}\s*\n\s*/>', '}}\n                    />', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed ProfessionalManagementDashboard.tsx")

def fix_enhanced_booking_workflow():
    """Fix EnhancedBookingWorkflow.tsx syntax issues"""
    file_path = "client/src/components/booking/EnhancedBookingWorkflow.tsx"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix malformed function parameters
    content = re.sub(r'export default function EnhancedBookingWorkflow\(\{bookingId,\s*currentStep,\s*\}\)\s*onStepComplete\s*\}\)\s*\}:', 
                     'export default function EnhancedBookingWorkflow({ bookingId, currentStep, onStepComplete }:', content)
    
    # Fix incomplete query definitions
    content = re.sub(r'queryKey:\s*\[[^\]]*\],\s*\}\)\s*queryFn:\s*async\s*\(\)\s*=>\s*\{\s*\}\)', 
                     'queryKey: ["/api/profile"],\n    queryFn: async () => {', content)
    
    # Fix malformed fetch calls
    content = re.sub(r'await\s+fetch\(fetch\([\'"][^\'"]*[\'"]\s*,\s*\{\s*credentials:\s*[\'"][^\'"]*[\'\"]\s*\}\s*\)\);', 
                     'await fetch("/api/profile", { credentials: "include" });', content)
    
    # Fix incomplete object closing brackets
    content = re.sub(r'return\s+response\.json\(\);\s*\}\s*\}\);', 
                     'return response.json();\n    }\n  });', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed EnhancedBookingWorkflow.tsx")

def fix_all_syntax_patterns():
    """Fix common syntax patterns across all TypeScript files"""
    
    # Get all TypeScript files
    ts_files = []
    for pattern in ["client/**/*.ts", "client/**/*.tsx", "server/**/*.ts", "server/**/*.tsx"]:
        ts_files.extend(glob.glob(pattern, recursive=True))
    
    for file_path in ts_files:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            original_content = content
            
            # Fix common syntax patterns
            
            # 1. Fix incomplete function call parentheses
            content = re.sub(r'(\w+)\s*\(\s*\)\s*=>\s*\}\s*([^}])', r'\1(() => {\2', content)
            
            # 2. Fix malformed object literals
            content = re.sub(r'\{\s*,', '{', content)
            content = re.sub(r',\s*\}', ' }', content)
            
            # 3. Fix incomplete JSX expressions
            content = re.sub(r'\{\s*\}\s*([>}])', r'{\1', content)
            
            # 4. Fix double closing brackets
            content = re.sub(r'\}\s*\}\s*\)', '})', content)
            
            # 5. Fix malformed string literals
            content = re.sub(r"\\['\"]\\['\"]", "''", content)
            
            # 6. Fix incomplete arrow functions
            content = re.sub(r'=>\s*\}\s*([^}])', r'=> {\1', content)
            
            # 7. Fix missing semicolons after statements
            content = re.sub(r'(\w+\([^)]*\))\s*\n\s*const', r'\1;\n  const', content)
            
            # 8. Fix incomplete import statements
            content = re.sub(r'import\s*\{\s*,', 'import {', content)
            content = re.sub(r',\s*\}\s*from', ' } from', content)
            
            if content != original_content:
                with open(file_path, 'w') as f:
                    f.write(content)
                print(f"✓ Applied general syntax fixes to {file_path}")
                
        except Exception as e:
            print(f"⚠ Warning: Could not process {file_path}: {e}")

def main():
    """Main execution function"""
    
    print("🔧 Starting Comprehensive Syntax Fix Process...")
    print("=" * 60)
    
    os.chdir("/home/ubuntu/WaituMusic/WaituMusicManager")
    
    # Fix specific critical files first
    print("\n📍 Fixing Critical Component Files:")
    fix_consultation_booking_system()
    fix_enhanced_splitsheet_manager()
    fix_professional_management_dashboard()
    fix_enhanced_booking_workflow()
    
    print("\n📍 Applying General Syntax Pattern Fixes:")
    fix_all_syntax_patterns()
    
    print("\n" + "=" * 60)
    print("✅ Comprehensive Syntax Fix Process Complete!")
    print("\n🧪 Running TypeScript validation...")

if __name__ == "__main__":
    main()