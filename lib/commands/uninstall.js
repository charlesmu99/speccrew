const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { readSpeccrewRC, isSpeccrewFile, removeDirRecursive } = require('../utils');

function run(projectRoot, args) {
  // 检查是否已初始化（兼容新旧两个路径）
  let rc = readSpeccrewRC(projectRoot);
  const newRcPath = path.join(projectRoot, 'speccrew-workspace', '.speccrewrc');
  
  // 如果旧路径没有配置文件，检查新路径
  if (!rc && fs.existsSync(newRcPath)) {
    try {
      rc = JSON.parse(fs.readFileSync(newRcPath, 'utf8'));
    } catch (e) {
      // 忽略解析错误
    }
  }
  
  if (!rc) {
    console.log('SpecCrew is not initialized in this project.');
    console.log('Run "speccrew init" to initialize.');
    return false;
  }

  const isAll = args.includes('--all');

  // 获取 IDE 配置
  const ides = rc.ide ? (Array.isArray(rc.ide) ? rc.ide : [rc.ide]) : [];

  // 扫描将要删除的内容（不实际删除）
  let totalAgents = 0;
  let totalSkills = 0;
  const idePaths = [];

  for (const ideId of ides) {
    const ideConfig = getIDEConfig(ideId);
    if (!ideConfig) continue;

    let agentCount = 0;
    let skillCount = 0;

    // 统计 agents
    const agentsDir = path.join(projectRoot, ideConfig.agentsDir);
    if (fs.existsSync(agentsDir)) {
      const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (isSpeccrewFile(entry.name)) {
          agentCount++;
        }
      }
    }

    // 统计 skills
    const skillsDir = path.join(projectRoot, ideConfig.skillsDir);
    if (fs.existsSync(skillsDir)) {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (isSpeccrewFile(entry.name)) {
          skillCount++;
        }
      }
    }

    totalAgents += agentCount;
    totalSkills += skillCount;
    idePaths.push({ ideConfig, agentCount, skillCount });
  }

  // 检查配置文件是否存在（新路径和旧路径）
  const oldRcPath = path.join(projectRoot, '.speccrewrc');
  const hasNewRc = fs.existsSync(newRcPath);
  const hasOldRc = fs.existsSync(oldRcPath);
  const hasRcFile = hasNewRc || hasOldRc;

  // 检查 workspace 是否存在
  const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
  const hasWorkspace = fs.existsSync(workspaceDir);

  // 显示将要删除的内容
  console.log('SpecCrew Uninstall\n');
  console.log('The following will be removed:');

  for (const { ideConfig, agentCount, skillCount } of idePaths) {
    if (agentCount > 0) {
      console.log(`  - ${agentCount} agent(s) from ${ideConfig.baseDir}/agents/`);
    }
    if (skillCount > 0) {
      console.log(`  - ${skillCount} skill(s) from ${ideConfig.baseDir}/skills/`);
    }
  }

  if (hasRcFile) {
    console.log('  - SpecCrew configuration (speccrew-workspace/.speccrewrc)');
  }

  if (isAll && hasWorkspace) {
    console.log('  - speccrew-workspace/ (including all iterations, docs and knowledge base)');
    console.log('\nWARNING: This will permanently delete your workspace data!');
  }

  // 询问用户确认
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nProceed with uninstall? (Y/n) ', (answer) => {
      rl.close();

      const confirmed = answer.toLowerCase() === 'y' || answer === '' || answer.toLowerCase() === 'yes';

      if (!confirmed) {
        console.log('Uninstall cancelled.');
        resolve(false);
        return;
      }

      // 执行卸载
      const result = performUninstall(projectRoot, idePaths, isAll, hasOldRc);
      resolve(result);
    });
  });
}

function performUninstall(projectRoot, idePaths, isAll, hasOldRc) {
  let removedAgents = 0;
  let removedSkills = 0;

  // 计算总步骤数
  const totalSteps = isAll ? 4 : 3;
  let currentStep = 0;

  // 删除 agents
  currentStep++;
  process.stdout.write(`[${currentStep}/${totalSteps}] Removing agents... `);
  for (const { ideConfig } of idePaths) {
    const agentsDir = path.join(projectRoot, ideConfig.agentsDir);
    if (fs.existsSync(agentsDir)) {
      const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (isSpeccrewFile(entry.name)) {
          const fullPath = path.join(agentsDir, entry.name);
          if (entry.isDirectory()) {
            removeDirRecursive(fullPath);
          } else {
            fs.unlinkSync(fullPath);
          }
          removedAgents++;
        }
      }
    }
  }
  console.log(`done (${removedAgents} removed)`);

  // 删除 skills
  currentStep++;
  process.stdout.write(`[${currentStep}/${totalSteps}] Removing skills... `);
  for (const { ideConfig } of idePaths) {
    const skillsDir = path.join(projectRoot, ideConfig.skillsDir);
    if (fs.existsSync(skillsDir)) {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (isSpeccrewFile(entry.name)) {
          const fullPath = path.join(skillsDir, entry.name);
          if (entry.isDirectory()) {
            removeDirRecursive(fullPath);
          } else {
            fs.unlinkSync(fullPath);
          }
          removedSkills++;
        }
      }
    }
  }
  console.log(`done (${removedSkills} removed)`);

  // 删除配置文件
  currentStep++;
  process.stdout.write(`[${currentStep}/${totalSteps}] Removing configuration... `);

  // 删除新路径的配置文件
  const newRcPath = path.join(projectRoot, 'speccrew-workspace', '.speccrewrc');
  if (fs.existsSync(newRcPath)) {
    fs.unlinkSync(newRcPath);
  }

  // 兼容处理：删除旧路径的配置文件
  const oldRcPath = path.join(projectRoot, '.speccrewrc');
  if (fs.existsSync(oldRcPath)) {
    fs.unlinkSync(oldRcPath);
  }

  console.log('done');

  // 如果 --all，删除 workspace
  if (isAll) {
    currentStep++;
    process.stdout.write(`[${currentStep}/${totalSteps}] Removing workspace... `);
    const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
    if (fs.existsSync(workspaceDir)) {
      removeDirRecursive(workspaceDir);
    }
    console.log('done');

    console.log('\nSpecCrew has been completely uninstalled.');
  } else {
    console.log('\nSpecCrew has been uninstalled.');
    console.log('Workspace data preserved in speccrew-workspace/');
  }

  return true;
}

// 获取 IDE 配置（简化版，避免循环依赖）
function getIDEConfig(ideId) {
  const configs = {
    qoder: {
      name: 'Qoder',
      baseDir: '.qoder',
      skillsDir: '.qoder/skills',
      agentsDir: '.qoder/agents',
    },
    cursor: {
      name: 'Cursor',
      baseDir: '.cursor',
      skillsDir: '.cursor/skills',
      agentsDir: '.cursor/agents',
    },
  };
  return configs[ideId] || null;
}

module.exports = { run };
