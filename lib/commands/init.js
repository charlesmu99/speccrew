const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  copyDirRecursive,
  isSpeccrewFile,
  writeSpeccrewRC,
  getPackageVersion,
  getSourceRoot,
  getWorkspaceTemplatePath,
  ensureDirectories,
} = require('../utils');
const { resolveIDE, transformAgentForIDE, transformSkillForIDE } = require('../ide-adapters');

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  let ide = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ide' && i + 1 < args.length) {
      ide = args[i + 1];
      break;
    }
  }
  
  return { ide };
}

// 检查 Node.js 版本 >= 16
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  if (major < 16) {
    throw new Error(`Node.js version ${version} is not supported. Please upgrade to Node.js 16 or higher.`);
  }
}

// 进度显示辅助函数
function printProgress(step, total, message) {
  process.stdout.write(`[${step}/${total}] ${message}... `);
}

function printDone() {
  console.log('done');
}

// 获取 npm 包根目录
function getPackageRoot() {
  return path.resolve(__dirname, '..', '..');
}

// 复制 agents（speccrew-* 前缀文件，总是覆盖）
function copyAgents(sourceDir, destDir, ideConfig) {
  if (!fs.existsSync(sourceDir)) return { copied: 0, skipped: 0 };
  
  fs.mkdirSync(destDir, { recursive: true });
  let copied = 0, skipped = 0;
  
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!isSpeccrewFile(entry.name)) {
      skipped++;
      continue;
    }
    
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    // 如果 IDE 需要转换 frontmatter 且是 .md 文件
    if (ideConfig && ideConfig.transformFrontmatter && entry.name.endsWith('.md')) {
      const originalContent = fs.readFileSync(srcPath, 'utf8');
      const transformedContent = transformAgentForIDE(originalContent, ideConfig);
      fs.writeFileSync(destPath, transformedContent, 'utf8');
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
    copied++;
  }
  
  return { copied, skipped };
}

// 复制 skills（speccrew-* 前缀目录，递归复制，总是覆盖）
function copySkills(sourceDir, destDir, ideConfig) {
  if (!fs.existsSync(sourceDir)) return { copied: 0, skipped: 0 };
  
  let copied = 0, skipped = 0;
  
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!isSpeccrewFile(entry.name)) {
      skipped++;
      continue;
    }
    
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      // 构建 contentTransform 回调：只对 SKILL.md 文件转化
      let contentTransform = null;
      if (ideConfig && ideConfig.transformFrontmatter) {
        contentTransform = (content, fileName, filePath) => {
          if (fileName === 'SKILL.md') {
            return transformSkillForIDE(content, ideConfig);
          }
          // 其他文件返回 null，表示按原方式复制
          return null;
        };
      }
      const result = copyDirRecursive(srcPath, destPath, null, contentTransform);
      copied += result.copied;
      skipped += result.skipped;
    } else {
      fs.copyFileSync(srcPath, destPath);
      copied++;
    }
  }
  
  return { copied, skipped };
}

// 创建 workspace 目录结构
function createWorkspaceStructure(workspaceDir) {
  const dirs = [
    'iterations',
    'iteration-archives',
    'knowledges/base/diagnosis-reports',
    'knowledges/base/sync-state',
    'knowledges/base/tech-debts',
    'knowledges/bizs',
    'knowledges/techs',
    'docs/configs',
    'docs/rules',
    'docs/solutions',
    'docs/templates',
  ];
  
  ensureDirectories(workspaceDir, dirs);
}

// 复制 workspace 模板（仅复制不存在的文件）
function copyWorkspaceTemplate(templateDir, workspaceDir) {
  if (!fs.existsSync(templateDir)) return { copied: 0, skipped: 0 };
  
  const docsSourceDir = path.join(templateDir, 'docs');
  const docsDestDir = path.join(workspaceDir, 'docs');
  
  if (!fs.existsSync(docsSourceDir)) return { copied: 0, skipped: 0 };
  
  fs.mkdirSync(docsDestDir, { recursive: true });
  let copied = 0, skipped = 0;
  
  function copyIfNotExists(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyIfNotExists(srcPath, destPath);
      } else {
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
          copied++;
        } else {
          skipped++;
        }
      }
    }
  }
  
  copyIfNotExists(docsSourceDir, docsDestDir);
  return { copied, skipped };
}

// 复制文档文件（仅复制不存在的文件）
function copyDocs(packageRoot, workspaceDir) {
  let copied = 0;
  
  // 复制 GETTING-STARTED*.md 到 workspace/docs/
  const docsSourceDir = path.join(packageRoot, 'docs');
  const docsDestDir = path.join(workspaceDir, 'docs');
  
  if (fs.existsSync(docsSourceDir)) {
    const entries = fs.readdirSync(docsSourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('GETTING-STARTED') && entry.name.endsWith('.md')) {
        const srcPath = path.join(docsSourceDir, entry.name);
        const destPath = path.join(docsDestDir, entry.name);
        
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
          copied++;
        }
      }
    }
  }
  
  // 复制 README*.md 到 workspace/
  const entries = fs.readdirSync(packageRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('README') && entry.name.endsWith('.md')) {
      const srcPath = path.join(packageRoot, entry.name);
      const destPath = path.join(workspaceDir, entry.name);
      
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
  }
  
  return { copied };
}

// 迁移旧的 .speccrewrc 到 workspace 目录
function migrateOldSpeccrewRC(projectRoot, workspaceDir) {
  const oldRcPath = path.join(projectRoot, '.speccrewrc');
  const newRcPath = path.join(workspaceDir, '.speccrewrc');
  
  if (fs.existsSync(oldRcPath) && !fs.existsSync(newRcPath)) {
    fs.renameSync(oldRcPath, newRcPath);
    return true;
  }
  return false;
}

// 统计 agents 和 skills 数量
function countAgentsAndSkills(sourceRoot) {
  let agentCount = 0;
  let skillCount = 0;
  
  const agentsSourceDir = path.join(sourceRoot, 'agents');
  const skillsSourceDir = path.join(sourceRoot, 'skills');
  
  if (fs.existsSync(agentsSourceDir)) {
    const entries = fs.readdirSync(agentsSourceDir, { withFileTypes: true });
    agentCount = entries.filter(e => isSpeccrewFile(e.name)).length;
  }
  
  if (fs.existsSync(skillsSourceDir)) {
    const entries = fs.readdirSync(skillsSourceDir, { withFileTypes: true });
    skillCount = entries.filter(e => isSpeccrewFile(e.name)).length;
  }
  
  return { agentCount, skillCount };
}

// 询问用户确认
function askConfirm(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question(message, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === '' || normalized === 'y' || normalized === 'yes');
    });
  });
}

// 核心安装逻辑
async function runInit(options = {}) {
  const {
    projectRoot = process.cwd(),
    ideArg = null,
    silent = false,
    skipConfirm = false,
  } = options;
  
  const log = silent ? () => {} : console.log;
  
  try {
    // 1. 检查 Node.js 版本
    checkNodeVersion();
    
    // 2. 确定源文件路径
    const sourceRoot = getSourceRoot();
    const packageRoot = getPackageRoot();
    
    // 3. 解析 IDE
    if (!silent) printProgress(1, 5, 'Detecting IDE environment');
    const ideConfigs = resolveIDE(projectRoot, ideArg);
    if (!silent) printDone();
    
    // 4. 统计 agents 和 skills 数量
    const { agentCount, skillCount } = countAgentsAndSkills(sourceRoot);
    
    // 5. 显示安装摘要并确认
    const version = getPackageVersion();
    const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
    
    if (!skipConfirm && !silent) {
      log(`\nSpecCrew v${version}\n`);
      log('Installation Summary:');
      if (ideConfigs.length === 1) {
        log(`  IDE:       ${ideConfigs[0].name} (${ideConfigs[0].baseDir}/)`);
      } else {
        log(`  IDE:       ${ideConfigs.map(c => c.name).join(', ')}`);
      }
      log(`  Agents:    ${agentCount} agents`);
      log(`  Skills:    ${skillCount} skills`);
      log(`  Workspace: speccrew-workspace/\n`);
      
      const confirmed = await askConfirm('Proceed with installation? (Y/n) ');
      if (!confirmed) {
        log('Installation cancelled.');
        return { cancelled: true };
      }
      log('');
    }
    
    // 6. 迁移旧的 .speccrewrc（如果存在）
    migrateOldSpeccrewRC(projectRoot, workspaceDir);
    
    // 统计信息
    const stats = {
      ides: [],
      totalAgents: 0,
      totalSkills: 0,
      workspaceCreated: false,
      docsInstalled: 0,
    };
    
    // 7. 复制 agents 和 skills
    if (!silent) printProgress(2, 5, `Installing agents (${agentCount})`);
    for (const ideConfig of ideConfigs) {
      const agentsSourceDir = path.join(sourceRoot, 'agents');
      const skillsSourceDir = path.join(sourceRoot, 'skills');
      const agentsDestDir = path.join(projectRoot, ideConfig.agentsDir);
      const skillsDestDir = path.join(projectRoot, ideConfig.skillsDir);
      
      const agentsResult = copyAgents(agentsSourceDir, agentsDestDir, ideConfig);
      const skillsResult = copySkills(skillsSourceDir, skillsDestDir, ideConfig);
      
      stats.ides.push({
        name: ideConfig.name,
        baseDir: ideConfig.baseDir,
        agents: agentsResult.copied,
        skills: skillsResult.copied,
      });
      stats.totalAgents += agentsResult.copied;
      stats.totalSkills += skillsResult.copied;
    }
    if (!silent) printDone();
    
    // 8. 复制 skills（显示进度）
    if (!silent) printProgress(3, 5, `Installing skills (${skillCount})`);
    // skills 已经在上面复制完成，这里只是显示进度
    if (!silent) printDone();
    
    // 9. 创建 speccrew-workspace 目录结构
    if (!silent) printProgress(4, 5, 'Creating workspace structure');
    createWorkspaceStructure(workspaceDir);
    stats.workspaceCreated = true;
    if (!silent) printDone();
    
    // 10. 复制 workspace 模板
    const templateDir = getWorkspaceTemplatePath();
    copyWorkspaceTemplate(templateDir, workspaceDir);
    
    // 11. 复制文档
    if (!silent) printProgress(5, 5, 'Installing documentation');
    const docsResult = copyDocs(packageRoot, workspaceDir);
    stats.docsInstalled = docsResult.copied;
    if (!silent) printDone();
    
    // 12. 写入 .speccrewrc 到 workspace 目录
    const rcConfig = {
      ide: ideConfigs.length === 1 ? ideConfigs[0].id : ideConfigs.map(c => c.id),
      version: version,
      installedAt: new Date().toISOString(),
    };
    writeSpeccrewRC(workspaceDir, rcConfig);
    
    // 13. 输出安装摘要
    if (!silent) {
      log(`\nSpecCrew v${version} installed successfully!\n`);
      
      if (ideConfigs.length === 1) {
        log(`  IDE:       ${ideConfigs[0].name} (${ideConfigs[0].baseDir}/)`);
      } else {
        log(`  IDE:       ${ideConfigs.map(c => c.name).join(', ')}`);
      }
      log(`  Agents:    ${stats.totalAgents} installed`);
      log(`  Skills:    ${stats.totalSkills} installed`);
      log(`  Workspace: speccrew-workspace/ created`);
      log(`  Docs:      ${stats.docsInstalled} files installed`);
      
      log(`\nRun 'speccrew doctor' to verify your installation.`);
    }
    
    return {
      success: true,
      version,
      stats,
      ideConfigs,
    };
    
  } catch (error) {
    if (!silent) {
      console.error(`Error: ${error.message}`);
    }
    throw error;
  }
}

// CLI 入口
function run() {
  const { ide: cliIdeArg } = parseArgs();
  
  runInit({
    projectRoot: process.cwd(),
    ideArg: cliIdeArg,
    silent: false,
    skipConfirm: false,
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = { runInit, run };
