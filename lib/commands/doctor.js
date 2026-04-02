const fs = require('fs');
const path = require('path');
const { readSpeccrewRC, getPackageVersion, getSourceRoot, isSpeccrewFile } = require('../utils');
const { detectIDE, IDE_CONFIGS } = require('../ide-adapters');

function run(projectRoot, args) {
  console.log('SpecCrew Doctor\n');

  const results = [];

  // 1. Node.js 版本检查
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 16) {
    results.push({ status: 'PASS', message: `Node.js ${nodeVersion} (>= 16.0.0)` });
  } else {
    results.push({ status: 'FAIL', message: `Node.js ${nodeVersion} (< 16.0.0)` });
  }

  // 2. SpecCrew 安装状态
  const rc = readSpeccrewRC(projectRoot);
  const version = getPackageVersion();
  if (rc) {
    results.push({ status: 'PASS', message: `SpecCrew v${version} installed` });
  } else {
    results.push({ status: 'WARN', message: 'Not initialized, run speccrew init' });
  }

  // 3. IDE 目录检查
  const detectedIDEs = detectIDE(projectRoot);
  if (detectedIDEs.length > 0) {
    const ideNames = detectedIDEs.map(ide => `${ide.name} (${ide.baseDir}/)`).join(', ');
    results.push({ status: 'PASS', message: `IDE: ${ideNames}` });
  } else {
    results.push({ status: 'WARN', message: 'No supported IDE detected' });
  }

  // 4. Agents 完整性检查
  const sourceRoot = getSourceRoot();
  const sourceAgentsDir = path.join(sourceRoot, 'agents');
  let sourceAgentCount = 0;
  let installedAgentCount = 0;
  let missingAgents = [];

  if (fs.existsSync(sourceAgentsDir)) {
    const sourceAgents = fs.readdirSync(sourceAgentsDir).filter(isSpeccrewFile);
    sourceAgentCount = sourceAgents.length;

    for (const ide of detectedIDEs) {
      const agentsDir = path.join(projectRoot, ide.agentsDir);
      if (fs.existsSync(agentsDir)) {
        const installed = fs.readdirSync(agentsDir).filter(isSpeccrewFile);
        installedAgentCount = installed.length;

        for (const agent of sourceAgents) {
          const agentName = agent.replace(/\.md$/, '');
          if (!installed.includes(agent)) {
            missingAgents.push(agentName);
          }
        }
      }
    }
  }

  if (missingAgents.length === 0 && sourceAgentCount > 0) {
    results.push({ status: 'PASS', message: `Agents: ${installedAgentCount}/${sourceAgentCount} installed` });
  } else if (sourceAgentCount > 0) {
    results.push({ status: 'WARN', message: `Agents: ${installedAgentCount}/${sourceAgentCount} installed (missing: ${missingAgents.join(', ')})` });
  } else {
    results.push({ status: 'WARN', message: 'Agents: source not found' });
  }

  // 5. Skills 完整性检查
  const sourceSkillsDir = path.join(sourceRoot, 'skills');
  let sourceSkillCount = 0;
  let installedSkillCount = 0;
  let missingSkills = [];

  if (fs.existsSync(sourceSkillsDir)) {
    const sourceSkills = fs.readdirSync(sourceSkillsDir).filter(isSpeccrewFile);
    sourceSkillCount = sourceSkills.length;

    for (const ide of detectedIDEs) {
      const skillsDir = path.join(projectRoot, ide.skillsDir);
      if (fs.existsSync(skillsDir)) {
        const installed = fs.readdirSync(skillsDir).filter(isSpeccrewFile);
        installedSkillCount = Math.max(installedSkillCount, installed.length);

        for (const skill of sourceSkills) {
          if (!installed.includes(skill)) {
            missingSkills.push(skill);
          }
        }
      }
    }
  }

  if (missingSkills.length === 0 && sourceSkillCount > 0) {
    results.push({ status: 'PASS', message: `Skills: ${installedSkillCount}/${sourceSkillCount} installed` });
  } else if (sourceSkillCount > 0) {
    results.push({ status: 'WARN', message: `Skills: ${installedSkillCount}/${sourceSkillCount} installed (missing: ${missingSkills.join(', ')})` });
  } else {
    results.push({ status: 'WARN', message: 'Skills: source not found' });
  }

  // 6. Workspace 目录检查
  const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
  const docsDir = path.join(workspaceDir, 'docs');
  if (fs.existsSync(workspaceDir) && fs.existsSync(docsDir)) {
    results.push({ status: 'PASS', message: 'Workspace: speccrew-workspace/ OK' });
  } else if (fs.existsSync(workspaceDir)) {
    results.push({ status: 'WARN', message: 'Workspace: speccrew-workspace/ exists but docs/ missing' });
  } else {
    results.push({ status: 'WARN', message: 'Workspace: speccrew-workspace/ not found' });
  }

  // 输出结果
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const result of results) {
    const icon = result.status === 'PASS' ? 'PASS' : result.status === 'WARN' ? 'WARN' : 'FAIL';
    const padding = '  ';
    console.log(`${padding}${icon}  ${result.message}`);

    if (result.status === 'PASS') passCount++;
    else if (result.status === 'WARN') warnCount++;
    else failCount++;
  }

  console.log('');
  console.log(`${passCount} passed, ${warnCount} warning${warnCount !== 1 ? 's' : ''}, ${failCount} error${failCount !== 1 ? 's' : ''}`);

  return failCount === 0;
}

module.exports = { run };
