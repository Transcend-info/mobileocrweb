import re
import os

file_path = r'd:\git\mobileocrweb\index.html'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Regex to match <script>...content...</script> where content starts with let currentImage = null;
# We match <script> followed by whitespace, then let currentImage = null;, then anything until </script>
pattern = re.compile(r'<script>\s+let currentImage = null;.*?</script>', re.DOTALL)

match = pattern.search(content)
if match:
    print(f"Found match from index {match.start()} to {match.end()}")
    new_content = pattern.sub('<script src="js/app.js"></script>', content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated index.html")
else:
    print("Pattern not found in index.html")
    # Print a snippet to help debug
    start_snippet_index = content.find('<script>')
    if start_snippet_index != -1:
        print(f"Snippet around <script>: {repr(content[start_snippet_index:start_snippet_index+50])}")
