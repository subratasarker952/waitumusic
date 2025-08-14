
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def fix_missing_commas(content):
    """Fix missing commas in objects and arrays"""
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Skip comments and empty lines
        if not stripped or stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            fixed_lines.append(line)
            continue
        
        # Check if this line needs a comma
        if i < len(lines) - 1:
            next_line = lines[i + 1].strip()
            
            # Skip if next line is empty or comment
            if not next_line or next_line.startswith('//') or next_line.startswith('/*') or next_line.startswith('*'):
                fixed_lines.append(line)
                continue
            
            # Check if we're in an object or array context and need a comma
            if (stripped.endswith('}') or stripped.endswith(']') or 
                re.search(r':\s*[^,{\s][^,]*$', stripped) or
                re.search(r'^\s*["\w]+\s*$', stripped)):
                
                # Check if next line suggests we're still in the same structure
                if (next_line.startswith('}') or next_line.startswith(']') or 
                    ',' in next_line or next_line.endswith(',') or
                    re.search(r'^["\w]+\s*:', next_line)):
                    
                    # Don't add comma if it already exists or if it's the last item
                    if not stripped.endswith(',') and not next_line.startswith('}') and not next_line.startswith(']'):
                        line = line.rstrip() + ','
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_missing_semicolons(content):
    """Fix missing semicolons"""
    lines = content.split('\n')
    fixed_lines = []
    in_jsx = False
    in_multiline_comment = False
    
    for line in lines:
        stripped = line.strip()
        
        # Track comment blocks
        if '/*' in stripped:
            in_multiline_comment = True
        if '*/' in stripped:
            in_multiline_comment = False
            fixed_lines.append(line)
            continue
        
        if in_multiline_comment or stripped.startswith('//') or stripped.startswith('*'):
            fixed_lines.append(line)
            continue
        
        # Track JSX context
        if 'return (' in line or 'return(' in line:
            in_jsx = True
        if in_jsx and (line.strip().endswith(');') or line.strip() == ')'):
            in_jsx = False
        
        # Add semicolons where needed
        if not in_jsx and stripped:
            # Statements that need semicolons
            if (re.search(r'^(const|let|var|import|export|return|throw|break|continue)', stripped) or
                re.search(r'^\w+\s*\([^)]*\)$', stripped) or  # function calls
                re.search(r'^\w+\s*=.*[^;{\s]$', stripped)):  # assignments
                
                if not stripped.endswith(';') and not stripped.endswith('{') and not stripped.endswith(','):
                    line = line.rstrip() + ';'
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_declaration_syntax(content):
    """Fix TypeScript declaration syntax issues"""
    
    # Fix function declarations
    content = re.sub(r'function\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*([^{]+)\s*{', 
                     r'function \1(\2): \3 {', content)
    
    # Fix variable declarations with types
    content = re.sub(r'(const|let|var)\s+(\w+)\s*:\s*([^=]+)\s*=', r'\1 \2: \3 =', content)
    
    # Fix interface/type declarations
    content = re.sub(r'(interface|type)\s+(\w+)\s*{', r'\1 \2 {', content)
    content = re.sub(r'(interface|type)\s+(\w+)\s*=\s*{', r'\1 \2 = {', content)
    
    # Fix import/export statements
    content = re.sub(r'import\s*{\s*([^}]+)\s*}\s*from\s*[\'"]([^\'"]+)[\'"]', 
                     r'import { \1 } from "\2"', content)
    content = re.sub(r'export\s*{\s*([^}]+)\s*}', r'export { \1 }', content)
    
    return content

def fix_expression_syntax(content):
    """Fix expression syntax issues"""
    
    # Fix array access
    content = re.sub(r'(\w+)\[\s*\]', r'\1[]', content)
    content = re.sub(r'(\w+)\[\s*([^]]+)\s*\]', r'\1[\2]', content)
    
    # Fix object property access
    content = re.sub(r'(\w+)\.\s*(\w+)', r'\1.\2', content)
    
    # Fix function call syntax
    content = re.sub(r'(\w+)\s*\(\s*([^)]*)\s*\)', r'\1(\2)', content)
    
    # Fix conditional expressions
    content = re.sub(r'(\w+)\s*\?\s*([^:]+)\s*:\s*([^;,}]+)', r'\1 ? \2 : \3', content)
    
    return content

def process_file(file_path):
    """Process a single file for structural fixes"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply structural fixes
        content = fix_missing_commas(content)
        content = fix_missing_semicolons(content)
        content = fix_declaration_syntax(content)
        content = fix_expression_syntax(content)
        
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
    """Process all TypeScript files for structural fixes"""
    base_dir = Path('/home/ubuntu/WaituMusic/WaituMusicManager')
    
    patterns = [
        'client/src/**/*.ts',
        'client/src/**/*.tsx',
        'server/**/*.ts',
        'shared/**/*.ts'
    ]
    
    files_processed = 0
    files_changed = 0
    
    for pattern in patterns:
        for file_path in glob.glob(str(base_dir / pattern), recursive=True):
            files_processed += 1
            if process_file(file_path):
                files_changed += 1
                print(f"Fixed structure: {file_path}")
    
    print(f"\nProcessed {files_processed} files, changed {files_changed} files")

if __name__ == "__main__":
    main()
