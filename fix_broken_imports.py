
#!/usr/bin/env python3

import os
import re
import glob

def fix_broken_imports():
    """Fix broken import statements that cause syntax errors"""
    
    # Get all TypeScript/React files
    file_patterns = [
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.tsx',
        '/home/ubuntu/WaituMusic/WaituMusicManager/client/src/**/*.ts',
        '/home/ubuntu/WaituMusicManager/server/**/*.ts',
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
            
            # Fix pattern where import statement has missing opening brace
            # Look for cases where we have standalone identifiers followed by } from
            content = re.sub(
                r'} from ([^;]+);\s*([a-zA-Z_][a-zA-Z0-9_,\s]*),\s*} from ([^;]+);',
                r'} from \1;\nimport { \2 } from \3;',
                content,
                flags=re.MULTILINE
            )
            
            # Fix broken multi-line imports
            lines = content.split('\n')
            fixed_lines = []
            i = 0
            
            while i < len(lines):
                line = lines[i].strip()
                
                # Check if we have a closing brace followed by 'from' but missing opening brace
                if line.endswith('} from') and i > 0:
                    # Look back for identifiers that should be part of this import
                    j = i - 1
                    identifiers = []
                    
                    while j >= 0 and not lines[j].strip().startswith('import') and not lines[j].strip().endswith(';'):
                        prev_line = lines[j].strip()
                        if prev_line and not prev_line.startswith('//'):
                            # Extract identifiers
                            identifiers.extend([id.strip().rstrip(',') for id in prev_line.split(',')])
                        j -= 1
                    
                    if identifiers and j >= 0:
                        # Reconstruct the import
                        import_line = lines[j].strip()
                        if import_line.startswith('import') and '} from' in lines[i]:
                            from_part = lines[i][lines[i].find('} from'):].replace('} from', 'from')
                            new_import = f"{import_line.rstrip(';')}, {', '.join(reversed(identifiers))} }} {from_part}"
                            
                            # Replace all these lines with the fixed import
                            fixed_lines.extend(lines[:j])
                            fixed_lines.append(new_import)
                            fixed_lines.extend(lines[i+1:])
                            break
                
                i += 1
            
            # If we made changes through the loop reconstruction
            if fixed_lines:
                content = '\n'.join(fixed_lines)
            else:
                # Apply simpler regex fixes
                
                # Fix imports that have identifiers followed by } without opening {
                content = re.sub(
                    r'(\s+)([a-zA-Z_][a-zA-Z0-9_]*),\s*\n(\s+)([a-zA-Z_][a-zA-Z0-9_]*),?\s*\n(\s*)} from',
                    r'\1{\2,\n\3\4\n\5} from',
                    content,
                    flags=re.MULTILINE
                )
                
                # Fix simple case of missing opening brace
                content = re.sub(
                    r'\n\s*([a-zA-Z_][a-zA-Z0-9_,\s]*),?\s*\n\s*} from ([^;]+);',
                    r'\nimport { \1 } from \2;',
                    content,
                    flags=re.MULTILINE
                )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_files += 1
                print(f"Fixed broken imports in: {os.path.basename(file_path)}")
                
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
    
    print(f"Fixed broken imports in {fixed_files} files")

def main():
    os.chdir('/home/ubuntu/WaituMusic/WaituMusicManager')
    fix_broken_imports()

if __name__ == "__main__":
    main()
