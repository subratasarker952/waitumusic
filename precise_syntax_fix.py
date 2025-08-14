#!/usr/bin/env python3
"""
Precise Syntax Fix Script - Final corrections
"""

import os
import re

def fix_enhanced_splitsheet_manager():
    """Fix specific syntax issues in EnhancedSplitsheetManager.tsx"""
    file_path = "client/src/components/EnhancedSplitsheetManager.tsx"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix the malformed object structure around line 66
    content = re.sub(
        r"studioSessionCode:\s*['\"]['\"]?\s*\}\)\s*collaboratorCodes:",
        "studioSessionCode: '',\n      collaboratorCodes:",
        content
    )
    
    # Ensure proper object closing
    content = re.sub(
        r"managementNotes:\s*['\"]['\"]?\s*\}\s*as\s*Song;\s*const\s*\[songForm",
        "managementNotes: ''\n  } as Song;\n\n  const [songForm",
        content
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed EnhancedSplitsheetManager.tsx")

def fix_consultation_booking_system():
    """Fix ConsultationBookingSystem.tsx parentheses issue"""
    file_path = "client/src/components/ConsultationBookingSystem.tsx"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix missing closing parenthesis in fetch call
    content = re.sub(
        r"duration:\s*selectedService\.duration\s*\}\)\s*\}\);",
        "duration: selectedService.duration\n        })\n      });",
        content
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed ConsultationBookingSystem.tsx")

def fix_general_syntax_patterns():
    """Fix common syntax issues that were introduced"""
    
    files_to_check = [
        "client/src/components/AdvancedBookingInterface.tsx",
        "client/src/components/AlbumUploadModal.tsx",
        "client/src/components/AnalyticsDashboard.tsx"
    ]
    
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r') as f:
            content = f.read()
        
        original_content = content
        
        # Fix incomplete object properties
        content = re.sub(r'(\w+):\s*\}\s*([^,}])', r'\1: "",\2', content)
        
        # Fix incomplete array closing
        content = re.sub(r',\s*\]\s*\}\s*\)', '])}', content)
        
        # Fix incomplete function calls
        content = re.sub(r'(\w+)\(\s*\)\s*=>\s*\{\s*\}', r'\1(() => {', content)
        
        if content != original_content:
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"✓ Applied fixes to {file_path}")

def revert_problematic_changes():
    """Revert some changes that may have caused issues"""
    
    # Get all TypeScript files that were modified
    import subprocess
    
    try:
        result = subprocess.run(['find', '.', '-name', '*.tsx', '-o', '-name', '*.ts'], 
                              capture_output=True, text=True)
        
        files = result.stdout.strip().split('\n')
        
        for file_path in files:
            if not os.path.exists(file_path) or 'node_modules' in file_path:
                continue
                
            with open(file_path, 'r') as f:
                content = f.read()
            
            original_content = content
            
            # Revert problematic regex replacements
            content = re.sub(r'(\w+):\s*"",\s*([^,}])', r'\1: \2', content)
            content = re.sub(r'export default function (\w+)\(\{([^}]+)\}:.*\}:', 
                           r'export default function \1({ \2 }:', content)
            
            if content != original_content:
                with open(file_path, 'w') as f:
                    f.write(content)
                print(f"✓ Reverted issues in {file_path}")
                
    except Exception as e:
        print(f"Error during revert: {e}")

def main():
    """Main execution"""
    os.chdir("/home/ubuntu/WaituMusic/WaituMusicManager")
    
    print("🔧 Applying Precise Syntax Fixes...")
    print("=" * 50)
    
    # Apply specific fixes
    fix_enhanced_splitsheet_manager()
    fix_consultation_booking_system()
    fix_general_syntax_patterns()
    
    print("\n🔄 Reverting Problematic Changes...")
    revert_problematic_changes()
    
    print("\n✅ Precise Fix Complete!")

if __name__ == "__main__":
    main()