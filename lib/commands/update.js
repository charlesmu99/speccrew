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
const { resolveIDE, getIDEConfig, transformAgentForIDE, transformSkillForIDE } = require('../ide-adapters');

// Get npm package root directory
function getPackageRoot() {
  return path.resolve(__dirname, '..', '..');
}

// Get new .speccrewrc path (inside speccrew-workspace)
function getNewSpeccrewRCPath(projectRoot) {
  return path.join(projectRoot, 'speccrew-workspace', '.speccrewrc');
}

// Get old .speccrewrc path (project root)
function getOldSpeccrewRCPath(projectRoot) {
  return path.join(projectRoot, '.speccrewrc');
}

// Read .speccrewrc with migration support
function readSpeccrewRCWithMigration(projectRoot) {
  const newPath = getNewSpeccrewRCPath(projectRoot);
  const oldPath = getOldSpeccrewRCPath(projectRoot);
  
  // Check new location first
  if (fs.existsSync(newPath)) {
    try {
      return JSON.parse(fs.readFileSync(newPath, 'utf8'));
    } catch (e) {
      return null;
    }
  }
  
  // If not in new location, check old location and migrate
  if (fs.existsSync(oldPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
      // Migrate: move to new location
      fs.mkdirSync(path.dirname(newPath), { recursive: true });
      fs.writeFileSync(newPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
      fs.unlinkSync(oldPath);
      return config;
    } catch (e) {
      return null;
    }
  }
  
  return null;
}

// Write .speccrewrc to new location
function writeSpeccrewRCNew(projectRoot, config) {
  const newPath = getNewSpeccrewRCPath(projectRoot);
  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  fs.writeFileSync(newPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

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
// contentTransform: 可选的内容转换函数 (content: string) => string
function copyFileIfChanged(src, dest, contentTransform = null) {
  if (!fs.existsSync(src)) return { copied: false, isNew: false };
  
  const destExists = fs.existsSync(dest);
  if (!destExists) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (contentTransform) {
      const srcContent = fs.readFileSync(src, 'utf8');
      const transformedContent = contentTransform(srcContent);
      fs.writeFileSync(dest, transformedContent, 'utf8');
    } else {
      fs.copyFileSync(src, dest);
    }
    return { copied: true, isNew: true };
  }
  
  // 比较文件内容
  const srcContent = fs.readFileSync(src, 'utf8');
  const destContent = fs.readFileSync(dest, 'utf8');
  
  // 如果有转换函数，比较转换后的内容
  const srcContentToCompare = contentTransform ? contentTransform(srcContent) : srcContent;
  
  if (srcContentToCompare === destContent) {
    return { copied: false, isNew: false };
  }
  
  // 写入转换后的内容（如果有转换函数）
  if (contentTransform) {
    fs.writeFileSync(dest, srcContentToCompare, 'utf8');
  } else {
    fs.copyFileSync(src, dest);
  }
  return { copied: true, isNew: false };
}

// 更新 agents 目录
function updateAgents(srcDir, destDir, stats, ideConfig = null) {
  if (!fs.existsSync(srcDir)) return;
  
  // 确定 contentTransform 函数
  const contentTransform = (ideConfig && ideConfig.transformFrontmatter)
    ? (content) => transformAgentForIDE(content, ideConfig)
    : null;
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!isSpeccrewFile(entry.name)) continue;
    
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    const result = copyFileIfChanged(srcPath, destPath, contentTransform);
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
function updateSkillsRecursive(srcDir, destDir, stats, currentRelPath = '', ideConfig = null) {
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
      updateSkillsRecursive(srcPath, destPath, stats, relPath, ideConfig);
    } else {
      // 在 speccrew-* 目录下的文件
      // 检查是否在 speccrew-* 父目录下
      const parentDir = path.basename(srcDir);
      if (!isSpeccrewFile(parentDir)) continue;
      
      // 对 SKILL.md 文件应用 frontmatter 转化（如果需要）
      const isSkillMd = entry.name === 'SKILL.md';
      const contentTransform = (isSkillMd && ideConfig && ideConfig.transformFrontmatter)
        ? (content) => transformSkillForIDE(content, ideConfig)
        : null;
      
      const result = copyFileIfChanged(srcPath, destPath, contentTransform);
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
function updateSkills(srcDir, destDir, stats, ideConfig = null) {
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
    updateSkillsRecursive(srcSkillDir, destSkillDir, skillStats, entry.name, ideConfig);
    
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
      const subStats = { updated: 0, added: 0 };
      updateWorkspaceDocs(srcPath, destPath, subStats);
      stats.updated += subStats.updated;
      stats.added += subStats.added;
    } else {
      const result = copyFileIfChanged(srcPath, destPath);
      if (result.isNew) {
        stats.added++;
      } else if (result.copied) {
        stats.updated++;
      }
    }
  }
}

// 更新 npm 包文档 (GETTING-STARTED*.md 和 README*.md)
function updatePackageDocs(packageRoot, workspaceDir, stats) {
  // Update GETTING-STARTED*.md files from docs/ directory
  const packageDocsDir = path.join(packageRoot, 'docs');
  const destDocsDir = path.join(workspaceDir, 'docs');
  
  if (fs.existsSync(packageDocsDir)) {
    const entries = fs.readdirSync(packageDocsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.startsWith('GETTING-STARTED') || !entry.name.endsWith('.md')) continue;
      
      const srcPath = path.join(packageDocsDir, entry.name);
      const destPath = path.join(destDocsDir, entry.name);
      
      const result = copyFileIfChanged(srcPath, destPath);
      if (result.isNew) {
        stats.added++;
      } else if (result.copied) {
        stats.updated++;
      }
    }
  }
  
  // Update README*.md files from package root
  const entries = fs.readdirSync(packageRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.startsWith('README') || !entry.name.endsWith('.md')) continue;
    
    const srcPath = path.join(packageRoot, entry.name);
    const destPath = path.join(workspaceDir, entry.name);
    
    const result = copyFileIfChanged(srcPath, destPath);
    if (result.isNew) {
      stats.added++;
    } else if (result.copied) {
      stats.updated++;
    }
  }
}

// 主函数
function run() {
  try {
    const args = parseArgs();

    // Self-update check: notify user if a newer CLI version is available
    const localVersion = getPackageVersion();
    let latestVersion = null;
    try {
      const { execSync } = require('child_process');
      latestVersion = execSync('npm view speccrew version', { encoding: 'utf8', timeout: 15000 }).trim();
    } catch (e) {
      // Network error or npm not available, skip version check
    }

    if (latestVersion && latestVersion !== localVersion) {
      console.log(`\n  New CLI version available: v${localVersion} → v${latestVersion}`);
      console.log(`  Run "npm install -g speccrew@latest" to upgrade, then re-run "speccrew update"\n`);
      process.exit(0);
    }

    const projectRoot = process.cwd();
    
    // 读取 .speccrewrc (with migration support)
    const rc = readSpeccrewRCWithMigration(projectRoot);
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
      workspaceDocs: { updated: 0, added: 0 },
      packageDocs: { updated: 0, added: 0 },
      extra: [],
      extraDirs: [],
    };
    
    // 对每个 IDE 执行更新
    for (const ide of ides) {
      // 更新 agents
      const srcAgentsDir = path.join(sourceRoot, 'agents');
      const destAgentsDir = path.join(projectRoot, ide.agentsDir);
      const agentStats = { updated: 0, added: 0, extra: [] };
      updateAgents(srcAgentsDir, destAgentsDir, agentStats, ide);
      totalStats.agents.updated += agentStats.updated;
      totalStats.agents.added += agentStats.added;
      totalStats.extra.push(...agentStats.extra);

      // 更新 skills
      const srcSkillsDir = path.join(sourceRoot, 'skills');
      const destSkillsDir = path.join(projectRoot, ide.skillsDir);
      const skillStats = { updated: 0, added: 0, extra: [], extraDirs: [] };
      updateSkills(srcSkillsDir, destSkillsDir, skillStats, ide);
      totalStats.skills.updated += skillStats.updated;
      totalStats.skills.added += skillStats.added;
      totalStats.extra.push(...skillStats.extra);
      totalStats.extraDirs.push(...skillStats.extraDirs);
    }
    
    // 更新 workspace 文件（docs, scripts 等所有子目录）
    const destWorkspaceDir = path.join(projectRoot, 'speccrew-workspace');
    const workspaceStats = { updated: 0, added: 0 };
    
    // 遍历 workspace-template 下的所有一级子目录并同步
    if (fs.existsSync(workspaceTemplatePath)) {
      const templateEntries = fs.readdirSync(workspaceTemplatePath, { withFileTypes: true });
      for (const entry of templateEntries) {
        if (entry.isDirectory()) {
          const srcSubDir = path.join(workspaceTemplatePath, entry.name);
          const destSubDir = path.join(destWorkspaceDir, entry.name);
          const subStats = { updated: 0, added: 0 };
          updateWorkspaceDocs(srcSubDir, destSubDir, subStats);
          workspaceStats.updated += subStats.updated;
          workspaceStats.added += subStats.added;
        }
      }
    }
    totalStats.workspaceDocs.updated = workspaceStats.updated;
    totalStats.workspaceDocs.added = workspaceStats.added;
    
    // 更新 npm 包文档 (GETTING-STARTED*.md and README*.md)
    const packageRoot = getPackageRoot();
    const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
    const packageDocsStats = { updated: 0, added: 0 };
    updatePackageDocs(packageRoot, workspaceDir, packageDocsStats);
    totalStats.packageDocs.updated = packageDocsStats.updated;
    totalStats.packageDocs.added = packageDocsStats.added;
    
    // 更新 .speccrewrc
    rc.version = currentVersion;
    rc.updatedAt = new Date().toISOString();
    writeSpeccrewRCNew(projectRoot, rc);
    
    // 输出结果
    if (installedVersion === currentVersion) {
      console.log(`Already up to date: v${currentVersion}\n`);
    } else {
      console.log(`SpecCrew updated: v${installedVersion} → v${currentVersion}\n`);
    }
    
    console.log(`Agents: ${totalStats.agents.updated} updated, ${totalStats.agents.added} added`);
    console.log(`Skills: ${totalStats.skills.updated} updated, ${totalStats.skills.added} added`);
    console.log(`Workspace: ${totalStats.workspaceDocs.updated} updated, ${totalStats.workspaceDocs.added} added`);
    console.log(`Docs: ${totalStats.packageDocs.updated} updated, ${totalStats.packageDocs.added} added`);
    
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
