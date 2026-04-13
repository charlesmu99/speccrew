#!/usr/bin/env node
/**
 * reindex-modules.js - Deterministic script to re-extract module names from existing features JSON with updated exclude_dirs
 * 
 * Usage:
 *   node reindex-modules.js --featuresFile "path/to/features-backend-system.json" --projectRoot "d:\dev\ruoyi-vue-pro"
 * 
 * Optional parameters:
 *   --platformType "backend" - If not provided, read from features JSON's platformType field
 *   --techIdentifier "spring" - If not provided, try to infer from features JSON (e.g., techStack array)
 *   --excludeDirs "controller,admin,api,service" - If not provided, load from tech-stack-mappings.json
 */

const fs = require('fs');
const path = require('path');

// === Utility functions (reused from generate-inventory.js) ===

function normalizePath(filePath) {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/');
}

function parseArrayParam(value) {
  if (!value) return [];
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed); } catch (e) {
      return trimmed.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

// Java/Kotlin standard source path prefixes
const STANDARD_SOURCE_PREFIXES = [
  'src/main/java',
  'src/main/kotlin',
  'src/main/scala',
  'src/main/groovy',
  'src/main/resources',
  'src/test/java',
  'src/test/kotlin',
];

/**
 * Fallback exclude_dirs when tech-stack-mappings.json is missing or incomplete.
 * Covers the most common container directories across all platforms.
 */
const FALLBACK_EXCLUDE_DIRS = {
  web: ["src", "views", "pages", "components", "composables", "hooks", "utils", "mixins", "directives"],
  mobile: ["src", "views", "pages", "components", "composables", "hooks", "utils", "mixins", "directives"],
  backend: ["controller", "controllers", "admin", "app", "api", "service", "services", "repository", "repositories", "dao", "dal", "mysql", "redis", "dataobject", "entity", "entities", "model", "models", "dto", "dtos", "vo", "vos", "mapper", "mappers", "convert", "converter", "converters", "config", "configs", "util", "utils", "common", "exception", "exceptions", "enums", "framework", "job", "mq", "listener", "listeners", "producer", "consumer"],
};

function getModuleName(dirPath, excludeDirs, fallbackModuleName) {
  let normalized = normalizePath(dirPath);
  
  // Strip standard source directory prefixes (Java/Kotlin/etc.)
  for (const prefix of STANDARD_SOURCE_PREFIXES) {
    if (normalized.startsWith(prefix + '/')) {
      normalized = normalized.slice(prefix.length + 1);
      break;
    }
  }
  
  const parts = normalized.split('/').filter(p => p && p !== '.');
  
  for (const part of parts) {
    if (!excludeDirs.includes(part)) {
      return part;
    }
  }
  
  // All parts were excluded (e.g., "src/utils/helper.ts" with src and utils both excluded)
  // Return "_root" to indicate framework/root-level files, NOT the original module name
  return '_root';
}

// === Helper functions ===

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && i + 1 < argv.length) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1];
      i++;
    }
  }
  return args;
}

/**
 * Find project root by searching upward for speccrew-workspace directory
 */
function findProjectRoot(startPath) {
  let currentDir = path.resolve(startPath);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const workspaceDir = path.join(currentDir, 'speccrew-workspace');
    if (fs.existsSync(workspaceDir) && fs.statSync(workspaceDir).isDirectory()) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // Fallback: return start path's parent directory
  return path.dirname(path.resolve(startPath));
}

function loadExcludeDirs(projectRoot, platformType, techIdentifier, featuresData) {
  console.log(`Loading exclude_dirs: platformType="${platformType}", techIdentifier="${techIdentifier || '(auto)'}"`);
  
  // Try to infer techIdentifier
  if (!techIdentifier) {
    const techStack = featuresData.techStack || [];
    // Common mappings
    const techMap = {
      'spring': 'spring', 'spring-boot': 'spring', 'java': 'spring',
      'vue': 'vue', 'vue3': 'vue', 'vue2': 'vue',
      'react': 'react', 'next': 'nextjs', 'nextjs': 'nextjs',
      'angular': 'angular',
      'uniapp': 'uniapp', 'uni-app': 'uniapp',
      'flutter': 'flutter',
      'react-native': 'react-native',
    };
    for (const tech of techStack) {
      const lower = tech.toLowerCase();
      if (techMap[lower]) {
        techIdentifier = techMap[lower];
        console.log(`Inferred techIdentifier from techStack "${tech}": "${techIdentifier}"`);
        break;
      }
    }
  }
  
  if (!platformType || !techIdentifier) {
    console.warn('WARNING: Cannot determine platformType/techIdentifier for exclude_dirs lookup');
    // Return fallback even when platformType/techIdentifier unknown
    const fallbackDirs = FALLBACK_EXCLUDE_DIRS[platformType] || [];
    console.log(`Using fallback exclude_dirs (${fallbackDirs.length}): ${fallbackDirs.slice(0, 5).join(', ')}...`);
    return { excludeDirs: fallbackDirs, stripModulePrefixes: [] };
  }

  // Get fallback dirs for this platformType
  const fallback = FALLBACK_EXCLUDE_DIRS[platformType] || [];
  
  // Find tech-stack-mappings.json
  const configPaths = [
    path.join(projectRoot, 'speccrew-workspace', 'docs', 'configs', 'tech-stack-mappings.json'),
    path.join(projectRoot, 'docs', 'configs', 'tech-stack-mappings.json'),
  ];

  let loadedDirs = [];
  let globalDirs = [];
  let stripModulePrefixes = [];
  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Load tech-stack-specific exclude_dirs
        if (config.tech_stacks &&
            config.tech_stacks[platformType] &&
            config.tech_stacks[platformType][techIdentifier]) {
          const techConfig = config.tech_stacks[platformType][techIdentifier];
          if (techConfig.exclude_dirs) {
            loadedDirs = techConfig.exclude_dirs;
          }
          // Load strip_module_prefixes
          if (techConfig.strip_module_prefixes) {
            stripModulePrefixes = techConfig.strip_module_prefixes;
          }
        }
        
        // Load global exclude_dirs (applies to all platforms)
        globalDirs = config.global_exclude_dirs || [];
        
        if (loadedDirs.length > 0 || globalDirs.length > 0) {
          console.log(`Loaded exclude_dirs from: ${configPath}`);
          break;
        }
      }
    } catch (e) {
      // continue to next path
    }
  }

  // MERGE: global + tech-specific + fallback — ensure critical container dirs are always included
  const merged = [...new Set([...globalDirs, ...loadedDirs, ...fallback])];
  
  if (loadedDirs.length === 0 && globalDirs.length === 0) {
    console.warn(`WARNING: No tech-stack-specific exclude_dirs found for ${platformType}/${techIdentifier}, using fallback`);
    console.log(`Fallback exclude_dirs (${fallback.length}): ${fallback.slice(0, 5).join(', ')}...`);
  } else {
    console.log(`Loaded exclude_dirs: ${globalDirs.length} global + ${loadedDirs.length} tech-specific (${platformType}/${techIdentifier})`);
    console.log(`Merged with fallback = ${merged.length} total dirs`);
  }

  if (stripModulePrefixes.length > 0) {
    console.log(`Loaded strip_module_prefixes: ${stripModulePrefixes.join(', ')}`);
  }

  return { excludeDirs: merged, stripModulePrefixes };
}

function extractPlatformId(featuresData) {
  // Extract platformId from first feature's documentPath
  // Format: "speccrew-workspace/knowledges/bizs/{platformId}/..."
  for (const feature of (featuresData.features || [])) {
    if (feature.documentPath) {
      const match = normalizePath(feature.documentPath).match(/knowledges\/bizs\/([^/]+)\//);
      if (match) return match[1];
    }
  }
  // If unable to extract, build from platformType-platformSubtype
  if (featuresData.platformType && featuresData.platformSubtype) {
    return `${featuresData.platformType}-${featuresData.platformSubtype}`;
  }
  return null;
}

// === Main logic ===

function main() {
  // 1. Parse command line arguments
  const args = parseArgs(process.argv.slice(2));
  const featuresFile = args.featuresFile;
  
  if (!featuresFile) {
    console.error('Error: --featuresFile is required');
    process.exit(1);
  }
  
  // 2. Read features JSON
  let featuresData;
  try {
    featuresData = JSON.parse(fs.readFileSync(featuresFile, 'utf8'));
  } catch (e) {
    console.error(`Error: Failed to read/parse features file: ${e.message}`);
    process.exit(1);
  }
  
  // Auto-detect projectRoot from featuresFile if not provided
  const projectRoot = args.projectRoot || findProjectRoot(featuresFile);
  console.log(`Project root: ${projectRoot}`);
  
  const inventorySourcePath = normalizePath(featuresData.sourcePath || '');
  const platformType = args.platformType || featuresData.platformType || '';
  
  // 3. Load exclude_dirs
  let excludeDirs = [];
  let stripModulePrefixes = [];
  if (args.excludeDirs) {
    excludeDirs = parseArrayParam(args.excludeDirs);
  } else {
    // Load from tech-stack-mappings.json, determine techIdentifier by priority:
    // 1. Command line parameter --techIdentifier
    // 2. techIdentifier in features JSON
    // 3. platformSubtype in features JSON (backward compatibility)
    const techId = args.techIdentifier || featuresData.techIdentifier || featuresData.platformSubtype;
    const config = loadExcludeDirs(projectRoot, platformType, techId, featuresData);
    excludeDirs = config.excludeDirs;
    stripModulePrefixes = config.stripModulePrefixes;
  }
  
  if (excludeDirs.length === 0) {
    console.error('Warning: exclude_dirs is empty, module names may not be optimal');
  }
  
  console.log(`Platform: ${platformType}`);
  console.log(`Exclude dirs (${excludeDirs.length}): ${excludeDirs.join(', ')}`);
  console.log(`Total features: ${featuresData.features.length}`);
  
  // 4. Recalculate module for each feature
  const modulesBefore = [...new Set(featuresData.features.map(f => f.module))].sort();
  let reclassifiedCount = 0;
  
  // Get platformId from features JSON (for rebuilding documentPath)
  // platformId format: "{platformType}-{platformSubtype}"
  // Extract from existing documentPath: "speccrew-workspace/knowledges/bizs/{platformId}/..."
  const platformId = extractPlatformId(featuresData);
  
  featuresData.features.forEach(feature => {
    // Calculate feature source file path relative to inventorySourcePath
    let relativePath = normalizePath(feature.sourcePath || '');
    
    // If feature.sourcePath is absolute or relative to project root, remove inventorySourcePath prefix
    if (inventorySourcePath && relativePath.startsWith(inventorySourcePath)) {
      relativePath = relativePath.slice(inventorySourcePath.length);
      if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);
    }
    // inventorySourcePath may only partially match
    else if (inventorySourcePath) {
      const invParts = inventorySourcePath.split('/');
      const relParts = relativePath.split('/');
      // Find overlapping part
      let startIdx = 0;
      for (let i = 0; i < relParts.length; i++) {
        if (relParts.slice(i, i + invParts.length).join('/') === inventorySourcePath) {
          startIdx = i + invParts.length;
          break;
        }
      }
      if (startIdx > 0) {
        relativePath = relParts.slice(startIdx).join('/');
      }
    }
    
    // Get directory part (remove filename)
    const dirPath = path.dirname(relativePath).replace(/\\/g, '/');
    
    // Re-extract module name using getModuleName
    const fallback = feature.module || '_root';
    let newModule = getModuleName(dirPath, excludeDirs, fallback);
    
    // Apply strip_module_prefixes prefix removal
    for (const prefix of stripModulePrefixes) {
      if (newModule.startsWith(prefix)) {
        newModule = newModule.substring(prefix.length);
        break;
      }
    }
    
    if (newModule !== feature.module) {
      reclassifiedCount++;
      feature.module = newModule;
      
      // Rebuild documentPath (use fileName instead of feature.id to avoid long filenames)
      if (platformId) {
        feature.documentPath = `speccrew-workspace/knowledges/bizs/${platformId}/${newModule}/${feature.fileName}.md`;
      }
    }
  });
  
  // 5. Update modules array
  const modulesAfter = [...new Set(featuresData.features.map(f => f.module))].sort();
  featuresData.modules = modulesAfter;
  
  // 6. Write back to file
  fs.writeFileSync(featuresFile, JSON.stringify(featuresData, null, 2), 'utf8');
  
  // 7. Output results
  const result = {
    status: 'success',
    modules_before: modulesBefore,
    modules_after: modulesAfter,
    reclassified_count: reclassifiedCount,
    total_features: featuresData.features.length
  };
  
  console.log('\n=== Reindex Result ===');
  console.log(JSON.stringify(result, null, 2));
}

main();
