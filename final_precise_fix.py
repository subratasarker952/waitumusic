
#!/usr/bin/env python3

import os
import re
from pathlib import Path

class PreciseFixer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.fixed_files = []
    
    def fix_consultation_booking_system_specific(self):
        """Fix specific malformed JSON.stringify call"""
        file_path = self.project_root / "client/src/components/ConsultationBookingSystem.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix the specific malformed JSON.stringify call
        malformed_pattern = r'body: JSON\.stringify\(\{\.\.\.bookingData,\s*serviceType: selectedService\.name,\}\)\s*duration: selectedService\.duration \}\)\s*\}\)'
        
        # Replace with correctly structured JSON
        correct_replacement = '''body: JSON.stringify({
          ...bookingData,
          serviceType: selectedService.name,
          duration: selectedService.duration
        })'''
        
        new_content = re.sub(malformed_pattern, correct_replacement, content, flags=re.DOTALL)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            self.fixed_files.append("ConsultationBookingSystem.tsx - Fixed JSON.stringify syntax")
            return True
        
        return False
    
    def fix_enhanced_splitsheet_manager_specific(self):
        """Fix specific object structure in EnhancedSplitsheetManager"""
        file_path = self.project_root / "client/src/components/EnhancedSplitsheetManager.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for the malformed object structure around line 66
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if 'projectCode:' in line and 'studioSessionCode:' in line and '})' in line:
                # Found the malformed line, fix it
                if i < len(lines) - 1:
                    lines[i] = '      projectCode: \'\','
                    lines[i + 1] = '      studioSessionCode: \'\''
                    lines[i + 2] = '    } as SongCoding,'
                    
                    new_content = '\n'.join(lines)
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    self.fixed_files.append("EnhancedSplitsheetManager.tsx - Fixed object structure")
                    return True
        
        return False
    
    def run(self):
        """Run precise fixes for known issues"""
        print("🎯 Starting Precise TypeScript Fixer...")
        
        # Apply only very specific, known fixes
        fixed_count = 0
        
        if self.fix_consultation_booking_system_specific():
            fixed_count += 1
        
        if self.fix_enhanced_splitsheet_manager_specific():
            fixed_count += 1
        
        print(f"\n✅ Applied {fixed_count} precise fixes:")
        for fix in self.fixed_files:
            print(f"  • {fix}")
        
        # Check current error count
        print("\n📊 Checking current TypeScript error count...")
        result = os.popen(f"cd {self.project_root} && npx tsc --noEmit 2>&1 | wc -l").read().strip()
        print(f"Current error count: {result}")

if __name__ == "__main__":
    project_root = "/home/ubuntu/WaituMusic/WaituMusicManager"
    fixer = PreciseFixer(project_root)
    fixer.run()
