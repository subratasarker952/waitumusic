
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def fix_jsx_entities(content):
    """Fix HTML entities in JSX that cause TS errors"""
    fixes = [
        ('&rbrace;', '}'),
        ('&lbrace;', '{'),
        ('&gt;', '>'),
        ('&lt;', '<'),
        ('&amp;', '&'),
        ('&quot;', '"'),
        ('&apos;', "'"),
        ('&#39;', "'"),
        ('&#x27;', "'"),
        ('&#x2F;', '/'),
        ('&nbsp;', ' '),
    ]
    
    for old, new in fixes:
        content = content.replace(old, new)
    
    return content

def fix_jsx_unclosed_tags(content):
    """Fix unclosed JSX tags"""
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Fix common unclosed tag patterns
        line = re.sub(r'<(div|span|p|h[1-6]|button|input|textarea|select|option|label|form|table|tr|td|th|ul|ol|li|nav|header|footer|section|article|aside|main)([^>]*?)(?<!/)>(\s*$)', 
                      r'<\1\2>', line)
        
        # Fix self-closing tags that aren't properly closed
        line = re.sub(r'<(input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr)([^>]*?)(?<!/)>', 
                      r'<\1\2 />', line)
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_syntax_errors(content):
    """Fix common syntax errors"""
    lines = content.split('\n')
    fixed_lines = []
    in_jsx = False
    brace_count = 0
    
    for i, line in enumerate(lines):
        original_line = line
        
        # Track JSX context
        if 'return (' in line or 'return(' in line:
            in_jsx = True
        if in_jsx:
            brace_count += line.count('{') - line.count('}')
            if brace_count == 0 and ('};' in line or line.strip().endswith('}')):
                in_jsx = False
        
        # Fix missing commas in object/array literals
        if re.search(r'\}\s*\n\s*[^,}\])]', line):
            if i < len(lines) - 1:
                next_line = lines[i + 1].strip()
                if next_line and not next_line.startswith('//') and not next_line.startswith('*') and not next_line.startswith('/*'):
                    if not line.rstrip().endswith(',') and not line.rstrip().endswith('{'):
                        line = line.rstrip() + ','
        
        # Fix missing semicolons
        if re.search(r'^[^/\*\s].*[^;{\s]$', line.strip()) and not in_jsx:
            if not re.search(r'^\s*(if|for|while|switch|function|class|interface|type|export|import)', line.strip()):
                if not line.strip().endswith(':') and '{' not in line and '}' not in line:
                    line = line.rstrip() + ';'
        
        # Fix JSX attribute syntax
        line = re.sub(r'(\w+)=([^"\s][^\s>]*)', r'\1="\2"', line)
        
        # Fix function parameter syntax
        line = re.sub(r'function\s+(\w+)\s*\(\s*([^)]*?)\s*\)', 
                      lambda m: f"function {m.group(1)}({', '.join(p.strip() for p in m.group(2).split(',') if p.strip())})", 
                      line)
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_typescript_declarations(content):
    """Fix TypeScript declaration issues"""
    
    # Fix import statements
    content = re.sub(r'import\s*{\s*([^}]*)\s*}\s*from\s*[\'"]([^\'"]*)[\'"];?\s*\n', 
                     lambda m: f"import {{ {', '.join(item.strip() for item in m.group(1).split(',') if item.strip())} }} from '{m.group(2)}';\n", 
                     content)
    
    # Fix export statements
    content = re.sub(r'export\s*{\s*([^}]*)\s*}\s*;?\s*\n', 
                     lambda m: f"export {{ {', '.join(item.strip() for item in m.group(1).split(',') if item.strip())} }};\n", 
                     content)
    
    # Fix interface declarations
    content = re.sub(r'interface\s+(\w+)\s*{([^}]*)}', 
                     lambda m: f"interface {m.group(1)} {{\n{m.group(2)}\n}}", 
                     content, flags=re.DOTALL)
    
    # Fix type annotations
    content = re.sub(r':\s*([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*\]', r': \1[]', content)
    content = re.sub(r':\s*([A-Za-z_][A-Za-z0-9_]*)\s*\|\s*([A-Za-z_][A-Za-z0-9_]*)', r': \1 | \2', content)
    
    return content

def process_file(file_path):
    """Process a single TypeScript/TSX file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply fixes in order
        content = fix_jsx_entities(content)
        content = fix_jsx_unclosed_tags(content)
        content = fix_syntax_errors(content)
        content = fix_typescript_declarations(content)
        
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
    """Main function to process all TypeScript files"""
    base_dir = Path('/home/ubuntu/WaituMusic/WaituMusicManager')
    
    # Find all TypeScript/TSX files
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
                print(f"Fixed: {file_path}")
    
    print(f"\nProcessed {files_processed} files, changed {files_changed} files")

if __name__ == "__main__":
    main()
