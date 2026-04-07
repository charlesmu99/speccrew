#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get package version
function getPackageVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (e) {
    return 'unknown';
  }
}

// Get npm package root directory
function getPackageRoot() {
  return path.resolve(__dirname, '..');
}

// Check if a path is a speccrew file (starts with speccrew-)
function isSpeccrewFile(name) {
  return name.startsWith('speccrew-');
}

// Count agents and skills in the package
function countPackageResources(packageRoot) {
  let agentCount = 0;
  let skillCount = 0;

  const agentsDir = path.join(packageRoot, '.speccrew', 'agents');
  const skillsDir = path.join(packageRoot, '.speccrew', 'skills');

  if (fs.existsSync(agentsDir)) {
    const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
    agentCount = entries.filter(e => isSpeccrewFile(e.name)).length;
  }

  if (fs.existsSync(skillsDir)) {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    skillCount = entries.filter(e => isSpeccrewFile(e.name)).length;
  }

  return { agentCount, skillCount };
}

// Detect IDE directories in the project
function detectIDE(projectRoot) {
  const ideConfigs = [
    { id: 'qoder', name: 'Qoder', baseDir: '.qoder' },
    { id: 'cursor', name: 'Cursor', baseDir: '.cursor' },
    { id: 'claude', name: 'Claude', baseDir: '.claude' },
  ];

  const detected = [];
  for (const config of ideConfigs) {
    const basePath = path.join(projectRoot, config.baseDir);
    if (fs.existsSync(basePath)) {
      detected.push(config);
    }
  }
  return detected;
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

// Main postinstall logic
async function main() {
  const version = getPackageVersion();
  const packageRoot = getPackageRoot();

  // Get the project directory where npm install was run
  const initCwd = process.env.INIT_CWD;

  // If INIT_CWD is not set or doesn't exist, just show welcome message
  if (!initCwd || !fs.existsSync(initCwd)) {
    console.log(`\nSpecCrew v${version}\n`);
    console.log("Run 'speccrew init' in your project directory to get started.\n");
    return;
  }

  // Count resources in the package
  const { agentCount, skillCount } = countPackageResources(packageRoot);

  // Detect IDE in the project directory
  const detectedIDEs = detectIDE(initCwd);

  // Display welcome banner
  console.log(`\nSpecCrew v${version}\n`);

  // Display installation summary
  console.log('Installation Summary:');
  console.log(`  Project:   ${initCwd}`);

  if (detectedIDEs.length === 0) {
    console.log('  IDE:       Not detected (use --ide to specify)');
  } else if (detectedIDEs.length === 1) {
    console.log(`  IDE:       ${detectedIDEs[0].name} (${detectedIDEs[0].baseDir}/)`);
  } else {
    console.log(`  IDE:       ${detectedIDEs.map(i => i.name).join(', ')}`);
  }

  console.log(`  Agents:    ${agentCount} agents`);
  console.log(`  Skills:    ${skillCount} skills`);
  console.log(`  Workspace: speccrew-workspace/`);
  console.log(`  Docs:      README + Getting Started guides\n`);

  // Non-interactive environment check
  if (!process.stdin.isTTY) {
    console.log("Run 'speccrew init' in your project directory to complete installation.\n");
    return;
  }

  // No IDE detected - prompt user to specify
  if (detectedIDEs.length === 0) {
    console.log('No supported IDE detected in your project directory.');
    console.log("Run 'speccrew init --ide <name>' to specify an IDE.");
    console.log('Supported IDEs: qoder, cursor, claude\n');
    return;
  }

  // Ask for confirmation
  try {
    const confirmed = await askConfirm('Proceed with installation? (Y/n) ');

    if (confirmed) {
      // Import and run init
      const { runInit } = require('../lib/commands/init.js');
      await runInit({ projectRoot: initCwd, skipConfirm: true });
    } else {
      console.log('\nInstallation skipped. You can run \'speccrew init\' later in your project directory.\n');
    }
  } catch (error) {
    console.log(`\nInstallation skipped. You can run 'speccrew init' later in your project directory.\n`);
  }
}

// Run main with error handling - postinstall failures should not block npm install
main().catch(() => {
  console.log('\nPostinstall hook encountered an issue. You can run \'speccrew init\' manually.\n');
});
