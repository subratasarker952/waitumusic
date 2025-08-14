
#!/usr/bin/env python3

import os
import re
from pathlib import Path

class TargetedSyntaxFixer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.fixed_files = []
    
    def fix_consultation_booking_system(self):
        """Fix specific syntax issues in ConsultationBookingSystem.tsx"""
        file_path = self.project_root / "client/src/components/ConsultationBookingSystem.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix malformed fetch structure - add proper try-catch
        patterns = [
            # Fix incomplete fetch calls
            (r'const response = await fetch\([^;]*;([^}]*})([^}]*)(const result = await response\.json\(\);)', 
             r'const response = await fetch(\1;\2\n      \3'),
             
            # Fix missing try-catch around async operations
            (r'(\s+)(const response = await fetch[^;]+;[^}]*}[^}]*const result = await response\.json\(\);)', 
             r'\1try {\n\1  \2\n\1} catch (error) {\n\1  console.error("Error:", error);\n\1}'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if new_content != content:
                content = new_content
                break
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixed_files.append("ConsultationBookingSystem.tsx - Fixed fetch structure")
    
    def fix_enhanced_splitsheet_manager(self):
        """Fix specific syntax issues in EnhancedSplitsheetManager.tsx"""
        file_path = self.project_root / "client/src/components/EnhancedSplitsheetManager.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix malformed object structure
        patterns = [
            # Fix closing brace/parenthesis mismatch
            (r'studioSessionCode: \'\',\s*\}\)\s*collaboratorCodes:', 
             r'studioSessionCode: \'\',\n      collaboratorCodes:'),
             
            # Fix object literal structure
            (r'projectCode: \'\',\s*studioSessionCode: \'\',\s*\}\)\s*collaboratorCodes: \{\},', 
             r'projectCode: \'\',\n      studioSessionCode: \'\'\n    } as SongCoding,\n    collaboratorCodes: {},'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if new_content != content:
                content = new_content
                break
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixed_files.append("EnhancedSplitsheetManager.tsx - Fixed object structure")
    
    def fix_professional_management_dashboard(self):
        """Fix specific syntax issues in ProfessionalManagementDashboard.tsx"""
        file_path = self.project_root / "client/src/components/ProfessionalManagementDashboard.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix incomplete function calls or missing parentheses
        patterns = [
            # Fix incomplete function calls
            (r'(\w+)\s*\(\s*{\s*([^}]+)\s*$', r'\1({\2})'),
            # Fix missing closing parentheses in JSX
            (r'(\w+)=\{\s*([^}]+)\s*$', r'\1={\2}'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            if new_content != content:
                content = new_content
                break
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixed_files.append("ProfessionalManagementDashboard.tsx - Fixed function calls")
    
    def fix_enhanced_booking_workflow(self):
        """Fix specific syntax issues in EnhancedBookingWorkflow.tsx"""
        file_path = self.project_root / "client/src/components/booking/EnhancedBookingWorkflow.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix import/export issues at the top of file
        patterns = [
            # Fix import statements
            (r'^(\s*)(import\s+[^;]*);?\s*([^i])', r'\1\2;\n\n\3'),
            # Fix export statements
            (r'^(\s*)(export\s+[^;]*);?\s*([^e])', r'\1\2;\n\n\3'),
        ]
        
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            if new_content != content:
                content = new_content
                break
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixed_files.append("EnhancedBookingWorkflow.tsx - Fixed imports/exports")
    
    def fix_general_syntax_issues(self):
        """Fix general syntax issues across multiple files"""
        
        # Get files with TS1128 and TS1005 errors
        result = os.popen(f"cd {self.project_root} && npx tsc --noEmit 2>&1 | grep -E 'error TS1128|error TS1005'").read()
        
        problematic_files = set()
        for line in result.strip().split('\n'):
            if line:
                match = re.match(r'([^(]+)\([^)]+\):', line)
                if match:
                    file_path = self.project_root / match.group(1)
                    if file_path.exists():
                        problematic_files.add(file_path)
        
        for file_path in problematic_files:
            self.fix_specific_file_syntax(file_path)
    
    def fix_specific_file_syntax(self, file_path):
        """Fix syntax issues in a specific file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Common syntax fixes
            fixes_applied = []
            
            # Fix malformed object literals
            content = re.sub(r'(\w+: [^,}]+)\s*}\)\s*(\w+:)', r'\1,\n    \2', content)
            if content != original_content:
                fixes_applied.append("Fixed object literal syntax")
                original_content = content
            
            # Fix missing semicolons after statements
            content = re.sub(r'(}\s*as\s+\w+)\s*([A-Z]\w+)', r'\1;\n  \2', content)
            if content != original_content:
                fixes_applied.append("Fixed missing semicolons")
                original_content = content
            
            # Fix incomplete function calls
            content = re.sub(r'(\w+)\s*\(\s*{\s*([^}]+)\s*$', r'\1({\2})', content, flags=re.MULTILINE)
            if content != original_content:
                fixes_applied.append("Fixed incomplete function calls")
                original_content = content
            
            # Write back if changes were made
            if fixes_applied:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.fixed_files.append(f"{file_path.name} - {', '.join(fixes_applied)}")
                print(f"✅ Fixed {len(fixes_applied)} issues in {file_path.name}")
        
        except Exception as e:
            print(f"❌ Error fixing {file_path}: {e}")
    
    def run(self):
        """Run all targeted fixes"""
        print("🎯 Starting Targeted Syntax Fixer...")
        
        # Fix specific known problematic files
        self.fix_consultation_booking_system()
        self.fix_enhanced_splitsheet_manager()
        self.fix_professional_management_dashboard()
        self.fix_enhanced_booking_workflow()
        
        # Fix other files with general syntax issues
        self.fix_general_syntax_issues()
        
        print(f"\n✅ Applied targeted fixes to {len(self.fixed_files)} files:")
        for fix in self.fixed_files:
            print(f"  • {fix}")

if __name__ == "__main__":
    project_root = "/home/ubuntu/WaituMusic/WaituMusicManager"
    fixer = TargetedSyntaxFixer(project_root)
    fixer.run()
