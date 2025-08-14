
#!/usr/bin/env python3

import os
import re
from pathlib import Path

class SpecificErrorFixer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.fixes_applied = []
    
    def fix_consultation_booking_system(self):
        """Fix specific issues in ConsultationBookingSystem.tsx"""
        file_path = self.project_root / "client/src/components/ConsultationBookingSystem.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix the main mapping issue where 'service' is used instead of 'item'
        content = re.sub(
            r'services\.map\(\(item: any\) => \(\s*<Card[^>]*\s+key=\{service\.id\}',
            r'services.map((service: ConsultationService) => (\n        <Card\n          key={service.id}',
            content,
            flags=re.DOTALL
        )
        
        # Fix all instances of 'service' to use proper variable name
        content = re.sub(
            r'onClick=\{\(\) => handleServiceSelect\(service\)\}',
            r'onClick={() => handleServiceSelect(service)}',
            content
        )
        
        # Fix consultant mapping issues
        content = re.sub(
            r'consultants\.map\(\([^)]*\) => \([^}]*consultant\.',
            lambda m: m.group(0).replace('consultant.', 'item.'),
            content,
            flags=re.DOTALL
        )
        
        # Fix specific undefined variables
        replacements = [
            (r'\bconsultant\.', 'item.'),
            (r'\bservice\.', 'service.'),  # Keep service as service in service context
            (r'\bspec\.', 'item.'),
            (r'\bnum\.', 'item.'),
        ]
        
        for old, new in replacements:
            content = re.sub(old, new, content)
        
        # Fix event handler types
        content = re.sub(
            r'onChange=\{([^}]+)\}',
            lambda m: f"onChange={{(e: ChangeHandler) => {m.group(1).replace('e', 'e')}}}" if 'e:' not in m.group(1) else m.group(0),
            content
        )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append(f"Fixed ConsultationBookingSystem.tsx - variable scoping and type issues")
    
    def fix_enhanced_splitsheet_manager(self):
        """Fix specific issues in EnhancedSplitsheetManager.tsx"""
        file_path = self.project_root / "client/src/components/EnhancedSplitsheetManager.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix the reduce callback issue
        content = re.sub(
            r'\.reduce\(\([^)]*\) => sum \+ collab\.percentage',
            r'.reduce((acc: number, item: SplitsheetCollaborator) => acc + item.percentage',
            content
        )
        
        # Fix other similar patterns
        content = re.sub(
            r'\.reduce\(\([^)]*\) => person\.percentage',
            r'.reduce((acc: number, person: SplitsheetCollaborator) => acc + person.percentage',
            content
        )
        
        # Fix collaborator access
        content = re.sub(r'\bcollaborator\.', 'item.', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append(f"Fixed EnhancedSplitsheetManager.tsx - reduce callback and variable scoping")
    
    def fix_booking_calendar(self):
        """Fix specific issues in BookingCalendar.tsx"""
        file_path = self.project_root / "client/src/components/BookingCalendar.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix the onDateSelect handler type mismatch
        content = re.sub(
            r'onSelect=\{([^}]+)\}',
            r'onSelect={(date: Date | undefined) => \1(date ? [date] : [])}',
            content
        )
        
        # Fix parameter types in callbacks
        content = re.sub(
            r'\(date\) =>',
            r'(date: Date) =>',
            content
        )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append(f"Fixed BookingCalendar.tsx - date selection handler types")
    
    def fix_cart_button(self):
        """Fix specific issues in CartButton.tsx"""
        file_path = self.project_root / "client/src/components/CartButton.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix string vs number comparison
        content = re.sub(
            r'if\s*\(\s*(\w+)\s*===\s*(\d+)\s*\)',
            r'if (String(\1) === "\2" || Number(\1) === \2)',
            content
        )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append(f"Fixed CartButton.tsx - string/number comparison")
    
    def fix_comprehensive_admin_panel(self):
        """Fix specific issues in ComprehensiveAdminPanel.tsx"""
        file_path = self.project_root / "client/src/components/ComprehensiveAdminPanel.tsx"
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix fetch configuration object literal issues
        content = re.sub(
            r'fetch\([^,]+,\s*{\s*headers:\s*{[^}]+}\s*}\)',
            lambda m: m.group(0).replace('{', '{ method: "POST", ').replace('})', '} as RequestInit)'),
            content
        )
        
        # More specific fix for headers in fetch
        content = re.sub(
            r'{\s*headers:\s*({[^}]+})\s*}',
            r'{ method: "POST", headers: \1 } as RequestInit',
            content
        )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append(f"Fixed ComprehensiveAdminPanel.tsx - fetch configuration objects")
    
    def add_missing_imports(self):
        """Add missing type imports to files that need them"""
        files_to_check = [
            "client/src/components/ConsultationBookingSystem.tsx",
            "client/src/components/EnhancedSplitsheetManager.tsx",
            "client/src/components/BookingCalendar.tsx",
            "client/src/components/CartButton.tsx",
            "client/src/components/ComprehensiveAdminPanel.tsx",
        ]
        
        for file_rel_path in files_to_check:
            file_path = self.project_root / file_rel_path
            if not file_path.exists():
                continue
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Determine what types are needed
            needed_types = []
            
            if 'ConsultationService' in content or 'Consultant' in content:
                needed_types.extend(['ConsultationService', 'Consultant'])
            if 'SplitsheetCollaborator' in content or 'SplitsheetData' in content:
                needed_types.extend(['SplitsheetCollaborator', 'SplitsheetData'])
            if 'ChangeHandler' in content or 'ClickHandler' in content:
                needed_types.extend(['ChangeHandler', 'ClickHandler'])
            
            if needed_types:
                # Check if there's already an import from shared/types
                types_import_pattern = r"import\s*{([^}]+)}\s*from\s*['\"]\.\.?/?\.\.?/?shared/types['\"]"
                match = re.search(types_import_pattern, content)
                
                if match:
                    existing_imports = [imp.strip() for imp in match.group(1).split(',')]
                    all_imports = list(set(existing_imports + needed_types))
                    new_import = f"import {{ {', '.join(sorted(all_imports))} }} from '../../shared/types';"
                    content = re.sub(types_import_pattern, new_import, content)
                else:
                    # Add new import after existing imports
                    import_insertion_point = re.search(r"(import [^;]+;)\n", content)
                    if import_insertion_point:
                        new_import = f"import {{ {', '.join(sorted(needed_types))} }} from '../../shared/types';\n"
                        content = content[:import_insertion_point.end()] + new_import + content[import_insertion_point.end():]
                
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.fixes_applied.append(f"Added type imports to {file_path.name}: {', '.join(needed_types)}")
    
    def run(self):
        """Run all specific fixes"""
        print("🎯 Starting Specific Error Fixes...")
        
        self.add_missing_imports()
        self.fix_consultation_booking_system()
        self.fix_enhanced_splitsheet_manager()
        self.fix_booking_calendar()
        self.fix_cart_button()
        self.fix_comprehensive_admin_panel()
        
        print(f"\n✅ Applied {len(self.fixes_applied)} specific fixes:")
        for fix in self.fixes_applied:
            print(f"  • {fix}")

if __name__ == "__main__":
    project_root = "/home/ubuntu/WaituMusic/WaituMusicManager"
    fixer = SpecificErrorFixer(project_root)
    fixer.run()
