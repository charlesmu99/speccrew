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
  removeDirRecursive,
  DEPRECATED_SKILLS,
  DEPRECATED_AGENTS,
  cleanDeprecatedSkills,
  cleanDeprecatedAgents,
} = require('../utils');
const { resolveIDE, transformAgentForIDE, transformSkillForIDE } = require('../ide-adapters');

// Parse command line arguments
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

// Check Node.js version >= 16
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  if (major < 16) {
    throw new Error(`Node.js version ${version} is not supported. Please upgrade to Node.js 16 or higher.`);
  }
}

// Progress display helper functions
function printProgress(step, total, message) {
  process.stdout.write(`[${step}/${total}] ${message}... `);
}

function printDone() {
  console.log('done');
}

// Get npm package root directory
function getPackageRoot() {
  return path.resolve(__dirname, '..', '..');
}

// Copy agents (speccrew-* prefixed files, always overwrite)
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
    
    // If IDE needs frontmatter transformation and is .md file
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

// Copy skills (speccrew-* prefixed directories, recursive copy, always overwrite)
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
      // Build contentTransform callback: only transform SKILL.md files
      let contentTransform = null;
      if (ideConfig && ideConfig.transformFrontmatter) {
        contentTransform = (content, fileName, filePath) => {
          if (fileName === 'SKILL.md') {
            return transformSkillForIDE(content, ideConfig);
          }
          // Other files return null, indicating copy as-is
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

// Create workspace directory structure
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

// Copy workspace template (only copy non-existent files)
function copyWorkspaceTemplate(templateDir, workspaceDir) {
  if (!fs.existsSync(templateDir)) return { copied: 0, skipped: 0 };
  
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
  
  // Iterate over all first-level subdirectories in workspace-template and copy
  const entries = fs.readdirSync(templateDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const srcSubDir = path.join(templateDir, entry.name);
      const destSubDir = path.join(workspaceDir, entry.name);
      fs.mkdirSync(destSubDir, { recursive: true });
      copyIfNotExists(srcSubDir, destSubDir);
    }
  }
  
  return { copied, skipped };
}

// Copy documentation files (only copy non-existent files)
function copyDocs(packageRoot, workspaceDir) {
  let copied = 0;
  
  // Copy GETTING-STARTED*.md to workspace/docs/
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
  
  // Copy README*.md to workspace/
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

// Migrate old .speccrewrc to workspace directory
function migrateOldSpeccrewRC(projectRoot, workspaceDir) {
  const oldRcPath = path.join(projectRoot, '.speccrewrc');
  const newRcPath = path.join(workspaceDir, '.speccrewrc');
  
  if (fs.existsSync(oldRcPath) && !fs.existsSync(newRcPath)) {
    fs.renameSync(oldRcPath, newRcPath);
    return true;
  }
  return false;
}

// Count agents and skills
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

// Ask user for confirmation
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

// Core installation logic
async function runInit(options = {}) {
  const {
    projectRoot = process.cwd(),
    ideArg = null,
    silent = false,
    skipConfirm = false,
  } = options;
  
  const log = silent ? () => {} : console.log;
  
  try {
    // 1. Check Node.js version
    checkNodeVersion();
    
    // 2. Determine source file paths
    const sourceRoot = getSourceRoot();
    const packageRoot = getPackageRoot();
    
    // 3. Resolve IDE
    if (!silent) printProgress(1, 5, 'Detecting IDE environment');
    const ideConfigs = resolveIDE(projectRoot, ideArg);
    if (!silent) printDone();
    
    // 4. Count agents and skills
    const { agentCount, skillCount } = countAgentsAndSkills(sourceRoot);
    
    // 5. Show installation summary and confirm
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
    
    // 6. Migrate old .speccrewrc (if exists)
    migrateOldSpeccrewRC(projectRoot, workspaceDir);
    
    // Statistics
    const stats = {
      ides: [],
      totalAgents: 0,
      totalSkills: 0,
      workspaceCreated: false,
      docsInstalled: 0,
    };
    
    // 7. Copy agents and skills
    if (!silent) printProgress(2, 5, `Installing agents (${agentCount})`);
    for (const ideConfig of ideConfigs) {
      const agentsSourceDir = path.join(sourceRoot, 'agents');
      const skillsSourceDir = path.join(sourceRoot, 'skills');
      const agentsDestDir = path.join(projectRoot, ideConfig.agentsDir);
      const skillsDestDir = path.join(projectRoot, ideConfig.skillsDir);
      
      const agentsResult = copyAgents(agentsSourceDir, agentsDestDir, ideConfig);
      const skillsResult = copySkills(skillsSourceDir, skillsDestDir, ideConfig);

      // Clean up deprecated skills
      const cleanedSkillCount = cleanDeprecatedSkills(skillsDestDir, DEPRECATED_SKILLS);
      if (cleanedSkillCount > 0 && !silent) {
        log(`  Cleaned up ${cleanedSkillCount} deprecated skill(s) from ${ideConfig.name}`);
      }

      // Clean up deprecated agents
      const cleanedAgentCount = cleanDeprecatedAgents(agentsDestDir, DEPRECATED_AGENTS);
      if (cleanedAgentCount > 0 && !silent) {
        log(`  Cleaned up ${cleanedAgentCount} deprecated agent(s) from ${ideConfig.name}`);
      }

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
    
    // 8. Copy skills (show progress)
    if (!silent) printProgress(3, 5, `Installing skills (${skillCount})`);
    // Skills already copied above, just showing progress here
    if (!silent) printDone();
    
    // 9. Create speccrew-workspace directory structure
    if (!silent) printProgress(4, 5, 'Creating workspace structure');
    createWorkspaceStructure(workspaceDir);
    stats.workspaceCreated = true;
    if (!silent) printDone();
    
    // 10. Copy workspace template
    const templateDir = getWorkspaceTemplatePath();
    copyWorkspaceTemplate(templateDir, workspaceDir);
    
    // 11. Copy documentation
    if (!silent) printProgress(5, 5, 'Installing documentation');
    const docsResult = copyDocs(packageRoot, workspaceDir);
    stats.docsInstalled = docsResult.copied;
    if (!silent) printDone();
    
    // 12. Write .speccrewrc to workspace directory
    const rcConfig = {
      ide: ideConfigs.length === 1 ? ideConfigs[0].id : ideConfigs.map(c => c.id),
      version: version,
      installedAt: new Date().toISOString(),
    };
    writeSpeccrewRC(workspaceDir, rcConfig);
    
    // 13. Output installation summary
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
      
      console.log('');
      console.log('  What to do next:');
      console.log('');
      console.log('  1. Open your project in your IDE (Qoder/Cursor/Claude Code)');
      console.log('');
      console.log('  2. Initialize knowledge base (recommended for existing projects):');
      console.log('     → Tell /speccrew-team-leader: "Initialize technical knowledge base"');
      console.log('     → Then: "Initialize business knowledge base"');
      console.log('');
      console.log('  3. Start your first requirement:');
      console.log('     → Tell /speccrew-product-manager: "I have a new requirement: [describe it]"');
      console.log('');
      console.log('  Need help? → Tell /speccrew-team-leader: "Help me get started"');
      console.log('  Troubleshooting? → Run: speccrew doctor');
      console.log('');
      console.log('  Documentation: speccrew-workspace/docs/GETTING-STARTED.md');
      console.log('');
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

// CLI entry point
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
