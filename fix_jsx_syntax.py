
#!/usr/bin/env python3

import os
import re
from pathlib import Path

class JSXSyntaxFixer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.fixed_files = []
        
    def fix_jsx_attributes(self, content):
        """Fix malformed JSX attributes"""
        fixes_applied = []
        
        # Fix malformed onChange handlers that are missing the attribute name
        # Pattern: {...field} {(e: Event) => handler}  =>  {...field} onChange={(e: Event) => handler}
        pattern1 = re.compile(
            r'(\.\.\.field}\s*)\s*\{\s*\(([^)]+)\)\s*=>\s*([^}]+)\}',
            re.DOTALL
        )
        
        def fix_change_handler(match):
            spread = match.group(1)
            params = match.group(2)
            handler = match.group(3)
            return f"{spread}\n        onChange={{({params}) => {handler}}}"
        
        new_content = pattern1.sub(fix_change_handler, content)
        if new_content != content:
            fixes_applied.append("Fixed missing onChange attribute")
            content = new_content
        
        # Fix malformed request configurations
        # Pattern: { method: "POST", headers: {...} } as RequestInit  => { method: "POST", headers: {...} }
        pattern2 = re.compile(
            r'\{\s*([^}]+)\s*\}\s*as\s*RequestInit\s*\)',
            re.DOTALL
        )
        
        new_content = pattern2.sub(r'{ \1 })', content)
        if new_content != content:
            fixes_applied.append("Fixed RequestInit type assertion")
            content = new_content
            
        # Fix malformed function calls with incomplete parentheses
        # Pattern: someFunction({ ... at end of line  => someFunction({ ... })
        pattern3 = re.compile(
            r'(\w+)\s*\(\s*\{\s*([^}]+)\s*$',
            re.MULTILINE
        )
        
        new_content = pattern3.sub(r'\1({ \2 })', content)
        if new_content != content:
            fixes_applied.append("Fixed incomplete function calls")
            content = new_content
        
        return content, fixes_applied
    
    def fix_spread_operators(self, content):
        """Fix malformed spread operators"""
        fixes_applied = []
        
        # Fix spread operators that are incorrectly formatted
        patterns = [
            # Fix: ...field} { handler }  =>  ...field} handler
            (r'(\.\.\.field}\s*)\s*\{\s*([^}]+)\s*\}', r'\1\n        \2'),
            
            # Fix spread operator syntax in object literals
            (r'\.\.\.([a-zA-Z_][a-zA-Z0-9_]*)\s*}\s*{', r'...\1,'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if new_content != content:
                fixes_applied.append(f"Fixed spread operator syntax: {pattern}")
                content = new_content
        
        return content, fixes_applied
    
    def fix_missing_commas(self, content):
        """Fix missing commas in object literals and function parameters"""
        fixes_applied = []
        
        # Fix missing commas between JSX attributes
        patterns = [
            # Fix: prop1={value1}\n        {handler}  =>  prop1={value1}\n        onChange={handler}
            (r'(\w+=\{[^}]+\})\s*\n\s*\{(\([^)]+\)\s*=>\s*[^}]+)\}', r'\1\n        onChange={\2}'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            if new_content != content:
                fixes_applied.append(f"Fixed missing attributes: {pattern}")
                content = new_content
        
        return content, fixes_applied
    
    def process_file(self, file_path):
        """Process a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            all_fixes = []
            
            # Apply fixes
            content, fixes = self.fix_jsx_attributes(content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_spread_operators(content)
            all_fixes.extend(fixes)
            
            content, fixes = self.fix_missing_commas(content)
            all_fixes.extend(fixes)
            
            # Write back if changes were made
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.fixed_files.append({
                    'file': str(file_path),
                    'fixes': all_fixes
                })
                
                print(f"✅ Fixed {len(all_fixes)} JSX issues in {file_path.name}")
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    def run(self):
        """Run the JSX syntax fixer"""
        print("🔧 Starting JSX Syntax Fixer...")
        
        # Get files with TS1005 errors
        problematic_files = [
            "client/src/components/AuthenticSplitsheetForm.tsx",
            "client/src/components/BookingAttachmentSystem.tsx",
            "client/src/components/ComprehensiveAdminPanel.tsx",
            "client/src/components/ConsultationBookingSystem.tsx",
            "client/src/components/ContractManager.tsx",
        ]
        
        for file_rel_path in problematic_files:
            file_path = self.project_root / file_rel_path
            if file_path.exists():
                self.process_file(file_path)
        
        # Process all TSX files that might have similar issues
        tsx_files = list(self.project_root.rglob("*.tsx"))
        tsx_files = [f for f in tsx_files if 'node_modules' not in str(f)]
        
        for file_path in tsx_files:
            if str(file_path) not in [str(self.project_root / p) for p in problematic_files]:
                self.process_file(file_path)
        
        print(f"\n✨ Completed! Fixed JSX syntax issues in {len(self.fixed_files)} files")

if __name__ == "__main__":
    project_root = "/home/ubuntu/WaituMusic/WaituMusicManager"
    fixer = JSXSyntaxFixer(project_root)
    fixer.run()
