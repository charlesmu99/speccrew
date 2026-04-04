#!/usr/bin/env node

/**
 * Extract Module Summary Script
 * 
 * Extracts compact module summary from features JSON for LLM inference.
 * Run by Dispatch before delegating to Worker.
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : '';
      args[key] = value;
      if (value) i++;
    }
  }
  
  return args;
}

/**
 * Output error to stderr and exit with code 1
 */
function exitError(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Get the technology layer from a source path
 * Returns: 'controller', 'service', 'dal', 'api', 'manager', 'convert', or 'other'
 */
function getTechLayer(sourcePath) {
  if (!sourcePath) return 'other';
  
  const lowerPath = sourcePath.toLowerCase();
  
  // Check for common tech layer directories
  if (lowerPath.includes('/controller/') || lowerPath.includes('\\controller\\')) return 'controller';
  if (lowerPath.includes('/service/') || lowerPath.includes('\\service\\')) return 'service';
  if (lowerPath.includes('/dal/') || lowerPath.includes('\\dal\\')) return 'dal';
  if (lowerPath.includes('/api/') || lowerPath.includes('\\api\\')) return 'api';
  if (lowerPath.includes('/manager/') || lowerPath.includes('\\manager\\')) return 'manager';
  if (lowerPath.includes('/convert/') || lowerPath.includes('\\convert\\')) return 'convert';
  
  return 'other';
}

/**
 * Select representative sample paths for a module
 * Prioritizes different tech layers (controller, service, dal, etc.)
 * Returns max 3 paths
 */
function selectSamplePaths(features) {
  // Group paths by tech layer
  const layers = {
    controller: [],
    service: [],
    dal: [],
    api: [],
    manager: [],
    convert: [],
    other: []
  };
  
  for (const feature of features) {
    const sourcePath = feature.sourcePath;
    if (!sourcePath) continue;
    
    const layer = getTechLayer(sourcePath);
    layers[layer].push(sourcePath);
  }
  
  // Select up to 3 samples, prioritizing different layers
  // Priority: controller > service > dal > api > manager > convert > other
  const priorityOrder = ['controller', 'service', 'dal', 'api', 'manager', 'convert', 'other'];
  const selected = [];
  
  for (const layer of priorityOrder) {
    if (layers[layer].length > 0 && selected.length < 3) {
      // Take the first path from this layer
      selected.push(layers[layer][0]);
    }
    if (selected.length >= 3) break;
  }
  
  return selected;
}

/**
 * Main function
 */
function main() {
  const args = parseArgs();
  
  // Validate required parameter
  if (!args.featuresFile) {
    exitError('Error: Missing required parameter --featuresFile');
  }
  
  const featuresFile = args.featuresFile;
  
  // Read features file
  let featuresData;
  try {
    const content = fs.readFileSync(featuresFile, 'utf-8');
    featuresData = JSON.parse(content);
  } catch (e) {
    if (e.code === 'ENOENT') {
      exitError(`Error: Features file not found: ${featuresFile}`);
    } else if (e instanceof SyntaxError) {
      exitError(`Error: Invalid JSON in features file: ${e.message}`);
    } else {
      exitError(`Error: Failed to read features file: ${e.message}`);
    }
  }
  
  // Validate features data structure
  if (!featuresData || typeof featuresData !== 'object') {
    exitError('Error: Invalid features data: expected object');
  }
  if (!Array.isArray(featuresData.features)) {
    exitError('Error: Invalid features data: missing or invalid features array');
  }
  
  // Extract platform info from features data
  const platformType = featuresData.platformType || 'unknown';
  const platformSubtype = featuresData.platformSubtype || 'unknown';
  
  // Group features by module
  const moduleGroups = {};
  for (const feature of featuresData.features) {
    const moduleName = feature.module || '_unclassified';
    if (!moduleGroups[moduleName]) {
      moduleGroups[moduleName] = [];
    }
    moduleGroups[moduleName].push(feature);
  }
  
  // Build module summaries
  const modules = [];
  for (const [moduleName, features] of Object.entries(moduleGroups)) {
    const summary = {
      name: moduleName,
      featureCount: features.length,
      sampleSourcePaths: selectSamplePaths(features)
    };
    modules.push(summary);
  }
  
  // Sort by featureCount descending
  modules.sort((a, b) => b.featureCount - a.featureCount);
  
  // Build output
  const output = {
    platformType: platformType,
    platformSubtype: platformSubtype,
    totalFeatures: featuresData.features.length,
    modules: modules
  };
  
  // Output JSON to stdout
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

// Run main function
main();
