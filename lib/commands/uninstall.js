const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { readSpeccrewRC, isSpeccrewFile, removeDirRecursive } = require('../utils');

function run(projectRoot, args) {
  // Check if initialized (compatible with both old and new paths)
  let rc = readSpeccrewRC(projectRoot);
  const newRcPath = path.join(projectRoot, 'speccrew-workspace', '.speccrewrc');
  
  // If config not found at old path, check new path
  if (!rc && fs.existsSync(newRcPath)) {
    try {
      rc = JSON.parse(fs.readFileSync(newRcPath, 'utf8'));
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  if (!rc) {
    console.log('SpecCrew is not initialized in this project.');
    console.log('Run "speccrew init" to initialize.');
    return false;
  }

  const isAll = args.includes('--all');

  // Get IDE configuration
  const ides = rc.ide ? (Array.isArray(rc.ide) ? rc.ide : [rc.ide]) : [];

  // Scan content to be deleted (don't actually delete yet)
  let totalAgents = 0;
  let totalSkills = 0;
  const idePaths = [];

  for (const ideId of ides) {
    const ideConfig = getIDEConfig(ideId);
    if (!ideConfig) continue;

    let agentCount = 0;
    let skillCount = 0;

    // Count agents
    const agentsDir = path.join(projectRoot, ideConfig.agentsDir);
    if (fs.existsSync(agentsDir)) {
      const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (isSpeccrewFile(entry.name)) {
          agentCount++;
        }
      }
    }

    // Count skills
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

  // Check if config file exists (new and old paths)
  const oldRcPath = path.join(projectRoot, '.speccrewrc');
  const hasNewRc = fs.existsSync(newRcPath);
  const hasOldRc = fs.existsSync(oldRcPath);
  const hasRcFile = hasNewRc || hasOldRc;

  // Check if workspace exists
  const workspaceDir = path.join(projectRoot, 'speccrew-workspace');
  const hasWorkspace = fs.existsSync(workspaceDir);

  // Display content to be deleted
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

  // Ask user for confirmation
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

      // Execute uninstall
      const result = performUninstall(projectRoot, idePaths, isAll, hasOldRc);
      resolve(result);
    });
  });
}

function performUninstall(projectRoot, idePaths, isAll, hasOldRc) {
  let removedAgents = 0;
  let removedSkills = 0;

  // Calculate total steps
  const totalSteps = isAll ? 4 : 3;
  let currentStep = 0;

  // Delete agents
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

  // Delete skills
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

  // Delete config files
  currentStep++;
  process.stdout.write(`[${currentStep}/${totalSteps}] Removing configuration... `);

  // Delete config file at new path
  const newRcPath = path.join(projectRoot, 'speccrew-workspace', '.speccrewrc');
  if (fs.existsSync(newRcPath)) {
    fs.unlinkSync(newRcPath);
  }

  // Compatibility: Delete config file at old path
  const oldRcPath = path.join(projectRoot, '.speccrewrc');
  if (fs.existsSync(oldRcPath)) {
    fs.unlinkSync(oldRcPath);
  }

  console.log('done');

  // If --all, delete workspace
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

// Get IDE config (simplified version, avoid circular dependency)
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
