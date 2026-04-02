import os

def compare_agents():
    src_path = 'd:/dev/speccrew/.speccrew/agents/'
    tgt_path = 'd:/dev/speccrew/ruoyi-vue-pro/.qoder/agents/'
    
    src_files = {}
    tgt_files = {}
    
    if os.path.isdir(src_path):
        for f in os.listdir(src_path):
            fpath = os.path.join(src_path, f)
            if os.path.isfile(fpath):
                src_files[f] = os.path.getsize(fpath)
    
    if os.path.isdir(tgt_path):
        for f in os.listdir(tgt_path):
            fpath = os.path.join(tgt_path, f)
            if os.path.isfile(fpath):
                tgt_files[f] = os.path.getsize(fpath)
    
    with open('d:/dev/speccrew/sync_report.txt', 'w') as out:
        out.write('AGENTS COMPARISON\n')
        out.write('=' * 80 + '\n')
        fmt = '{:<40} | {:<10} | {:<10} | Status\n'
        out.write(fmt.format('File Name', 'Source', 'Target'))
        out.write('-' * 80 + '\n')
        
        all_files = set(src_files.keys()) | set(tgt_files.keys())
        missing_agent = []
        for fname in sorted(all_files):
            src_size = src_files.get(fname, 'MISSING')
            tgt_size = tgt_files.get(fname, 'MISSING')
            
            if src_size == 'MISSING' and tgt_size != 'MISSING':
                status = 'TARGET_ONLY'
            elif src_size != 'MISSING' and tgt_size == 'MISSING':
                status = 'SRC_ONLY'
                missing_agent.append(fname)
            elif src_size != tgt_size:
                status = 'SIZE_DIFF'
            else:
                status = 'OK'
            
            fmt = '{:<40} | {:<10} | {:<10} | {}\n'
            out.write(fmt.format(fname, str(src_size), str(tgt_size), status))
        
        if missing_agent:
            out.write('\nMISSING in target: ' + str(missing_agent) + '\n')

compare_agents()
