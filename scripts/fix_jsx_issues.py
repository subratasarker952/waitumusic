
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def fix_jsx_structure(content):
    """Fix JSX structural issues"""
    lines = content.split('\n')
    fixed_lines = []
    jsx_stack = []
    in_jsx_block = False
    indent_level = 0
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Detect JSX blocks
        if 'return (' in line or 'return(' in line:
            in_jsx_block = True
        
        if in_jsx_block:
            # Handle JSX opening tags
            jsx_tags = re.findall(r'<(\w+)(?:\s[^>]*)?(?<!/)>', line)
            for tag in jsx_tags:
                jsx_stack.append(tag)
            
            # Handle JSX closing tags
            closing_tags = re.findall(r'</(\w+)>', line)
            for tag in closing_tags:
                if jsx_stack and jsx_stack[-1] == tag:
                    jsx_stack.pop()
            
            # Handle self-closing tags
            self_closing = re.findall(r'<(\w+)(?:\s[^>]*)?/>', line)
            
            # Fix missing closing tags at end of JSX block
            if (line.strip().endswith(');') or line.strip() == ')') and jsx_stack:
                # Insert missing closing tags
                closing_tags_to_add = []
                while jsx_stack:
                    tag = jsx_stack.pop()
                    closing_tags_to_add.append(f"</{tag}>")
                
                if closing_tags_to_add:
                    indent = ' ' * (len(line) - len(line.lstrip()))
                    for tag in closing_tags_to_add:
                        fixed_lines.append(f"{indent}{tag}")
                
                in_jsx_block = False
        
        # Fix common JSX syntax issues
        if '<' in line and '>' in line:
            # Fix unclosed JSX expressions
            line = re.sub(r'{([^}]*)(?<!})', r'{\1}', line)
            
            # Fix JSX attributes
            line = re.sub(r'(\w+)=([^"\s{][^\s>]*)', r'\1="\2"', line)
            
            # Fix JSX boolean attributes
            line = re.sub(r'(\w+)={true}', r'\1', line)
            line = re.sub(r'(\w+)={false}', r'\1={false}', line)
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_jsx_expressions(content):
    """Fix JSX expression syntax"""
    
    # Fix malformed JSX expressions
    content = re.sub(r'{([^{}]*)}(?=[^}])', r'{\1}', content)
    
    # Fix nested JSX expressions
    content = re.sub(r'{{([^{}]*)}}', r'{\1}', content)
    
    # Fix JSX conditional rendering
    content = re.sub(r'{(\w+)\s*&&\s*([^}]+)}', r'{\1 && \2}', content)
    content = re.sub(r'{(\w+)\s*\?\s*([^:]+)\s*:\s*([^}]+)}', r'{\1 ? \2 : \3}', content)
    
    return content

def fix_component_structure(content):
    """Fix React component structure issues"""
    
    # Fix component export/import
    content = re.sub(r'export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)\s*{', 
                     r'export default function \1(\2) {', content)
    
    # Fix React hook usage
    content = re.sub(r'const\s+\[([^,]+),\s*([^]]+)\]\s*=\s*useState\(([^)]*)\)', 
                     r'const [\1, \2] = useState(\3)', content)
    
    # Fix useEffect syntax
    content = re.sub(r'useEffect\(\(\)\s*=>\s*{([^}]*)},\s*\[([^\]]*)\]\)', 
                     r'useEffect(() => {\1}, [\2])', content, flags=re.DOTALL)
    
    return content

def process_tsx_file(file_path):
    """Process a single TSX file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply JSX-specific fixes
        content = fix_jsx_structure(content)
        content = fix_jsx_expressions(content)
        content = fix_component_structure(content)
        
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
    """Process all TSX files"""
    base_dir = Path('/home/ubuntu/WaituMusic/WaituMusicManager')
    
    files_processed = 0
    files_changed = 0
    
    # Process TSX files specifically
    for file_path in glob.glob(str(base_dir / 'client/src/**/*.tsx'), recursive=True):
        files_processed += 1
        if process_tsx_file(file_path):
            files_changed += 1
            print(f"Fixed JSX: {file_path}")
    
    print(f"\nProcessed {files_processed} TSX files, changed {files_changed} files")

if __name__ == "__main__":
    main()
