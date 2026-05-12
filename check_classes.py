import re

# Read JSX and extract all classNames
with open('src/App.jsx', encoding='utf-8') as f:
    jsx = f.read()

# Extract all className values
jsx_classes_raw = re.findall(r'className="([^"]+)"', jsx)
all_jsx = set()
for c in jsx_classes_raw:
    for cls in c.split():
        all_jsx.add(cls.strip())

# Read CSS and extract all class selectors
with open('src/styles.css', encoding='utf-8') as f:
    css = f.read()

css_classes = set(re.findall(r'\.([\w-]+)\s*[{:,]', css))

# Missing from CSS
missing = all_jsx - css_classes
print('=== CLASSES USED IN JSX BUT MISSING IN CSS ===')
for c in sorted(missing):
    print(f'  .{c}')

print(f'\nTotal JSX classes: {len(all_jsx)}')
print(f'Total CSS classes: {len(css_classes)}')
print(f'Missing: {len(missing)}')

# Also check for duplicate @media blocks that might conflict
print('\n=== MEDIA QUERY POSITIONS ===')
for i, line in enumerate(css.split('\n'), 1):
    if '@media' in line:
        print(f'  Line {i}: {line.strip()}')

# Check for mixed CRLF/LF endings
with open('src/styles.css', 'rb') as f:
    raw = f.read()
crlf_count = raw.count(b'\r\n')
lf_count = raw.count(b'\n') - crlf_count
print(f'\n=== LINE ENDINGS ===')
print(f'  CRLF (Windows): {crlf_count}')
print(f'  LF (Unix): {lf_count}')
print(f'  MIXED: {crlf_count > 0 and lf_count > 0}')
