import os
import re

BASE_DIR = r"c:\Users\Usuario\Desktop\PROJETO SAKURA\sakura-presente\frontend\src"

def repair_file(filepath):
    # Skip config.js as we fixed it manually
    if "config.js" in filepath:
        return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    # 1. Fix broken imports: import ... from ../config'; -> from '../config';
    # Regex look for: from ([^']*)config';
    # We want to ensure it creates from '$1config';
    # But wait, the previous script might have produced: from ../config';
    # Pattern: from ([\.\/]+)config';
    
    content = re.sub(r"from ([\.\/]+)config';", r"from '\1config';", content)
    
    # 2. Fix mismatched quotes in template literals
    # Pattern: `${API_BASE_URL} ... ',
    # We want: `${API_BASE_URL} ... `,
    # Look for: (`\$\{API_BASE_URL\}[^`]*?)'
    # Replace with: \1`
    
    content = re.sub(r"(`\$\{API_BASE_URL\}[^`]*?)'", r"\1`", content)
    
    # 3. Check for double backticks or other artifacts
    # Previous script might have done ``${API_BASE_URL}...`` if it replaced inside backticks
    # Pattern: ``${API_BASE_URL}
    content = content.replace("``${API_BASE_URL}", "`${API_BASE_URL}")
    
    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Repaired {filepath}")

for root, dirs, files in os.walk(BASE_DIR):
    for name in files:
        if name.endswith(".js"):
            repair_file(os.path.join(root, name))
