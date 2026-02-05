import os

BASE_DIR = r"c:\Users\Usuario\Desktop\PROJETO SAKURA\sakura-presente\frontend\src"
TARGET_STRING = "http://127.0.0.1:8000"

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if TARGET_STRING not in content:
        return

    # Calculate relative import
    rel_path = os.path.relpath(filepath, BASE_DIR)
    depth = len(os.path.dirname(rel_path).split(os.sep))
    if os.path.dirname(rel_path) == "":
        import_stmt = "import API_BASE_URL from './config';\n"
    else:
        # e.g. components/Financeiro.js -> depth 1 -> ../config
        import_stmt = f"import API_BASE_URL from {'../' * depth}config';\n"
    
    lines = content.splitlines()
    
    # Check if already imported
    has_import = any("import API_BASE_URL" in line for line in lines)
    
    new_lines = []
    if not has_import:
        # Add import after the last import
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith("import "):
                last_import_idx = i
        
        if last_import_idx != -1:
            new_lines.extend(lines[:last_import_idx+1])
            new_lines.append(import_stmt.strip())
            new_lines.extend(lines[last_import_idx+1:])
        else:
            new_lines.append(import_stmt.strip())
            new_lines.extend(lines)
    else:
        new_lines = lines

    final_content = "\n".join(new_lines)
    
    # Replace normal strings 'http://...'
    final_content = final_content.replace(f"'{TARGET_STRING}", "`${API_BASE_URL}")
    final_content = final_content.replace(f"\"{TARGET_STRING}", "`${API_BASE_URL}")
    
    # Check for closing quotes to close the backtick correctly if it was a simple string
    # This is tricky with simple replace. 
    # Better approach: 
    # Replace 'http://127.0.0.1:8000/...' with `${API_BASE_URL}/...`
    
    # Heuristic replacement:
    # 1. `http://127.0.0.1:8000 --> `${API_BASE_URL} (this handles existing backticks)
    # 2. 'http://127.0.0.1:8000 --> `${API_BASE_URL} (this changes open quote to backtick)
    
    # We need to handle the closing quote.
    # Ex: axios.get('http://127.0.0.1:8000/api/')  --> axios.get(`${API_BASE_URL}/api/`)
    
    # Let's do line by line replacement to be safer
    fixed_lines = []
    for line in final_content.splitlines():
        if TARGET_STRING in line:
            # Case 1: Template string already
            if f"`{TARGET_STRING}" in line:
                line = line.replace(f"{TARGET_STRING}", "${API_BASE_URL}")
            
            # Case 2: Single quote string
            elif f"'{TARGET_STRING}" in line:
                # Replace start
                line = line.replace(f"'{TARGET_STRING}", "`${API_BASE_URL}")
                # Replace end quote with backtick IF it matches the URL pattern
                # This is hard to guarantee global replace.
                # Let's assume the string ends with '
                # We can replace the next ' with `
                # BUT waiting, if we have 'http://.../api/' + id, it becomes `${API_BASE_URL}/api/` + id 
                # effectively turning it into a template string.
                
                # Simple and robust strategy for this project:
                # Convert ALL occurrences to template literals
                pass
    
    # REWRITE STRATEGY:
    # Just simple replace string literals.
    # We know the codebase uses single quotes mostly.
    
    final_content = final_content.replace(f"'{TARGET_STRING}", "`" + "${API_BASE_URL}")
    # Now we have `http://.../something' 
    # We need to find where the string ends.
    # This script is getting complicated for regex.
    
    # Let's try a simpler replace for the specific pattern we saw in file views.
    # Most are: axios.get('http://127.0.0.1:8000/api/...')
    # We want: axios.get(`${API_BASE_URL}/api/...`)
    
    # If we replace 'http://127.0.0.1:8000 with `${API_BASE_URL}
    # We get: axios.get(`${API_BASE_URL}/api/...')
    # We are left with a trailing ' which should be `
    
    # We can use regex to replace 'http://127.0.0.1:8000([^']*)' with `${API_BASE_URL}\1`
    import re
    
    # Pattern for single quotes
    pattern_sq = re.compile(r"'http://127\.0\.0\.1:8000([^']*)'")
    final_content = pattern_sq.sub(r"`${API_BASE_URL}\1`", final_content)

    # Pattern for double quotes
    pattern_dq = re.compile(r'"http://127\.0\.0\.1:8000([^"]*)"')
    final_content = pattern_dq.sub(r"`${API_BASE_URL}\1`", final_content)

    # Pattern for existing backticks: `http://127.0.0.1:8000...`
    # We just want to replace http://... with ${API_BASE_URL}
    # But wait, inside backticks we need ${}
    pattern_bt = re.compile(r"`http://127\.0\.0\.1:8000([^`]*)`")
    # This is tricky because we don't want to double wrap: `${API_BASE_URL}...` is correct.
    # But if it was `http://127.0.0.1:8000${something}`, the regex matches up to `
    # The regex `http://127\.0\.0\.1:8000 matches literal.
    
    # Just replacing the known prefix inside backticks
    final_content = final_content.replace("`http://127.0.0.1:8000", "`${API_BASE_URL}")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(final_content)
    print(f"Fixed {filepath}")

for root, dirs, files in os.walk(BASE_DIR):
    for name in files:
        if name.endswith(".js"):
            fix_file(os.path.join(root, name))
