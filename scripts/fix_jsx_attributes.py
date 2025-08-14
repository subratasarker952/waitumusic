
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def fix_jsx_style_attributes(content):
    """Fix corrupted JSX style attributes"""
    
    # Fix style="{" pattern back to style={{
    content = re.sub(r'style="\{"\s*\n', 'style={{\n', content)
    content = re.sub(r'style="\{"', 'style={{', content)
    
    # Fix other JSX attributes that may have been corrupted
    content = re.sub(r'(\w+)="\{"\s*([^}]+)\s*\}}"', r'\1={{\2}}', content)
    content = re.sub(r'(\w+)="\{"([^}]+)"\}"', r'\1={\2}', content)
    
    # Fix JSX expressions that got corrupted
    content = re.sub(r'>\s*"\{"\s*([^}]+)\s*\}"\s*<', r'>{\1}<', content)
    
    return content

def fix_jsx_boolean_attributes(content):
    """Fix JSX boolean attributes"""
    
    # Fix boolean attributes
    content = re.sub(r'(\w+)="\{"true"\}"', r'\1', content)
    content = re.sub(r'(\w+)="\{"false"\}"', r'\1={false}', content)
    
    return content

def fix_jsx_string_attributes(content):
    """Fix JSX string attributes that got corrupted"""
    
    # Fix string attributes that got wrapped incorrectly
    content = re.sub(r'(\w+)="\{"([^"]+)"\}"', r'\1="\2"', content)
    
    return content

def restore_proper_jsx(content):
    """Restore proper JSX syntax"""
    
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Fix specific patterns
        line = re.sub(r'style="\{"\s*$', 'style={{', line)
        line = re.sub(r'^\s*([^:]+):\s*([^,]+),\s*$', r'  \1: \2,', line)
        line = re.sub(r'^\s*([^:]+):\s*([^}]+)\s*$', r'  \1: \2', line)
        
        # Fix closing braces
        if line.strip() == '}}>':
            line = line.replace('}}>', '}}')
        
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    # Fix multiline style objects
    content = re.sub(
        r'style=\{\{\s*\n((?:\s*[^:]+:\s*[^,\n]+,?\s*\n)*)\s*\}\}', 
        lambda m: f'style={{\n{m.group(1).rstrip()}\n}}',
        content,
        flags=re.MULTILINE
    )
    
    return content

def process_file(file_path):
    """Process a single TSX file to fix JSX attributes"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply JSX-specific fixes
        content = fix_jsx_style_attributes(content)
        content = fix_jsx_boolean_attributes(content)
        content = fix_jsx_string_attributes(content)
        content = restore_proper_jsx(content)
        
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
    """Process all TSX files to fix JSX attributes"""
    base_dir = Path('/home/ubuntu/WaituMusic/WaituMusicManager')
    
    files_processed = 0
    files_changed = 0
    
    # Process TSX files specifically
    for file_path in glob.glob(str(base_dir / 'client/src/**/*.tsx'), recursive=True):
        files_processed += 1
        if process_file(file_path):
            files_changed += 1
            print(f"Fixed JSX attributes: {file_path}")
    
    print(f"\nProcessed {files_processed} TSX files, fixed {files_changed} files")

if __name__ == "__main__":
    main()
