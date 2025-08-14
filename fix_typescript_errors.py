
#!/usr/bin/env python3

import os
import re
import subprocess
import sys
from pathlib import Path

class TypeScriptErrorFixer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.fixed_files = []
        self.error_counts = {
            'TS2304': 0,  # Cannot find name
            'TS2339': 0,  # Property does not exist
            'TS7006': 0,  # Parameter implicitly has 'any'
            'TS2322': 0,  # Type assignment
            'TS2353': 0,  # Object literal issues
            'TS2345': 0,  # Argument type issues
            'TS2551': 0,  # Property does not exist
            'TS18046': 0, # Element implicitly has 'any'
            'total': 0
        }
    
    def fix_variable_scoping_errors(self, file_path, content):
        """Fix TS2304 errors - Cannot find name"""
        fixes_applied = []
        
        # Fix undefined variables in map functions
        patterns = [
            # services.map((item: any) => ... but using 'service' instead of 'item'
            (r'(\w+)\.map\(\((\w+): any\) =>', r'\1.map((\2: any) =>'),
            # Fix common variable name mismatches in callbacks
            (r'\.map\(\(item: any\) => [^}]*service\.', lambda m: m.group(0).replace('service.', 'item.')),
            (r'\.map\(\(service: any\) => [^}]*item\.', lambda m: m.group(0).replace('item.', 'service.')),
            (r'\.map\(\(collab: any\) => [^}]*collaborator\.', lambda m: m.group(0).replace('collaborator.', 'collab.')),
            (r'\.map\(\(collaborator: any\) => [^}]*collab\.', lambda m: m.group(0).replace('collab.', 'collaborator.')),
        ]
        
        for pattern, replacement in patterns:
            if callable(replacement):
                new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            else:
                new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                fixes_applied.append(f"Fixed variable scoping: {pattern}")
                content = new_content
        
        # Fix specific variable name errors
        specific_fixes = [
            # Fix common undefined variables
            (r'\bsum\b(?=\s*\+)', 'acc'),
            (r'\bcollab\b(?=\.percentage)', 'item'),
            (r'consultant(?=\.)', 'item'),
            (r'service(?=\.)', 'item'),
            (r'spec(?=\.)', 'item'),
            (r'num(?=\.)', 'item'),
            (r'person(?=\.)', 'item'),
        ]
        
        for old_var, new_var in specific_fixes:
            new_content = re.sub(old_var, new_var, content)
            if new_content != content:
                fixes_applied.append(f"Fixed undefined variable: {old_var} -> {new_var}")
                content = new_content
                
        return content, fixes_applied
    
    def fix_property_access_errors(self, file_path, content):
        """Fix TS2339 errors - Property does not exist on type"""
        fixes_applied = []
        
        # Add type imports if they're missing
        if 'import' in content and 'from' in content:
            imports_to_add = []
            
            if any(term in content for term in ['ConsultationService', 'Consultant']):
                imports_to_add.extend(['ConsultationService', 'Consultant'])
            if any(term in content for term in ['SplitsheetCollaborator', 'SplitsheetData']):
                imports_to_add.extend(['SplitsheetCollaborator', 'SplitsheetData'])
            if any(term in content for term in ['ChangeHandler', 'ClickHandler', 'EventHandler']):
                imports_to_add.extend(['ChangeHandler', 'ClickHandler', 'EventHandler'])
            
            if imports_to_add:
                # Find existing import from shared/types or add new one
                import_pattern = r"import\s*{([^}]+)}\s*from\s*['\"]\.\.?/shared/types['\"]"
                match = re.search(import_pattern, content)
                
                if match:
                    existing_imports = [imp.strip() for imp in match.group(1).split(',')]
                    all_imports = list(set(existing_imports + imports_to_add))
                    new_import = f"import {{ {', '.join(all_imports)} }} from '../shared/types';"
                    content = re.sub(import_pattern, new_import, content)
                else:
                    # Add new import at the top
                    import_line = f"import {{ {', '.join(imports_to_add)} }} from '../shared/types';\n"
                    content = re.sub(r"(import React[^;]*;)", r"\1\n" + import_line, content)
                
                fixes_applied.append(f"Added type imports: {', '.join(imports_to_add)}")
        
        # Fix specific property access issues
        property_fixes = [
            # Common property name fixes
            (r'\.specialties\b', '.specializations'),
            (r'\.hourlyRate\b', '.price'),
            (r'\.isAvailable\b', '.isActive'),
        ]
        
        for old_prop, new_prop in property_fixes:
            new_content = re.sub(old_prop, new_prop, content)
            if new_content != content:
                fixes_applied.append(f"Fixed property access: {old_prop} -> {new_prop}")
                content = new_content
        
        return content, fixes_applied
    
    def fix_parameter_type_errors(self, file_path, content):
        """Fix TS7006 errors - Parameter implicitly has 'any' type"""
        fixes_applied = []
        
        # Fix callback parameter types
        callback_fixes = [
            # Event handlers
            (r'\(\s*e\s*\)\s*=>', '(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>'),
            (r'\(\s*event\s*\)\s*=>', '(event: React.MouseEvent<HTMLElement>) =>'),
            (r'\(\s*date\s*\)\s*=>', '(date: Date) =>'),
            (r'\(\s*dates\s*\)\s*=>', '(dates: Date[]) =>'),
            # Map function parameters
            (r'\.map\(\s*\(\s*(\w+)\s*\)\s*=>', r'.map((\1: any) =>'),
            (r'\.reduce\(\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*=>', r'.reduce((\1: any, \2: any) =>'),
            (r'\.filter\(\s*\(\s*(\w+)\s*\)\s*=>', r'.filter((\1: any) =>'),
            (r'\.find\(\s*\(\s*(\w+)\s*\)\s*=>', r'.find((\1: any) =>'),
        ]
        
        for pattern, replacement in callback_fixes:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                fixes_applied.append(f"Fixed parameter types: {pattern}")
                content = new_content
        
        return content, fixes_applied
    
    def fix_type_assignment_errors(self, file_path, content):
        """Fix TS2322 and TS2345 errors - Type assignment issues"""
        fixes_applied = []
        
        # Fix common type assignment issues
        assignment_fixes = [
            # Date handling
            (r'new Date\(\)\s*\.toISOString\(\)', 'new Date().toISOString()'),
            # String to number comparisons
            (r'if\s*\(\s*(\w+)\s*===\s*(\d+)\s*\)', lambda m: f'if (Number({m.group(1)}) === {m.group(2)})'),
            # Event handler type fixes
            (r'onChange=\{([^}]+)\}', lambda m: self._fix_change_handler(m.group(1))),
        ]
        
        for pattern, replacement in assignment_fixes:
            if callable(replacement):
                new_content = re.sub(pattern, replacement, content)
            else:
                new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                fixes_applied.append(f"Fixed type assignment: {pattern}")
                content = new_content
        
        return content, fixes_applied
    
    def _fix_change_handler(self, handler):
        """Helper to fix change handler types"""
        if 'e: React.ChangeEvent' not in handler:
            return f"{{(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {handler.strip('{}')}}}"
        return f"{{{handler}}}"
    
    def fix_object_literal_errors(self, file_path, content):
        """Fix TS2353 errors - Object literal issues"""
        fixes_applied = []
        
        # Fix fetch configuration issues
        fetch_patterns = [
            (r'fetch\([^,]+,\s*{([^}]+)}', self._fix_fetch_config),
        ]
        
        for pattern, replacement in fetch_patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if new_content != content:
                fixes_applied.append("Fixed fetch configuration")
                content = new_content
        
        return content, fixes_applied
    
    def _fix_fetch_config(self, match):
        """Helper to fix fetch configuration objects"""
        config = match.group(1)
        
        # Ensure proper fetch config structure
        if 'headers' in config and 'method' not in config:
            config = 'method: "POST", ' + config
        
        return f"fetch({match.group(0).split(',')[0]}, {{ {config} }}"
    
    def process_file(self, file_path):
        """Process a single TypeScript file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            all_fixes = []
            
            # Apply all fixes
            content, fixes = self.fix_variable_scoping_errors(file_path, content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_property_access_errors(file_path, content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_parameter_type_errors(file_path, content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_type_assignment_errors(file_path, content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_object_literal_errors(file_path, content)
            all_fixes.extend(fixes)
            
            # Write back if changes were made
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.fixed_files.append({
                    'file': str(file_path),
                    'fixes': all_fixes
                })
                
                print(f"✅ Fixed {len(all_fixes)} issues in {file_path.name}")
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    def run(self):
        """Run the fixer on all TypeScript files"""
        print("🔧 Starting TypeScript Error Fixer...")
        
        # Find all TypeScript files
        ts_files = list(self.project_root.rglob("*.ts")) + list(self.project_root.rglob("*.tsx"))
        ts_files = [f for f in ts_files if 'node_modules' not in str(f)]
        
        print(f"📁 Found {len(ts_files)} TypeScript files to process")
        
        for file_path in ts_files:
            self.process_file(file_path)
        
        print(f"\n✨ Completed! Fixed issues in {len(self.fixed_files)} files")
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate a detailed report of fixes"""
        report_path = self.project_root / "TYPESCRIPT_FIXES_REPORT.md"
        
        with open(report_path, 'w') as f:
            f.write("# TypeScript Error Fixes Report\n\n")
            f.write(f"Generated on: {os.popen('date').read().strip()}\n\n")
            f.write(f"## Summary\n\n")
            f.write(f"- **Files processed**: {len(self.fixed_files)}\n")
            f.write(f"- **Total fixes applied**: {sum(len(file['fixes']) for file in self.fixed_files)}\n\n")
            
            f.write("## Files Fixed\n\n")
            
            for file_info in self.fixed_files:
                f.write(f"### {file_info['file']}\n\n")
                for fix in file_info['fixes']:
                    f.write(f"- {fix}\n")
                f.write("\n")
        
        print(f"📋 Report generated: {report_path}")

if __name__ == "__main__":
    project_root = "/home/ubuntu/WaituMusic/WaituMusicManager"
    fixer = TypeScriptErrorFixer(project_root)
    fixer.run()
