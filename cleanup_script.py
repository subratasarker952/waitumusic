
#!/usr/bin/env python3
import re
import os
import subprocess
from pathlib import Path

# Get the project root
PROJECT_ROOT = "/home/ubuntu/WaituMusic/WaituMusicManager"
os.chdir(PROJECT_ROOT)

def remove_ai_references():
    """Remove all AI-related code and references"""
    
    # Files to check for AI references
    ai_patterns = [
        r'ai-recommendation[s]?',
        r'aiRecommendation[s]?',
        r'ai_recommendation[s]?',
        r'oppHubAI',
        r'oppHub.*AI',
        r'AI.*recommendation[s]?',
        r'ai_analysis',
        r'ai_verified',
        r'ai_forum_scan',
        r'aiAnalysisDetails',
        r'aiRecommendationFollowed',
        r'aiModelVersion',
        r'aiOptimized',
        r'ai_learning_enhancement',
        r'ai_debugging_methodology'
    ]
    
    # Files to completely remove if they exist
    files_to_remove = [
        'server/ai-recommendations.ts',
        'server/oppHubSocialMediaAI.ts'
    ]
    
    for file_path in files_to_remove:
        full_path = os.path.join(PROJECT_ROOT, file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            print(f"Removed file: {file_path}")
    
    # Find and process files
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Skip node_modules and dist
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Remove import statements related to AI
                    content = re.sub(r'import.*ai-recommendations.*;\n?', '', content)
                    content = re.sub(r'import.*oppHubSocialMediaAI.*;\n?', '', content)
                    
                    # Remove AI-related routes
                    content = re.sub(r"app\.get\('/api/ai-recommendations'.*?}\);", '', content, flags=re.DOTALL)
                    
                    # Remove AI-related object properties
                    content = re.sub(r',?\s*aiRecommendation[s]?:\s*[^,}]+', '', content)
                    content = re.sub(r',?\s*aiOptimized:\s*[^,}]+', '', content)
                    content = re.sub(r',?\s*aiAnalysisDetails:\s*[^,}]+', '', content)
                    content = re.sub(r',?\s*aiRecommendationFollowed:\s*[^,}]+', '', content)
                    content = re.sub(r',?\s*aiModelVersion:\s*[^,}]+', '', content)
                    
                    # Remove AI-related enum values and comments
                    content = re.sub(r"'ai_analysis',?\s*", '', content)
                    content = re.sub(r"'ai_verified',?\s*", '', content)
                    content = re.sub(r"'ai_forum_scan',?\s*", '', content)
                    
                    # Remove AI-related comments
                    content = re.sub(r'//.*AI.*recommendation.*\n', '\n', content, flags=re.IGNORECASE)
                    content = re.sub(r'//.*oppHub.*AI.*\n', '\n', content, flags=re.IGNORECASE)
                    
                    # Clean up empty lines
                    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
                    
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Cleaned AI references from: {os.path.relpath(file_path, PROJECT_ROOT)}")
                
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

def fix_typescript_errors():
    """Fix common TypeScript errors"""
    
    # Common TS7006 fixes (implicit any parameters)
    ts7006_fixes = [
        (r'(\w+)\s*=>\s*{', r'(\1: any) => {'),  # Arrow function parameters
        (r'\.map\((\w+)\s*=>', r'.map((\1: any) =>'),  # Map function parameters
        (r'\.filter\((\w+)\s*=>', r'.filter((\1: any) =>'),  # Filter function parameters  
        (r'\.reduce\((\w+),\s*(\w+)\s*=>', r'.reduce((\1: any, \2: any) =>'),  # Reduce function parameters
        (r'\.forEach\((\w+)\s*=>', r'.forEach((\1: any) =>'),  # forEach function parameters
    ]
    
    # Files with most errors to focus on
    priority_files = [
        'server/routes.ts',
        'server/storage.ts',
        'server/transportationExpenseSystem.ts'
    ]
    
    for file_path in priority_files:
        full_path = os.path.join(PROJECT_ROOT, file_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Apply TS7006 fixes
                for pattern, replacement in ts7006_fixes:
                    content = re.sub(pattern, replacement, content)
                
                # Common TS2345 fixes
                # Fix array type assignments
                content = re.sub(r'(readonly \[[\d,\s]+\])', r'[\1]', content)
                
                # Fix null/undefined checks
                content = re.sub(r'(\w+)\s*\|\|\s*undefined', r'\1', content)
                
                if content != original_content:
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Applied TypeScript fixes to: {file_path}")
            
            except Exception as e:
                print(f"Error fixing TypeScript in {file_path}: {e}")

if __name__ == "__main__":
    print("Starting cleanup process...")
    print("=" * 50)
    
    print("1. Removing AI references...")
    remove_ai_references()
    
    print("\n2. Applying basic TypeScript fixes...")
    fix_typescript_errors()
    
    print("\n3. Checking remaining errors...")
    result = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True, cwd=PROJECT_ROOT)
    if result.returncode != 0:
        error_lines = result.stderr.split('\n')
        ts7006_count = len([line for line in error_lines if 'TS7006' in line])
        ts2345_count = len([line for line in error_lines if 'TS2345' in line])
        print(f"Remaining TS7006 errors: {ts7006_count}")
        print(f"Remaining TS2345 errors: {ts2345_count}")
    else:
        print("All TypeScript errors resolved!")
    
    print("=" * 50)
    print("Cleanup process complete!")
