
#!/usr/bin/env python3
import re

def fix_contract_routes():
    file_path = '/home/ubuntu/WaituMusic/WaituMusicManager/server/routes/contractRoutes.ts'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix missing property names before arrays
        # Pattern: complianceScore: number,\n      'string',\n      'string'\n    ],
        pattern = r"(complianceScore: \d+,)\s*\n\s*('[^']*',?\s*\n\s*)+\s*\],"
        
        def replace_func(match):
            matched_text = match.group(0)
            # Replace the pattern with proper recommendations array
            fixed = re.sub(
                r"(complianceScore: \d+,)\s*\n(\s*)('[^']*'[,\s\n]*)+(\s*\],)",
                r"\1\n\2recommendations: [\n\2  \3\n\2],",
                matched_text
            )
            return fixed
        
        # Apply fixes
        content = re.sub(pattern, replace_func, content, flags=re.MULTILINE | re.DOTALL)
        
        # Also fix any standalone arrays that might have been missed
        content = re.sub(
            r"(complianceScore: \d+,)\s*\n\s*('[^']*',?\s*\n\s*'[^']*'[,]?\s*\n\s*)\],",
            r"\1\n    recommendations: [\n      \2\n    ],",
            content,
            flags=re.MULTILINE
        )
        
        # Clean up any double recommendations
        content = re.sub(
            r"recommendations: \[\s*\n\s*recommendations: \[",
            "recommendations: [",
            content
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("Fixed contractRoutes.ts")
        
    except Exception as e:
        print(f"Error fixing contractRoutes.ts: {e}")

if __name__ == "__main__":
    fix_contract_routes()
