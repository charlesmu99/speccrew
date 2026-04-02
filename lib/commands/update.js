const fs = require('fs');
const path = require('path');
const {
  isSpeccrewFile,
  readSpeccrewRC,
  writeSpeccrewRC,
  getPackageVersion,
  getSourceRoot,
  getWorkspaceTemplatePath,
  copyDirRecursive,
} = require('../utils');
const { resolveIDE, getIDEConfig } = require('../ide-adapters');

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  let ide = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ide' && i + 1 < args.length) {
      ide = args[i + 1];
      i++;
    }
  }
  
  return { ide };
}

// 递归获取目录下所有文件（相对路径）
function getAllFiles(dir, baseDir = dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, baseDir, result);
    } else {
      result.push(relPath);
    }
  }
  return result;
}

// 递归获取目录下所有子目录（相对路径）
function getAllDirs(dir, baseDir = dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      result.push(relPath);
      getAllDirs(fullPath, baseDir, result);
    }
  }
  return result;
}

// 复制文件并返回是否实际复制（目标不存在或内容不同）
function copyFileIfChanged(src, dest) {
  if (!fs.existsSync(src)) return { copied: false, isNew: false };
  
  const destExists = fs.existsSync(dest);
  if (!destExists) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return { copied: true, isNew: true };
  }
  
  // 比较文件内容
  const srcContent = fs.readFileSync(src);
  const destContent = fs.readFileSync(dest);
  if (srcContent.equals(destContent)) {
    return { copied: false, isNew: false };
  }
  
  fs.copyFileSync(src, dest);
  return { copied: true, isNew: false };
}

// 更新 agents 目录
function updateAgents(srcDir, destDir, stats) {
  if (!fs.existsSync(srcDir)) return;
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!isSpeccrewFile(entry.name)) continue;
    
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    const result = copyFileIfChanged(srcPath, destPath);
    if (result.isNew) {
      stats.added++;
    } else if (result.copied) {
      stats.updated++;
    }
  }
  
  // 检测目标目录中多余的 speccrew-* 文件
  if (fs.existsSync(destDir)) {
    const destEntries = fs.readdirSync(destDir, { withFileTypes: true });
    for (const entry of destEntries) {
      if (!entry.isFile()) continue;
      if (!isSpeccrewFile(entry.name)) continue;
      
      const srcPath = path.join(srcDir, entry.name);
      if (!fs.existsSync(srcPath)) {
        stats.extra.push(entry.name);
      }
    }
  }
}

// 递归更新 skills 目录
function updateSkillsRecursive(srcDir, destDir, stats, currentRelPath = '') {
  if (!fs.existsSync(srcDir)) return;
  
  // 确保目标目录存在
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const relPath = currentRelPath ? path.join(currentRelPath, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      // 只处理 speccrew-* 前缀的目录
      if (!isSpeccrewFile(entry.name)) continue;
      
      const dirStats = { added: 0, updated: 0 };
      updateSkillsRecursive(srcPath, destPath, stats, relPath);
    } else {
      // 在 speccrew-* 目录下的文件
      // 检查是否在 speccrew-* 父目录下
      const parentDir = path.basename(srcDir);
      if (!isSpeccrewFile(parentDir)) continue;
      
      const result = copyFileIfChanged(srcPath, destPath);
      if (result.isNew) {
        stats.added++;
      } else if (result.copied) {
        stats.updated++;
      }
    }
  }
  
  // 检测目标目录中多余的 speccrew-* 目录或文件
  if (fs.existsSync(destDir)) {
    const parentDir = path.basename(srcDir);
    const inSpeccrewDir = isSpeccrewFile(parentDir);
    
    const destEntries = fs.readdirSync(destDir, { withFileTypes: true });
    for (const entry of destEntries) {
      if (!isSpeccrewFile(entry.name)) continue;
      
      const srcPath = path.join(srcDir, entry.name);
      if (!fs.existsSync(srcPath)) {
        const extraPath = currentRelPath ? path.join(currentRelPath, entry.name) : entry.name;
        if (entry.isDirectory()) {
          stats.extraDirs.push(extraPath);
        } else if (inSpeccrewDir) {
          stats.extra.push(extraPath);
        }
      }
    }
  }
}

// 更新 skills 目录（入口）
function updateSkills(srcDir, destDir, stats) {
  if (!fs.existsSync(srcDir)) return;
  
  // 确保目标目录存在
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  // 遍历源目录中的 speccrew-* 技能目录
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!isSpeccrewFile(entry.name)) continue;
    
    const srcSkillDir = path.join(srcDir, entry.name);
    const destSkillDir = path.join(destDir, entry.name);
    
    // 检查是否是新增的技能
    const isNewSkill = !fs.existsSync(destSkillDir);
    
    // 递归复制技能目录
    const skillStats = { added: 0, updated: 0, extra: [], extraDirs: [] };
    updateSkillsRecursive(srcSkillDir, destSkillDir, skillStats, entry.name);
    
    if (isNewSkill) {
      // 如果是全新技能，计算文件数量作为 added
      const files = getAllFiles(destSkillDir);
      stats.added += files.length;
    } else {
      stats.added += skillStats.added;
      stats.updated += skillStats.updated;
    }
    
    stats.extra.push(...skillStats.extra);
    stats.extraDirs.push(...skillStats.extraDirs);
  }
  
  // 检测目标目录中多余的 speccrew-* 技能目录
  const destEntries = fs.readdirSync(destDir, { withFileTypes: true });
  for (const entry of destEntries) {
    if (!entry.isDirectory()) continue;
    if (!isSpeccrewFile(entry.name)) continue;
    
    const srcSkillDir = path.join(srcDir, entry.name);
    if (!fs.existsSync(srcSkillDir)) {
      stats.extraDirs.push(entry.name);
    }
  }
}

// 更新 workspace docs
function updateWorkspaceDocs(srcDir, destDir, stats) {
  if (!fs.existsSync(srcDir)) return;
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      const subStats = { updated: 0 };
      updateWorkspaceDocs(srcPath, destPath, subStats);
      stats.updated += subStats.updated;
    } else {
      const result = copyFileIfChanged(srcPath, destPath);
      if (result.copied || result.isNew) {
        stats.updated++;
      }
    }
  }
}

// 主函数
function run() {
  try {
    const args = parseArgs();
    const projectRoot = process.cwd();
    
    // 读取 .speccrewrc
    const rc = readSpeccrewRC(projectRoot);
    if (!rc) {
      console.error('Error: .speccrewrc not found. Please run "speccrew init" first.');
      process.exit(1);
    }
    
    // 获取版本信息
    const currentVersion = getPackageVersion();
    const installedVersion = rc.version || 'unknown';
    
    // 解析 IDE 列表
    let ides;
    if (args.ide) {
      ides = [getIDEConfig(args.ide)];
    } else if (rc.ide) {
      const ideIds = Array.isArray(rc.ide) ? rc.ide : [rc.ide];
      ides = ideIds.map(id => getIDEConfig(id));
    } else {
      console.error('Error: No IDE specified. Use --ide <name> or set in .speccrewrc');
      process.exit(1);
    }
    
    const sourceRoot = getSourceRoot();
    const workspaceTemplatePath = getWorkspaceTemplatePath();
    
    // 统计信息
    const totalStats = {
      agents: { updated: 0, added: 0 },
      skills: { updated: 0, added: 0 },
      workspaceDocs: { updated: 0 },
      extra: [],
      extraDirs: [],
    };
    
    // 对每个 IDE 执行更新
    for (const ide of ides) {
      // 更新 agents
      const srcAgentsDir = path.join(sourceRoot, ide.id, 'agents');
      const destAgentsDir = path.join(projectRoot, ide.agentsDir);
      const agentStats = { updated: 0, added: 0, extra: [] };
      updateAgents(srcAgentsDir, destAgentsDir, agentStats);
      totalStats.agents.updated += agentStats.updated;
      totalStats.agents.added += agentStats.added;
      totalStats.extra.push(...agentStats.extra);
      
      // 更新 skills
      const srcSkillsDir = path.join(sourceRoot, ide.id, 'skills');
      const destSkillsDir = path.join(projectRoot, ide.skillsDir);
      const skillStats = { updated: 0, added: 0, extra: [], extraDirs: [] };
      updateSkills(srcSkillsDir, destSkillsDir, skillStats);
      totalStats.skills.updated += skillStats.updated;
      totalStats.skills.added += skillStats.added;
      totalStats.extra.push(...skillStats.extra);
      totalStats.extraDirs.push(...skillStats.extraDirs);
    }
    
    // 更新 workspace docs
    const srcDocsDir = path.join(workspaceTemplatePath, 'docs');
    const destDocsDir = path.join(projectRoot, 'speccrew-workspace', 'docs');
    const docsStats = { updated: 0 };
    updateWorkspaceDocs(srcDocsDir, destDocsDir, docsStats);
    totalStats.workspaceDocs.updated = docsStats.updated;
    
    // 更新 .speccrewrc
    rc.version = currentVersion;
    rc.updatedAt = new Date().toISOString();
    writeSpeccrewRC(projectRoot, rc);
    
    // 输出结果
    if (installedVersion === currentVersion) {
      console.log(`Already up to date: v${currentVersion}\n`);
    } else {
      console.log(`SpecCrew updated: v${installedVersion} → v${currentVersion}\n`);
    }
    
    console.log(`Agents: ${totalStats.agents.updated} updated, ${totalStats.agents.added} added`);
    console.log(`Skills: ${totalStats.skills.updated} updated, ${totalStats.skills.added} added`);
    console.log(`Workspace docs: ${totalStats.workspaceDocs.updated} updated`);
    
    // 输出警告
    const allExtras = [...new Set([...totalStats.extra, ...totalStats.extraDirs])];
    if (allExtras.length > 0) {
      console.log('\nWarning: The following installed items are not in the current version:');
      for (const item of allExtras) {
        console.log(`  - ${item} (user-created, skipped)`);
      }
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { run };
