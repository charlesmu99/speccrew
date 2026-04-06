const fs = require('fs');
const path = require('path');
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

// 主函数
function run() {
  try {
    // 1. 解析参数
    const { ide: cliIdeArg } = parseArgs();
    
    // 2. 确定项目根目录
    const projectRoot = process.cwd();
    
    // 3. 检查 Node.js 版本
    checkNodeVersion();
    
    // 4. 解析 IDE
    const ideConfigs = resolveIDE(projectRoot, cliIdeArg);
    
    // 5. 确定源文件路径
    const sourceRoot = getSourceRoot();
    
    // 统计信息
    const stats = {
      ides: [],
      totalAgents: 0,
      totalSkills: 0,
      workspaceCreated: false,
    };
    
    // 6. 对每个检测到的 IDE 复制 agents 和 skills
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
    
    // 7. 创建 speccrew-workspace 目录结构
    const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
    createWorkspaceStructure(workspaceDir);
    stats.workspaceCreated = true;
    
    // 8. 复制 workspace 模板
    const templateDir = getWorkspaceTemplatePath();
    copyWorkspaceTemplate(templateDir, workspaceDir);
    
    // 9. 写入 .speccrewrc
    const version = getPackageVersion();
    const rcConfig = {
      ide: ideConfigs.length === 1 ? ideConfigs[0].id : ideConfigs.map(c => c.id),
      version: version,
      installedAt: new Date().toISOString(),
    };
    writeSpeccrewRC(projectRoot, rcConfig);
    
    // 10. 输出安装摘要
    console.log(`SpecCrew v${version} installed successfully!\n`);
    
    for (const ide of stats.ides) {
      console.log(`IDE: ${ide.name} (${ide.baseDir}/)`);
      console.log(`Agents: ${ide.agents} installed`);
      console.log(`Skills: ${ide.skills} installed`);
    }
    
    if (stats.workspaceCreated) {
      console.log('Workspace: speccrew-workspace/ created');
    }
    
    console.log('\nGet started: Ask your AI agent to help with your project!');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { run };
