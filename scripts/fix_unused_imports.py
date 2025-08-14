
#!/usr/bin/env python3

import os
import re
import glob
from pathlib import Path

def extract_used_identifiers(content):
    """Extract all identifiers used in the file"""
    used = set()
    
    # Remove comments and strings to avoid false positives
    content_cleaned = re.sub(r'//.*|/\*.*?\*/', '', content, flags=re.DOTALL)
    content_cleaned = re.sub(r'[\'"`].*?[\'"`]', '', content_cleaned, flags=re.DOTALL)
    
    # Find all identifiers used in the code
    identifiers = re.findall(r'\b([A-Za-z_][A-Za-z0-9_]*)\b', content_cleaned)
    used.update(identifiers)
    
    return used

def fix_unused_imports(content):
    """Remove unused imports"""
    lines = content.split('\n')
    fixed_lines = []
    used_identifiers = extract_used_identifiers(content)
    
    for line in lines:
        # Check if this is an import line
        import_match = re.match(r'import\s*{\s*([^}]+)\s*}\s*from\s*[\'"]([^\'"]+)[\'"]', line.strip())
        
        if import_match:
            imports_str = import_match.group(1)
            module_path = import_match.group(2)
            
            # Parse individual imports
            imports = [imp.strip() for imp in imports_str.split(',')]
            used_imports = []
            
            for imp in imports:
                # Handle aliased imports (e.g., "Button as Btn")
                if ' as ' in imp:
                    original_name, alias = imp.split(' as ')
                    if alias.strip() in used_identifiers:
                        used_imports.append(imp)
                else:
                    if imp.strip() in used_identifiers:
                        used_imports.append(imp)
            
            # Reconstruct import statement with only used imports
            if used_imports:
                new_import = f'import {{ {", ".join(used_imports)} }} from "{module_path}";'
                fixed_lines.append(new_import)
            # If no imports are used, skip the entire import line
            
        else:
            # Check for default imports
            default_import_match = re.match(r'import\s+([A-Za-z_][A-Za-z0-9_]*)\s*from\s*[\'"]([^\'"]+)[\'"]', line.strip())
            
            if default_import_match:
                imported_name = default_import_match.group(1)
                if imported_name in used_identifiers:
                    fixed_lines.append(line)
                # Skip unused default imports
            else:
                fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def fix_duplicate_imports(content):
    """Merge duplicate import statements"""
    lines = content.split('\n')
    import_map = {}
    non_import_lines = []
    
    for line in lines:
        # Check for named imports
        import_match = re.match(r'import\s*{\s*([^}]+)\s*}\s*from\s*[\'"]([^\'"]+)[\'"]', line.strip())
        
        if import_match:
            imports_str = import_match.group(1)
            module_path = import_match.group(2)
            
            imports = [imp.strip() for imp in imports_str.split(',')]
            
            if module_path not in import_map:
                import_map[module_path] = set()
            
            import_map[module_path].update(imports)
        
        # Check for default imports (keep separate for now)
        elif re.match(r'import\s+[A-Za-z_][A-Za-z0-9_]*\s*from', line.strip()):
            non_import_lines.append(line)
        
        # Non-import lines
        else:
            non_import_lines.append(line)
    
    # Reconstruct with merged imports
    merged_lines = []
    
    # Add merged import statements at the top
    for module_path, imports in sorted(import_map.items()):
        if imports:
            merged_import = f'import {{ {", ".join(sorted(imports))} }} from "{module_path}";'
            merged_lines.append(merged_import)
    
    # Add remaining lines
    in_import_section = True
    for line in non_import_lines:
        # Skip original import lines we've already merged
        if re.match(r'import\s*{\s*[^}]+\s*}\s*from', line.strip()):
            continue
        
        # Add empty line after imports section
        if in_import_section and line.strip() and not line.strip().startswith('import'):
            if merged_lines and not merged_lines[-1].strip():
                pass  # Already have empty line
            else:
                merged_lines.append('')
            in_import_section = False
        
        merged_lines.append(line)
    
    return '\n'.join(merged_lines)

def process_file(file_path):
    """Process a single file for import fixes"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply import fixes
        content = fix_unused_imports(content)
        content = fix_duplicate_imports(content)
        
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
    """Process all TypeScript files for import fixes"""
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
                print(f"Fixed imports: {file_path}")
    
    print(f"\nProcessed {files_processed} files, changed {files_changed} files")

if __name__ == "__main__":
    main()
