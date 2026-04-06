import os
import re

bizs_path = r'd:\dev\speccrew\ruoyi-vue-pro\speccrew-workspace\knowledges\bizs'
project_root = r'd:\dev\speccrew\ruoyi-vue-pro'

valid_links = 0
invalid_links = 0
na_links = 0
invalid_details = []

# 获取所有 .md 文件
for root, dirs, files in os.walk(bizs_path):
    for file in files:
        if file.endswith('.md'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 提取所有 [text](path) 格式的链接
                pattern = r'\[([^\]]+)\]\(([^)]+)\)'
                matches = re.findall(pattern, content)
                
                for display_name, link_path in matches:
                    if link_path == 'N/A':
                        na_links += 1
                        continue
                    
                    # 解析相对路径
                    file_dir = os.path.dirname(file_path)
                    target_path = os.path.normpath(os.path.join(file_dir, link_path))
                    
                    # 检查文件是否存在
                    exists = os.path.exists(target_path)
                    
                    if exists:
                        valid_links += 1
                    else:
                        invalid_links += 1
                        relative_file = os.path.relpath(file_path, project_root)
                        relative_target = os.path.relpath(target_path, project_root)
                        invalid_details.append({
                            'file': relative_file,
                            'display_name': display_name,
                            'link_path': link_path,
                            'resolved_path': relative_target,
                            'full_target': target_path
                        })
            except Exception as e:
                print(f'Error processing {file_path}: {e}')

print('=' * 80)
print('链接验证统计报告')
print('=' * 80)
print(f'有效链接: {valid_links}')
print(f'无效链接: {invalid_links}')
print(f'N/A链接: {na_links}')
print(f'总链接数: {valid_links + invalid_links + na_links}')
print()

if invalid_details:
    print('=' * 80)
    print(f'无效链接详情 (共 {len(invalid_details)} 个)')
    print('=' * 80)
    
    # 按文件分组
    by_file = {}
    for detail in invalid_details:
        if detail['file'] not in by_file:
            by_file[detail['file']] = []
        by_file[detail['file']].append(detail)
    
    for i, (file_name, links) in enumerate(sorted(by_file.items()), 1):
        print(f'\n{i}. 文件: {file_name}')
        for link in links:
            print(f'   - 显示名: {link[" display_name\]}')
 print(f' 链接路径: {link[\link_path\]}')
 print(f' 解析路径: {link[\resolved_path\]}')

print('\n' + '=' * 80)
