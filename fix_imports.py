
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def fix_malformed_imports():
    """Fix the malformed imports that were added"""
    
    # Get all TypeScript/JavaScript files
    file_patterns = [
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.ts',
        '/home/ubuntu/WaituMusic/WaituMusicManager/server/**/*.ts',
        '/home/ubuntu/WaituMusic/WaituMusicManager/server/**/*.js',
    ]
    
    all_files = []
    for pattern in file_patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    print(f"Fixing imports in {len(all_files)} files...")
    
    fixed_count = 0
    
    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Remove the malformed import
            content = re.sub(r"import type \* from '[^']*comprehensive-types';\n", "", content)
            
            # Fix any other malformed imports
            content = re.sub(r"import React from 'react';\nimport React from 'react';", "import React from 'react';", content)
            
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
                fixed_count += 1
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
    
    print(f"Fixed imports in {fixed_count} files")

def main():
    os.chdir('/home/ubuntu/WaituMusic/WaituMusicManager')
    fix_malformed_imports()

if __name__ == "__main__":
    main()
