content = open('src/styles.css', encoding='utf-8').readlines()
print(f"Total lines: {len(content)}")
print("\n=== AUDIENCE RULES ===")
for i, l in enumerate(content, 1):
    if 'audience' in l.lower():
        print(f'{i}: {l.rstrip()}')

print("\n=== MEDIA QUERY BLOCKS ===")
for i, l in enumerate(content, 1):
    if '@media' in l:
        print(f'{i}: {l.rstrip()}')

print("\n=== GRID-TEMPLATE RULES ===")
for i, l in enumerate(content, 1):
    if 'grid-template-columns' in l and ('audience' in content[max(0,i-5):i+1] or True):
        # show lines with grid-template-columns
        print(f'{i}: {l.rstrip()}')
