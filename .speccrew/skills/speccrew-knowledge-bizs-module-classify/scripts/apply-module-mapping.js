#!/usr/bin/env node

/**
 * Apply Module Mapping Script
 * 
 * Updates features JSON file based on module mapping.
 * Supports both JSON and key:value comma-separated format for mapping parameter.
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
 * Parse mapping parameter - supports both JSON and key:value comma-separated format
 * JSON: '{"auth":"authentication","util":"_common"}'
 * Key-value: "auth:authentication,util:_common"  (recommended for PowerShell)
 */
function parseMapping(value) {
  if (!value) return {};
  
  const trimmed = value.trim();
  
  // Try JSON format first
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      // JSON parse failed, fall through to key:value parsing
    }
  }
  
  // Parse comma-separated key:value pairs
  const result = {};
  trimmed.split(',').forEach(pair => {
    const separatorIndex = pair.indexOf(':');
    if (separatorIndex > 0) {
      const key = pair.slice(0, separatorIndex).trim();
      const val = pair.slice(separatorIndex + 1).trim();
      if (key && val) {
        result[key] = val;
      }
    }
  });
  
  return result;
}

/**
 * Output error and exit
 */
function exitError(message) {
  console.error(JSON.stringify({
    status: 'error',
    message: message
  }, null, 2));
  process.exit(1);
}

/**
 * Main function
 */
function main() {
  const args = parseArgs();
  
  // Validate required parameters
  if (!args.featuresFile) {
    exitError('Missing required parameter: --featuresFile');
  }
  if (!args.mapping) {
    exitError('Missing required parameter: --mapping');
  }
  if (!args.platformId) {
    exitError('Missing required parameter: --platformId');
  }
  
  const featuresFile = args.featuresFile;
  const platformId = args.platformId;
  
  // Parse mapping
  const mapping = parseMapping(args.mapping);
  if (Object.keys(mapping).length === 0) {
    exitError('Failed to parse mapping parameter. Expected JSON or key:value comma-separated format.');
  }
  
  // Read features file
  let featuresData;
  try {
    const content = fs.readFileSync(featuresFile, 'utf-8');
    featuresData = JSON.parse(content);
  } catch (e) {
    if (e.code === 'ENOENT') {
      exitError(`Features file not found: ${featuresFile}`);
    } else if (e instanceof SyntaxError) {
      exitError(`Invalid JSON in features file: ${e.message}`);
    } else {
      exitError(`Failed to read features file: ${e.message}`);
    }
  }
  
  // Validate features data structure
  if (!featuresData || typeof featuresData !== 'object') {
    exitError('Invalid features data: expected object');
  }
  if (!Array.isArray(featuresData.features)) {
    exitError('Invalid features data: missing or invalid features array');
  }
  
  // Store original modules for comparison
  const modulesBefore = [...(featuresData.modules || [])];
  
  // Track reclassification count
  let reclassifiedCount = 0;
  const reclassifiedModules = new Set();
  
  // Process all features
  const updatedFeatures = featuresData.features.map(feature => {
    const oldModule = feature.module;
    
    // Check if this feature's module needs to be updated
    if (oldModule && mapping.hasOwnProperty(oldModule)) {
      const newModule = mapping[oldModule];
      reclassifiedCount++;
      reclassifiedModules.add(oldModule);
      
      // Rebuild documentPath (use fileName instead of feature.id to avoid long filenames)
      const newDocumentPath = `speccrew-workspace/knowledges/bizs/${platformId}/${newModule}/${feature.fileName}.md`;
      
      return {
        ...feature,
        module: newModule,
        documentPath: newDocumentPath
      };
    }
    
    return feature;
  });
  
  // Rebuild modules array (unique and sorted)
  const allModules = new Set();
  updatedFeatures.forEach(feature => {
    if (feature.module) {
      allModules.add(feature.module);
    }
  });
  const modulesAfter = Array.from(allModules).sort();
  
  // Calculate analyzed and pending counts
  const analyzedCount = updatedFeatures.filter(f => f.analyzed === true).length;
  const pendingCount = updatedFeatures.length - analyzedCount;
  
  // Build updated data
  const updatedData = {
    ...featuresData,
    features: updatedFeatures,
    modules: modulesAfter,
    analyzedCount: analyzedCount,
    pendingCount: pendingCount,
    updatedAt: new Date().toISOString()
  };
  
  // Preserve createdAt if it exists
  if (!updatedData.createdAt) {
    updatedData.createdAt = featuresData.updatedAt || new Date().toISOString();
  }
  
  // Write back to file
  try {
    fs.writeFileSync(featuresFile, JSON.stringify(updatedData, null, 2), 'utf-8');
  } catch (e) {
    exitError(`Failed to write features file: ${e.message}`);
  }
  
  // Output result
  const result = {
    status: 'success',
    modules_before: modulesBefore,
    modules_after: modulesAfter,
    reclassified_count: reclassifiedCount,
    total_features: updatedFeatures.length,
    mapping_applied: mapping
  };
  
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// Run main function
main();
