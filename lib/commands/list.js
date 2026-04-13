const fs = require('fs');
const path = require('path');
const { readSpeccrewRC, getPackageVersion, isSpeccrewFile } = require('../utils');

function run(projectRoot, args) {
  // Check if initialized
  const rc = readSpeccrewRC(projectRoot);
  if (!rc) {
    console.log('SpecCrew is not initialized in this project.');
    console.log('Run "speccrew init" to initialize.');
    return false;
  }

  const version = getPackageVersion();
  const ides = rc.ide ? (Array.isArray(rc.ide) ? rc.ide : [rc.ide]) : [];
  const ideNames = ides.map(id => {
    const names = { qoder: 'Qoder', cursor: 'Cursor' };
    return names[id] || id;
  });
  const ideDisplay = ideNames.length > 0 ? ideNames.join(', ') : 'Unknown';
  const ideDirs = ides.map(id => {
    const dirs = { qoder: '.qoder/', cursor: '.cursor/' };
    return dirs[id] || `.${id}/`;
  });

  console.log(`SpecCrew v${version} | IDE: ${ideDisplay} (${ideDirs.join(', ')})\n`);

  // Collect all agents and skills
  const speccrewAgents = new Set();
  const speccrewSkills = new Set();
  const userAgents = new Set();
  const userSkills = new Set();

  for (const ideId of ides) {
    const ideConfig = getIDEConfig(ideId);
    if (!ideConfig) continue;

    // Scan agents
    const agentsDir = path.join(projectRoot, ideConfig.agentsDir);
    if (fs.existsSync(agentsDir)) {
      const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
      for (const entry of entries) {
        const name = entry.name;
        if (isSpeccrewFile(name)) {
          speccrewAgents.add(name.replace(/\.md$/, ''));
        } else if (!name.startsWith('.') && entry.isDirectory()) {
          userAgents.add(`${ideConfig.agentsDir}/${name}`);
        }
      }
    }

    // Scan skills
    const skillsDir = path.join(projectRoot, ideConfig.skillsDir);
    if (fs.existsSync(skillsDir)) {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        const name = entry.name;
        if (isSpeccrewFile(name)) {
          speccrewSkills.add(name);
        } else if (!name.startsWith('.') && entry.isDirectory()) {
          userSkills.add(`${ideConfig.skillsDir}/${name}`);
        }
      }
    }
  }

  // Output Agents
  const sortedAgents = Array.from(speccrewAgents).sort();
  console.log(`Agents (${sortedAgents.length}):`);
  for (const agent of sortedAgents) {
    console.log(`  ${agent}`);
  }
  console.log('');

  // Output Skills
  const sortedSkills = Array.from(speccrewSkills).sort();
  console.log(`Skills (${sortedSkills.length}):`);
  for (const skill of sortedSkills) {
    console.log(`  ${skill}`);
  }
  console.log('');

  // Output user-defined content
  const allUserDefined = [...Array.from(userAgents), ...Array.from(userSkills)].sort();
  if (allUserDefined.length > 0) {
    console.log('User-defined:');
    for (const item of allUserDefined) {
      console.log(`  ${item}`);
    }
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
