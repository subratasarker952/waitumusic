
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def fix_react_syntax():
    """Fix React component syntax issues"""
    
    error_files = [
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/ConsultationBookingSystem.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/EnhancedSplitsheetManager.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/components/ProfessionalManagementDashboard.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/pages/ConsultationBookingPage.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/pages/ProfessionalManagementPage.tsx',
    ]
    
    fixed_count = 0
    
    for file_path in error_files:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix the React.FC syntax issue
            content = re.sub(
                r'export const (\w+): \(React as any\)\.FC = \(\) => \{',
                r'export const \1: React.FC = () => {',
                content
            )
            
            # Alternative patterns
            content = re.sub(
                r'export const (\w+): \(React as any\)\.FC<([^>]*)> = \(\) => \{',
                r'export const \1: React.FC<\2> = () => {',
                content
            )
            
            # Fix any other (React as any) patterns
            content = re.sub(
                r'\(React as any\)\.FC',
                r'React.FC',
                content
            )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
                print(f"Fixed React syntax in: {file_path}")
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
    
    print(f"Fixed React syntax in {fixed_count} files")

def main():
    os.chdir('/home/ubuntu/WaituMusic/WaituMusicManager')
    fix_react_syntax()

if __name__ == "__main__":
    main()
