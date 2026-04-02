const fs = require('fs');
const path = require('path');
const { readSpeccrewRC, isSpeccrewFile, removeDirRecursive } = require('../utils');

function run(projectRoot, args) {
  // 检查是否已初始化
  const rc = readSpeccrewRC(projectRoot);
  if (!rc) {
    console.log('SpecCrew is not initialized in this project.');
    console.log('Run "speccrew init" to initialize.');
    return false;
  }

  console.log('SpecCrew Uninstall\n');

  const isAll = args.includes('--all');
  let removedAgents = 0;
  let removedSkills = 0;
  const removedItems = [];

  // 获取 IDE 配置
  const ides = rc.ide ? (Array.isArray(rc.ide) ? rc.ide : [rc.ide]) : [];

  // 删除每个 IDE 目录下的 speccrew-* agents 和 skills
  for (const ideId of ides) {
    const ideConfig = getIDEConfig(ideId);
    if (!ideConfig) continue;

    // 删除 agents
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
          removedItems.push(`${ideConfig.baseDir}/agents/${entry.name}`);
        }
      }
    }

    // 删除 skills
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
          removedItems.push(`${ideConfig.baseDir}/skills/${entry.name}`);
        }
      }
    }
  }

  // 如果 --all，删除 workspace
  let workspaceRemoved = false;
  if (isAll) {
    const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
    if (fs.existsSync(workspaceDir)) {
      removeDirRecursive(workspaceDir);
      workspaceRemoved = true;
      removedItems.push('speccrew-workspace/');
    }
  }

  // 删除 .speccrewrc
  const rcPath = path.join(projectRoot, '.speccrewrc');
  if (fs.existsSync(rcPath)) {
    fs.unlinkSync(rcPath);
    removedItems.push('.speccrewrc');
  }

  // 输出摘要
  console.log(`Removed ${removedAgents} agent(s) and ${removedSkills} skill(s)`);
  if (workspaceRemoved) {
    console.log('Removed speccrew-workspace/');
  }
  console.log('Removed .speccrewrc');
  console.log('\nSpecCrew has been uninstalled.');
  if (!isAll) {
    console.log('Workspace data preserved. Use --all to remove everything.');
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
