
#!/usr/bin/env python3

import os
import re
import subprocess
from pathlib import Path

class SyntaxErrorFixer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.fixed_files = []
        
    def get_typescript_errors(self):
        """Get current TypeScript errors"""
        try:
            result = subprocess.run(
                ['npx', 'tsc', '--noEmit'],
                cwd=self.project_root,
                capture_output=True,
                text=True
            )
            return result.stderr.strip().split('\n') if result.stderr.strip() else []
        except Exception as e:
            print(f"Error getting TypeScript errors: {e}")
            return []
    
    def fix_spread_operator_errors(self, file_path, content):
        """Fix TS1005 errors related to spread operators"""
        fixes_applied = []
        
        # Fix malformed spread operators in function calls
        patterns = [
            # Fix requests with malformed spread operators
            (r'(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*as\s+RequestInit\s*\)', r'\1({\2})'),
            
            # Fix spread operators in object literals
            (r'{\s*method:\s*"([^"]+)",\s*([^}]+)\s*}\s*as\s+RequestInit', r'{method: "\1", \2}'),
            
            # Fix malformed onChange handlers
            (r'onChange=\{\s*\(([^)]*)\)\s*=>\s*\{([^}]*)\}\s*\}', r'onChange={(\1) => {\2}}'),
            
            # Fix malformed onClick handlers
            (r'onClick=\{\s*\(([^)]*)\)\s*=>\s*\{([^}]*)\}\s*\}', r'onClick={(\1) => {\2}}'),
            
            # Fix arrow functions with missing parentheses
            (r'=>\s*\{([^}]*)\}\s*as\s+\w+', r'=> {\1}'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if new_content != content:
                fixes_applied.append(f"Fixed spread operator syntax: {pattern}")
                content = new_content
        
        return content, fixes_applied
    
    def fix_parentheses_errors(self, file_path, content):
        """Fix TS1005 errors related to missing parentheses"""
        fixes_applied = []
        
        # Fix common parentheses issues
        patterns = [
            # Fix function calls missing closing parentheses
            (r'(\w+)\s*\(\s*{([^}]+)}\s*$', r'\1({\2})'),
            
            # Fix JSX attribute syntax errors
            (r'(\w+)=\{([^}]+)\s+as\s+\w+\}', r'\1={\2}'),
            
            # Fix conditional expressions in JSX
            (r'{\s*(\w+)\s*\?\s*([^:]+):\s*([^}]+)\s*}', r'{\1 ? \2 : \3}'),
            
            # Fix array method chains
            (r'\.map\s*\(\s*([^)]+)\s*=>\s*$', r'.map((\1) => '),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            if new_content != content:
                fixes_applied.append(f"Fixed parentheses: {pattern}")
                content = new_content
        
        return content, fixes_applied
    
    def fix_object_literal_syntax(self, file_path, content):
        """Fix object literal syntax issues"""
        fixes_applied = []
        
        # Fix object literal spreading issues
        patterns = [
            # Fix RequestInit type issues
            (r'{\s*method:\s*"([^"]+)",\s*headers:\s*({[^}]+})\s*}\s*as\s*RequestInit', 
             r'{ method: "\1", headers: \2 }'),
            
            # Fix React event handler types
            (r'\(e:\s*React\.ChangeEvent<[^>]+>\s*\)\s*=>\s*([^}]+)}', 
             r'(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => \1}'),
            
            # Fix function parameter destructuring
            (r'{\s*([^}]+)\s*}\s*:\s*\{([^}]+)\}', r'{ \1 }: { \2 }'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if new_content != content:
                fixes_applied.append(f"Fixed object literal syntax: {pattern}")
                content = new_content
        
        return content, fixes_applied
    
    def fix_specific_syntax_issues(self, file_path, content):
        """Fix specific syntax issues identified in the errors"""
        fixes_applied = []
        
        # Remove or fix malformed type assertions
        content = re.sub(r'\s*as\s*RequestInit\s*\)', ')', content)
        content = re.sub(r'\s*as\s*ChangeHandler\s*}', '}', content)
        
        # Fix malformed JSX attributes
        content = re.sub(r'(\w+)=\{\s*\([^)]*\)\s*=>\s*([^}]*)\s*}\s*}', r'\1={(\2)}', content)
        
        # Fix incomplete function calls
        content = re.sub(r'(\w+)\s*\(\s*{([^}]+)}\s*$', r'\1({\2})', content, flags=re.MULTILINE)
        
        # Fix spread operator issues
        content = re.sub(r'\.\.\.([^,\s}]+)\s*}', r'...\1}', content)
        
        if content != original_content:
            fixes_applied.append("Fixed specific syntax issues")
        
        return content, fixes_applied
    
    def process_file(self, file_path):
        """Process a single file to fix syntax errors"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            global original_content
            original_content = content
            all_fixes = []
            
            # Apply all syntax fixes
            content, fixes = self.fix_spread_operator_errors(file_path, content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_parentheses_errors(file_path, content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_object_literal_syntax(file_path, content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_specific_syntax_issues(file_path, content)
            all_fixes.extend(fixes)
            
            # Write back if changes were made
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.fixed_files.append({
                    'file': str(file_path),
                    'fixes': all_fixes
                })
                
                print(f"✅ Fixed {len(all_fixes)} syntax issues in {file_path.name}")
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    def get_problematic_files(self):
        """Get list of files with TS1005 errors"""
        errors = self.get_typescript_errors()
        problematic_files = set()
        
        for error in errors:
            if 'error TS1005' in error:
                match = re.match(r'([^(]+)\([^)]+\):', error)
                if match:
                    file_path = self.project_root / match.group(1)
                    if file_path.exists():
                        problematic_files.add(file_path)
        
        return list(problematic_files)
    
    def run(self):
        """Run syntax error fixes on problematic files"""
        print("🔧 Starting Syntax Error Fixer...")
        
        problematic_files = self.get_problematic_files()
        print(f"📁 Found {len(problematic_files)} files with syntax errors")
        
        for file_path in problematic_files:
            self.process_file(file_path)
        
        print(f"\n✨ Completed! Fixed syntax issues in {len(self.fixed_files)} files")
        
        # Generate report
        if self.fixed_files:
            self.generate_report()
    
    def generate_report(self):
        """Generate a detailed report of syntax fixes"""
        report_path = self.project_root / "SYNTAX_FIXES_REPORT.md"
        
        with open(report_path, 'w') as f:
            f.write("# Syntax Error Fixes Report\n\n")
            f.write(f"Generated on: {os.popen('date').read().strip()}\n\n")
            f.write(f"## Summary\n\n")
            f.write(f"- **Files processed**: {len(self.fixed_files)}\n")
            f.write(f"- **Total syntax fixes applied**: {sum(len(file['fixes']) for file in self.fixed_files)}\n\n")
            
            f.write("## Files Fixed\n\n")
            
            for file_info in self.fixed_files:
                f.write(f"### {file_info['file']}\n\n")
                for fix in file_info['fixes']:
                    f.write(f"- {fix}\n")
                f.write("\n")
        
        print(f"📋 Syntax report generated: {report_path}")

if __name__ == "__main__":
    project_root = "/home/ubuntu/WaituMusic/WaituMusicManager"
    fixer = SyntaxErrorFixer(project_root)
    fixer.run()
