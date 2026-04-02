#!/usr/bin/env node

const path = require('path');
const command = process.argv[2];
const args = process.argv.slice(3);
const projectRoot = process.cwd();

function printUsage() {
  console.log(`
SpecCrew - Spec-Driven Development toolkit for AI-powered IDEs

Usage: speccrew <command> [options]

Commands:
  init        Initialize SpecCrew in the current project
  update      Update SpecCrew agents and skills
  doctor      Check environment and installation health
  uninstall   Remove SpecCrew from the current project
  list        List installed agents and skills

Options:
  --help      Show help
  --version   Show version

Examples:
  speccrew init --ide qoder
  speccrew update
  speccrew doctor
`);
}

switch (command) {
  case 'init':
    require('../lib/commands/init').run();
    break;
  case 'update':
    require('../lib/commands/update').run();
    break;
  case 'doctor':
    require('../lib/commands/doctor').run(projectRoot, args);
    break;
  case 'uninstall':
    require('../lib/commands/uninstall').run(projectRoot, args);
    break;
  case 'list':
    require('../lib/commands/list').run(projectRoot, args);
    break;
  case '--version':
  case '-v':
    const pkg = require('../package.json');
    console.log(pkg.version);
    break;
  case '--help':
  case '-h':
  case undefined:
    printUsage();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
