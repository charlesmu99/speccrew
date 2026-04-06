import os
import re

bizs_path = r'd:\dev\speccrew\ruoyi-vue-pro\speccrew-workspace\knowledges\bizs'
project_root = r'd:\dev\speccrew\ruoyi-vue-pro'

valid_links = 0
invalid_links = 0
na_links = 0
invalid_details = []

for root, dirs, files in os.walk(bizs_path):
    for file in files:
        if file.endswith('.md'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                pattern = r'\[([^\]]+)\]\(([^)]+)\)'
                matches = re.findall(pattern, content)
                
                for display_name, link_path in matches:
                    if link_path == 'N/A':
                        na_links += 1
                        continue
                    
                    file_dir = os.path.dirname(file_path)
                    target_path = os.path.join(file_dir, link_path)
                    target_path = os.path.normpath(target_path)
                    
                    if os.path.exists(target_path):
                        valid_links += 1
                    else:
                        invalid_links += 1
                        relative_file = os.path.relpath(file_path, project_root)
                        relative_target = os.path.relpath(target_path, project_root)
                        invalid_details.append({
                            'file': relative_file,
                            'display': display_name,
                            'link': link_path,
                            'resolved': relative_target
                        })
            except Exception as e:
                print(f'Error: {file_path}: {e}')

print('=' * 80)
print('LINK VALIDATION REPORT')
print('=' * 80)
print(f'Valid Links: {valid_links}')
print(f'Invalid Links: {invalid_links}')
print(f'N/A Links: {na_links}')
print(f'Total: {valid_links + invalid_links + na_links}')
print()
print('First 30 Invalid Links:')
print('=' * 80)

for i, detail in enumerate(invalid_details[:30], 1):
    print(f'{i}. File: {detail[" file\]}')
 print(f' Display: {detail[\display\]}')
 print(f' Link: {detail[\link\]}')
 print()
