
#!/usr/bin/env python3

import os
import re
from pathlib import Path

class CarefulFixer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.backup_dir = self.project_root / "backups"
        self.fixed_files = []
        
    def backup_and_restore(self):
        """Create a clean restore point"""
        # Let's restore from git if available, or just revert specific problematic changes
        print("Reverting problematic changes...")
        
        # Find files with TS1128 errors (Declaration or statement expected)
        result = os.popen(f"cd {self.project_root} && npx tsc --noEmit 2>&1 | grep 'error TS1128'").read()
        
        problematic_files = set()
        for line in result.strip().split('\n'):
            if line:
                match = re.match(r'([^(]+)\([^)]+\):', line)
                if match:
                    problematic_files.add(match.group(1))
        
        return list(problematic_files)
    
    def minimal_fix_approach(self):
        """Apply only the most essential fixes without breaking syntax"""
        
        # Instead of mass-fixing, let's target only the original problematic files
        essential_fixes = {
            "client/src/components/ConsultationBookingSystem.tsx": [
                # Fix the specific variable scoping issue
                (r'services\.map\(\(item: any\) => \(\s*<Card[^>]*\s+key=\{service\.id\}', 
                 r'services.map((service: any) => (\n        <Card\n          key={service.id}'),
                 
                # Fix consultant mapping
                (r'consultants\.map\(\(item: any\) =>', r'consultants.map((consultant: any) =>'),
            ],
            
            "client/src/components/EnhancedSplitsheetManager.tsx": [
                # Fix the reduce callback
                (r'\.reduce\(\([^)]*\) => sum \+ collab\.percentage', 
                 r'.reduce((acc: number, collab: any) => acc + collab.percentage'),
            ],
            
            "client/src/components/BookingCalendar.tsx": [
                # Fix date selection
                (r'onDateSelect\(\[date\]\)', r'onDateSelect(date ? [date] : [])'),
            ],
            
            "client/src/components/CartButton.tsx": [
                # Fix comparison
                (r'if\s*\(\s*(\w+)\s*===\s*(\d+)\s*\)', r'if (Number(\1) === \2)'),
            ],
        }
        
        for file_path, fixes in essential_fixes.items():
            full_path = self.project_root / file_path
            if full_path.exists():
                self.apply_careful_fixes(full_path, fixes)
    
    def apply_careful_fixes(self, file_path, fixes):
        """Apply fixes carefully to a specific file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            applied_fixes = []
            
            for pattern, replacement in fixes:
                new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
                if new_content != content:
                    applied_fixes.append(f"Applied: {pattern}")
                    content = new_content
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Carefully fixed {file_path.name}: {len(applied_fixes)} fixes")
                self.fixed_files.append({
                    'file': str(file_path),
                    'fixes': applied_fixes
                })
        
        except Exception as e:
            print(f"❌ Error fixing {file_path}: {e}")
    
    def run(self):
        """Run the careful fixer"""
        print("🔧 Starting Careful TypeScript Fixer...")
        
        # Apply minimal essential fixes
        self.minimal_fix_approach()
        
        print(f"\n✨ Carefully applied fixes to {len(self.fixed_files)} files")
        for file_info in self.fixed_files:
            print(f"  • {file_info['file']}")

if __name__ == "__main__":
    project_root = "/home/ubuntu/WaituMusic/WaituMusicManager"
    fixer = CarefulFixer(project_root)
    fixer.run()
