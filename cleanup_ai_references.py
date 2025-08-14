#!/usr/bin/env python3
import os
import re
from pathlib import Path

def replace_ai_terms(content):
    """Replace AI-related terms with non-AI alternatives"""
    replacements = [
        (r'OpenAI', 'DataAPI'),
        (r'ChatGPT', 'DataChat'),
        (r'GPT-\d+', 'DataModel'),
        (r'artificial intelligence', 'data analytics'),
        (r'AI assistant', 'data assistant'),
        (r'AI-powered', 'data-driven'),
        (r'AI system', 'analytics system'),
        (r'AI guidance', 'data guidance'),
        (r'AI forecasting', 'data forecasting'),
        (r'AI recommendations', 'data recommendations'),
        (r'AI processing', 'data processing'),
        (r'AI analysis', 'data analysis'),
        (r'AI scanner', 'data scanner'),
        (r'machine learning', 'data analytics'),
        (r'neural network', 'data network'),
        (r'ML model', 'analytics model'),
        (r'\bAI\b', 'Analytics'),
        (r'artificialIntelligence', 'dataAnalytics'),
        (r'aiPowered', 'dataDriven'),
        (r'aiSystem', 'analyticsSystem')
    ]
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    
    return content

def clean_file(file_path):
    """Clean AI references from a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        cleaned_content = replace_ai_terms(content)
        
        if cleaned_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            print(f"✅ Cleaned: {file_path}")
            return True
        else:
            print(f"✓ No changes needed: {file_path}")
            return False
    except Exception as e:
        print(f"❌ Error cleaning {file_path}: {e}")
        return False

def main():
    """Main cleanup function"""
    extensions = ['.ts', '.tsx', '.js', '.jsx']
    exclude_dirs = {'node_modules', 'dist', '.git'}
    
    files_to_clean = []
    
    for root, dirs, files in os.walk('.'):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                files_to_clean.append(file_path)
    
    print(f"Found {len(files_to_clean)} files to scan...")
    cleaned_count = 0
    
    for file_path in files_to_clean:
        if clean_file(file_path):
            cleaned_count += 1
    
    print(f"\n🎉 Cleanup complete! Modified {cleaned_count} files.")

if __name__ == '__main__':
    main()
