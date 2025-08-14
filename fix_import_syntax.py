
#!/usr/bin/env python3

import os
import re
import glob

def fix_malformed_imports():
    """Fix malformed import statements"""
    
    # Get all TypeScript/React files
    file_patterns = [
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.ts',
        '/home/ubuntu/WaituMusic/WaituMusicManager/server/**/*.ts',
    ]
    
    all_files = []
    for pattern in file_patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    fixed_files = 0
    
    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix the malformed import type * from syntax
            content = re.sub(
                r"import type \* from '[^']*enhanced-types';",
                "import type * as Types from '../shared/enhanced-types';",
                content
            )
            
            # Remove duplicate imports
            lines = content.split('\n')
            seen_imports = set()
            cleaned_lines = []
            
            for line in lines:
                if line.strip().startswith('import ') and line.strip() in seen_imports:
                    continue
                if line.strip().startswith('import '):
                    seen_imports.add(line.strip())
                cleaned_lines.append(line)
            
            content = '\n'.join(cleaned_lines)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_files += 1
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
    
    print(f"Fixed import syntax in {fixed_files} files")

def main():
    os.chdir('/home/ubuntu/WaituMusic/WaituMusicManager')
    fix_malformed_imports()

if __name__ == "__main__":
    main()
