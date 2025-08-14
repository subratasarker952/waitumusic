
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def fix_basic_syntax(content):
    """Fix basic syntax issues caused by previous scripts"""
    
    # Fix malformed JSX attributes
    content = re.sub(r'(\w+)="\{"\s*([^}]+)\s*\}"\s*>', r'\1={{\2}}>', content)
    content = re.sub(r'(\w+)="\{"\s*([^}]+)\s*\}"', r'\1={{\2}}', content)
    
    # Fix style attributes specifically
    content = re.sub(r'style="\{"\s*\n', 'style={{\n', content)
    content = re.sub(r'style="\{"', 'style={{', content)
    
    # Fix JavaScript expressions in JSX
    content = re.sub(r'>\s*"\{"\s*([^}]+)\s*\}"\s*<', r'>{\1}<', content)
    
    # Fix import statements
    content = re.sub(r'import\s*\{\s*,\s*([^}]+)\s*\}', r'import { \1 }', content)
    content = re.sub(r'import\s*\{\s*([^}]+),\s*\}', r'import { \1 }', content)
    
    # Fix function declarations
    content = re.sub(r'function\s+(\w+)\s*\(\s*,\s*([^)]*)\s*\)', r'function \1(\2)', content)
    content = re.sub(r'function\s+(\w+)\s*\(\s*([^)]*),\s*\)', r'function \1(\2)', content)
    
    # Fix object syntax
    content = re.sub(r'{\s*,\s*([^}]+)\s*}', r'{ \1 }', content)
    content = re.sub(r'{\s*([^}]+),\s*}', r'{ \1 }', content)
    
    return content

def fix_jsx_structure(content):
    """Fix JSX structural issues"""
    
    # Fix self-closing tags
    content = re.sub(r'<(input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr)([^>]*?)(?<!\s/)>', 
                     r'<\1\2 />', content)
    
    # Fix JSX fragments
    content = re.sub(r'<>\s*([^<]*)\s*</>', r'<>\1</>', content)
    
    # Fix JSX conditional rendering
    content = re.sub(r'{\s*(\w+)\s*&&\s*([^}]+)\s*}', r'{\1 && \2}', content)
    
    return content

def fix_typescript_syntax(content):
    """Fix TypeScript-specific syntax"""
    
    # Fix type annotations
    content = re.sub(r':\s*,\s*([A-Za-z_][A-Za-z0-9_]*)', r': \1', content)
    content = re.sub(r'(\w+)\s*:\s*([^,=;)]+)\s*,\s*=', r'\1: \2 =', content)
    
    # Fix interface declarations
    content = re.sub(r'interface\s+(\w+)\s*{\s*,', r'interface \1 {', content)
    content = re.sub(r'interface\s+(\w+)\s*,\s*{', r'interface \1 {', content)
    
    # Fix export statements
    content = re.sub(r'export\s*{\s*,\s*([^}]+)\s*}', r'export { \1 }', content)
    content = re.sub(r'export\s*{\s*([^}]+),\s*}', r'export { \1 }', content)
    
    return content

def remove_redundant_commas(content):
    """Remove redundant commas that cause syntax errors"""
    
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # Remove leading commas
        line = re.sub(r'^\s*,\s*', '', line)
        
        # Remove trailing commas before closing braces/brackets
        if i < len(lines) - 1:
            next_line = lines[i + 1].strip()
            if next_line.startswith('}') or next_line.startswith(']') or next_line.startswith(')'):
                line = re.sub(r',\s*$', '', line)
        
        # Fix double commas
        line = re.sub(r',\s*,', ',', line)
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_semicolons(content):
    """Fix semicolon issues"""
    
    # Add missing semicolons
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Skip comments and empty lines
        if not stripped or stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            fixed_lines.append(line)
            continue
        
        # Add semicolons to import/export statements
        if (re.match(r'^(import|export).*[^;]$', stripped) and 
            not stripped.endswith('{') and not stripped.endswith(',')):
            line = line.rstrip() + ';'
        
        # Add semicolons to variable declarations
        if (re.match(r'^(const|let|var)\s+\w+.*[^;{}]$', stripped)):
            line = line.rstrip() + ';'
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def process_file(file_path):
    """Process a single file for comprehensive recovery"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply fixes in order
        content = fix_basic_syntax(content)
        content = fix_jsx_structure(content)
        content = fix_typescript_syntax(content)
        content = remove_redundant_commas(content)
        content = fix_semicolons(content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main recovery function"""
    base_dir = Path('/home/ubuntu/WaituMusic/WaituMusicManager')
    
    patterns = [
        'client/src/**/*.ts',
        'client/src/**/*.tsx'
    ]
    
    files_processed = 0
    files_changed = 0
    
    for pattern in patterns:
        for file_path in glob.glob(str(base_dir / pattern), recursive=True):
            files_processed += 1
            if process_file(file_path):
                files_changed += 1
                print(f"Recovered: {file_path}")
            
            # Process files in batches to avoid timeout
            if files_processed % 50 == 0:
                print(f"Processed {files_processed} files so far...")
    
    print(f"\nProcessed {files_processed} files, recovered {files_changed} files")

if __name__ == "__main__":
    main()
