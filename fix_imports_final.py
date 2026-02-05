import os

BASE_DIR = r"c:\Users\Usuario\Desktop\PROJETO SAKURA\sakura-presente\frontend\src"

def fix_file(filepath):
    if "config.js" in filepath:
        return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    # Explicit string replacements for the known bad patterns
    # The bad pattern is: from ../config'; or from ../../config';
    # We want: from '../config'; or from '../../config';

    # Replace depth 1
    content = content.replace("from ../config';", "from '../config';")
    
    # Replace depth 2
    content = content.replace("from ../../config';", "from '../../config';")

    # Replace depth 3 (just in case)
    content = content.replace("from ../../../config';", "from '../../../config';")

    # Also check if there are any that got double quoted by mistake later?
    # Unlikely based on previous scripts.

    # Also check for the template literal issue: `${API_BASE_URL} ... ',
    # If previous script failed, it might still be there.
    # Pattern: `${API_BASE_URL}...',
    import re
    # Look for lines ending with ', where the line contains `${API_BASE_URL} and does NOT start with `
    # Actually just replacing ' with ` if the string starts with `${API_BASE_URL}
    
    lines = content.splitlines()
    new_lines = []
    for line in lines:
        if "`${API_BASE_URL}" in line and line.strip().endswith("',"):
            # axios.get(`${API_BASE_URL}...',
            line = line.replace("',", "`,")
        elif "`${API_BASE_URL}" in line and line.strip().endswith("'"):
             # axios.get(`${API_BASE_URL}...')
            line = line[:-1] + "`" # Replace last char
        elif "`${API_BASE_URL}" in line and line.strip().endswith("');"):
            # const x = ...
            line = line.replace("');", "`);")
        elif "`${API_BASE_URL}" in line and line.strip().endswith("')"):
            # inside function call
            line = line.replace("')", "`)")
            
        new_lines.append(line)
    
    content = "\n".join(new_lines)

    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk(BASE_DIR):
    for name in files:
        if name.endswith(".js"):
            fix_file(os.path.join(root, name))
