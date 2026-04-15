#!/usr/bin/env node
/**
 * Generate features.json for UI feature analysis
 *
 * Scans source directory for page files and generates a flat feature list with analysis status tracking.
 * All configuration is passed via parameters - the script does not infer anything.
 *
 * Usage: node generate-inventory.js --sourcePath <path> --outputFileName <name> --platformName <name> --platformType <type> --techStack <json> --fileExtensions <json> [--platformSubtype <subtype>] [--techIdentifier <identifier>] [--analysisMethod <method>] [--excludeDirs <json>] [--includeDataObjects <true|false>] [--outputDir <dir>]
 *     Array parameters (--techStack, --fileExtensions, --excludeDirs) accept both JSON format and comma-separated format.
 *
 * Whitelist Mode (using --entryDirsFile):
 *   When --entryDirsFile is provided, the script operates in whitelist mode:
 *   - Reads entry-dirs JSON file with platformId, sourcePath, and modules array
 *   - Loads platform config from platform-mapping.json
 *   - Scans only the specified entryDirs for each module
 *   - Generates features-{platformId}.json
 *
 * Data Object Exclusion (backend only):
 *   By default, files ending with configured suffixes (e.g., VO/DTO/DO/Entity/Convert for Spring) are excluded for backend platforms.
 *   The suffixes are read from tech-stack-mappings.json (exclude_file_suffixes field).
 *   Use --includeDataObjects true to include them.
 *
 * Output Directory (--outputDir):
 *   By default, the script uses findProjectRoot() to locate the project root and outputs to:
 *   <projectRoot>/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/
 *   Use --outputDir to explicitly specify the output directory, bypassing findProjectRoot().
 *
 * Example (full scan mode):
 *   node generate-inventory.js \
 *     --sourcePath "src/views" \
 *     --outputFileName "features-web.json" \
 *     --platformName "Web Frontend" \
 *     --platformType "web" \
 *     --platformSubtype "vue" \
 *     --techIdentifier "vue" \
 *     --techStack "vue,typescript" \
 *     --fileExtensions ".vue,.ts" \
 *     --analysisMethod "ui-based" \
 *     --excludeDirs "components,composables,hooks,utils"
 *
 * Example (whitelist mode):
 *   node generate-inventory.js \
 *     --entryDirsFile "entry-dirs.json"
 *
 * entry-dirs.json format:
 *   {
 *     "platformId": "backend-ai",
 *     "platformName": "AI Module Backend",
 *     "platformType": "backend",
 *     "platformSubtype": "ai",
 *     "sourcePath": "yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai",
 *     "techStack": ["spring-boot", "mybatis-plus"],
 *     "modules": [
 *       { "name": "chat", "entryDirs": ["controller/admin/chat"] },
 *       { "name": "image", "entryDirs": ["controller/admin/image"] }
 *     ]
 *   }
 *
 *   Optional fields (auto-inferred if missing):
 *   - platformName: defaults to "{platformType}-{platformSubtype}"
 *   - platformType: inferred from platformId (e.g., "backend-ai" → "backend")
 *   - platformSubtype: inferred from platformId (e.g., "backend-ai" → "ai")
 *   - techStack: defaults based on platformType (backend→["spring-boot"], web→["vue"], mobile→["uniapp"])
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse array parameter that supports both JSON format and comma-separated format.
 * JSON format: '["vue","typescript"]'
 * Comma-separated format: "vue,typescript"  (recommended for PowerShell compatibility)
 */
function parseArrayParam(value) {
  // Handle boolean true (from flag-only args like --excludeDirs without value)
  if (value === true) return [];
  if (!value) return [];
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      // PowerShell may strip quotes: [vue,typescript] → parse as comma-separated
      return trimmed.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      // Accept empty string "" as valid value, only skip if undefined or next arg is a flag
      if (value !== undefined && !value.startsWith('--')) {
        params[key] = value;
        i++;
      } else {
        params[key] = true;
      }
    }
  }

  return params;
}

/**
 * Parse boolean parameter from string value
 * @param {string|boolean} value - Parameter value
 * @param {boolean} defaultValue - Default value if not provided
 * @returns {boolean} Parsed boolean value
 */
function parseBooleanParam(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return defaultValue;
}

// Normalize path separators to forward slashes
function normalizePath(filePath) {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/');
}

// Find project root by searching upward for speccrew-workspace directory
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

  // Fallback: return source path's drive root
  return root;
}

// Check if path contains any excluded directory
function isExcludedPath(filePath, excludeDirs) {
  const parts = normalizePath(filePath).split('/').filter(p => p);
  for (const part of parts) {
    if (excludeDirs.includes(part)) {
      return true;
    }
  }
  return false;
}

// Check if file is a data object class (VO/DTO/DO/Entity/Convert) - should be excluded for backend
function isDataObjectFile(fileName, extension, excludeSuffixes) {
  // If no suffixes configured, don't exclude any files
  if (!excludeSuffixes || excludeSuffixes.length === 0) {
    return false;
  }
  // Check if fileName ends with any configured suffix
  for (const suffix of excludeSuffixes) {
    if (fileName.endsWith(suffix)) {
      return true;
    }
  }
  return false;
}

// Check if file name matches exact exclusion list (e.g., package-info)
function isExcludedFileName(fileName, excludeFileNames) {
  if (!excludeFileNames || excludeFileNames.length === 0) {
    return false;
  }
  return excludeFileNames.includes(fileName);
}

// Get module name (first non-excluded directory level)
function getModuleName(dirPath, excludeDirs, fallbackModuleName) {
  const parts = normalizePath(dirPath).split('/').filter(p => p && p !== '.');
  for (const part of parts) {
    if (!excludeDirs.includes(part)) {
      return part;
    }
  }
  // All parts were excluded (e.g., "src/App.vue" with src excluded)
  // Return "_root" to indicate framework/root-level files
  return '_root';
}

/**
 * Load platform configuration from platform-mapping.json
 * @param {string} platformId - Platform ID like "backend-ai", "web-vue"
 * @param {string} projectRoot - Project root directory
 * @returns {object|null} Platform config with platformName, platformType, techStack, extensions, or null if not found
 */
function loadPlatformConfig(platformId, projectRoot) {
  const configPath = path.join(projectRoot, 'speccrew-workspace', 'docs', 'configs', 'platform-mapping.json');
  if (!fs.existsSync(configPath)) {
    console.error(`Error: platform-mapping.json not found at ${configPath}`);
    return null;
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configContent);
  
  // Find platform mapping by platform_id
  const mapping = config.mappings.find(m => m.platform_id === platformId);
  if (!mapping) {
    console.error(`Error: Platform ID "${platformId}" not found in platform-mapping.json`);
    return null;
  }
  
  // Build platform config from mapping
  const platformConfig = {
    platformId: mapping.platform_id,
    platformType: mapping.platform_type,
    platformSubtype: mapping.platform_subtype || mapping.framework,
    framework: mapping.framework,
    platformName: `${mapping.platform_type}-${mapping.framework}` // Default name, can be customized
  };
  
  return platformConfig;
}

/**
 * Normalize tech identifier by removing common language prefixes.
 * @param {string} id - Tech identifier like "python-fastapi", "node-express"
 * @returns {string} Normalized identifier like "fastapi", "express"
 */
function normalizeTechIdentifier(id) {
  if (!id) return id;
  // Remove common language prefixes: python-, node-, java-, etc.
  const prefixes = ['python-', 'node-', 'java-', 'kotlin-', 'swift-', 'dart-', 'go-', 'rust-', 'php-', 'ruby-'];
  for (const prefix of prefixes) {
    if (id.toLowerCase().startsWith(prefix)) {
      return id.substring(prefix.length);
    }
  }
  return id;
}

/**
 * Load tech stack configuration from tech-stack-mappings.json
 * @param {string} platformType - Platform type like "backend", "web"
 * @param {string} framework - Framework like "spring", "vue"
 * @param {string} projectRoot - Project root directory
 * @returns {object} Tech config with extensions and exclude_file_suffixes
 */
function loadTechStackConfig(platformType, framework, projectRoot) {
  const configPath = path.join(projectRoot, 'speccrew-workspace', 'docs', 'configs', 'tech-stack-mappings.json');
  if (!fs.existsSync(configPath)) {
    console.error(`Warning: tech-stack-mappings.json not found at ${configPath}`);
    return { extensions: [], exclude_file_suffixes: [] };
  }

  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configContent);

  // Try exact match first
  let techConfig = null;
  if (config.tech_stacks &&
      config.tech_stacks[platformType] &&
      config.tech_stacks[platformType][framework]) {
    techConfig = config.tech_stacks[platformType][framework];
  }

  // If not found, try normalized identifier (remove language prefix)
  if (!techConfig) {
    const normalizedFramework = normalizeTechIdentifier(framework);
    if (normalizedFramework !== framework &&
        config.tech_stacks &&
        config.tech_stacks[platformType] &&
        config.tech_stacks[platformType][normalizedFramework]) {
      techConfig = config.tech_stacks[platformType][normalizedFramework];
      console.log(`Using normalized tech identifier: ${framework} → ${normalizedFramework}`);
    }
  }

  if (techConfig) {
    return {
      extensions: techConfig.extensions || [],
      exclude_file_suffixes: techConfig.exclude_file_suffixes || [],
      exclude_file_names: techConfig.exclude_file_names || []
    };
  }

  return { extensions: [], exclude_file_suffixes: [], exclude_file_names: [] };
}

/**
 * Infer platform info from platformId
 * @param {string} platformId - Platform ID like "backend-ai", "web-vue", "mobile-uniapp"
 * @returns {object} Inferred platform info { platformType, platformSubtype }
 */
function inferPlatformInfo(platformId) {
  // Parse platformId: "{type}-{subtype}" format
  const parts = platformId.split('-');
  if (parts.length >= 2) {
    return {
      platformType: parts[0],
      platformSubtype: parts.slice(1).join('-')
    };
  }
  // Fallback: treat entire platformId as type
  return {
    platformType: platformId,
    platformSubtype: ''
  };
}

/**
 * Infer framework from techStack array
 * @param {string[]} techStack - Array of tech stack names
 * @returns {string} Framework identifier like "spring", "vue", "uniapp"
 */
function inferFrameworkFromTechStack(techStack) {
  if (!techStack || techStack.length === 0) {
    return '';
  }

  // Mapping: tech stack name → framework identifier
  const techToFramework = {
    // Backend
    'spring-boot': 'spring',
    'spring': 'spring',
    'springboot': 'spring',
    'mybatis-plus': 'spring',
    'mybatis': 'spring',
    'jpa': 'spring',
    // Frontend
    'vue': 'vue',
    'vue3': 'vue',
    'vue2': 'vue',
    'react': 'react',
    'reactjs': 'react',
    'nextjs': 'next',
    'next.js': 'next',
    'angular': 'angular',
    // Mobile
    'uniapp': 'uniapp',
    'uni-app': 'uniapp',
    'flutter': 'flutter',
    'react-native': 'react-native',
    'reactnative': 'react-native'
  };

  // Platform-specific frameworks have higher priority than generic ones
  const platformSpecific = new Set(['uniapp', 'flutter', 'react-native', 'next']);

  // First pass: look for platform-specific framework match
  for (const tech of techStack) {
    const normalizedTech = tech.toLowerCase();
    const framework = techToFramework[normalizedTech];
    if (framework && platformSpecific.has(framework)) {
      return framework;
    }
  }

  // Second pass: fallback to first matching generic framework
  for (const tech of techStack) {
    const normalizedTech = tech.toLowerCase();
    if (techToFramework[normalizedTech]) {
      return techToFramework[normalizedTech];
    }
  }

  // Fallback: use first tech stack as framework
  return techStack[0].toLowerCase();
}

/**
 * Get default techStack for platformType
 * @param {string} platformType - Platform type like "backend", "web", "mobile"
 * @returns {string[]} Default tech stack array
 */
function getDefaultTechStack(platformType) {
  const defaults = {
    backend: ['spring-boot'],
    web: ['vue'],
    mobile: ['uniapp'],
    desktop: ['electron']
  };
  return defaults[platformType] || [];
}

/**
 * Find files in a specific entry directory (non-recursive, just the directory itself)
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to match
 * @param {string} baseDir - Base directory for relative paths
 * @returns {object[]} Array of file objects
 */
function findFilesInDir(dir, extensions, baseDir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        const relativePath = normalizePath(path.relative(baseDir, fullPath));
        files.push({
          fullPath,
          relativePath,
          fileName: path.basename(item, ext),
          extension: ext,
          directory: path.dirname(relativePath),
          lastModified: stat.mtime.toISOString()
        });
      }
    }
  }
  
  return files;
}

/**
 * Generate features.json from entry-dirs whitelist mode
 * @param {object} entryDirsData - Entry directories data from JSON file
 * @param {object} platformConfig - Platform configuration
 * @param {string} projectRoot - Project root directory
 * @param {string} outputDir - Output directory for features JSON
 * @returns {boolean} Success status
 */
function generateFromEntryDirs(entryDirsData, platformConfig, projectRoot, outputDir, overwrite) {
  const { platformId, sourcePath, modules } = entryDirsData;
  const { platformType, platformSubtype, framework } = platformConfig;
  
  // Load tech stack config for extensions and exclude_file_suffixes
  const techConfig = loadTechStackConfig(platformType, framework, projectRoot);
  const { extensions, exclude_file_suffixes, exclude_file_names } = techConfig;
  
  if (extensions.length === 0) {
    console.error(`Error: No extensions found for ${platformType}/${framework} in tech-stack-mappings.json`);
    return false;
  }
  
  console.log(`Whitelist mode: Platform ${platformId}`);
  console.log(`Source path: ${sourcePath}`);
  console.log(`Extensions: ${extensions.join(', ')}`);
  if (exclude_file_suffixes.length > 0) {
    console.log(`Exclude suffixes: ${exclude_file_suffixes.join(', ')}`);
  }
  
  // Resolve absolute source path
  const absoluteSourcePath = path.resolve(projectRoot, sourcePath);
  if (!fs.existsSync(absoluteSourcePath)) {
    console.error(`Error: Source path does not exist: ${absoluteSourcePath}`);
    return false;
  }
  
  // Collect all features
  const features = [];
  const moduleNames = [];
  
  for (const module of modules) {
    const { name: moduleName, entryDirs } = module;
    moduleNames.push(moduleName);
    
    for (const entryDir of entryDirs) {
      // entryDir is relative to sourcePath
      const entryFullPath = path.join(absoluteSourcePath, entryDir);
      
      if (!fs.existsSync(entryFullPath)) {
        console.log(`  Skipping non-existent entry: ${entryDir}`);
        continue;
      }
      
      // Scan files in the entry directory (recursive for web/mobile platforms with nested dirs)
      const excludeDirs = techConfig.exclude_dirs || [];
      const files = findFiles(entryFullPath, extensions, excludeDirs, absoluteSourcePath);
      
      for (const file of files) {
        // Apply exclude_file_suffixes filter
        if (isDataObjectFile(file.fileName, file.extension, exclude_file_suffixes)) {
          continue;
        }
        
        // Apply exclude_file_names filter (e.g., package-info)
        if (isExcludedFileName(file.fileName, exclude_file_names)) {
          continue;
        }
        
        // Build feature ID: moduleName-entryDirSegs-fileName
        // entryDir like "controller/admin/chat" → "controller-admin-chat"
        const entryDirNormalized = normalizePath(entryDir).replace(/[\/\\]/g, '-');
        const featureId = `${moduleName}-${entryDirNormalized}-${file.fileName}`;
        
        // Build relative file path from sourcePath
        const relativeFilePath = normalizePath(path.relative(projectRoot, file.fullPath));
        
        // Build document path
        const docPath = `speccrew-workspace/knowledges/bizs/${platformType}-${platformSubtype}/${moduleName}/${file.fileName}.md`;
        
        const feature = {
          id: featureId,
          fileName: file.fileName,
          sourcePath: relativeFilePath,
          documentPath: docPath,
          module: moduleName,
          lastModified: file.lastModified,
          analyzed: false,
          startedAt: null,
          completedAt: null,
          analysisNotes: null
        };
        features.push(feature);
      }
    }
  }
  
  console.log(`Found ${features.length} features across ${moduleNames.length} modules`);
  
  // Build inventory object
  const inventory = {
    platformId: platformId,
    platformName: platformConfig.platformName,
    platformType: platformType,
    sourcePath: sourcePath,
    techStack: [framework],
    modules: [...new Set(moduleNames)].sort(),
    totalFiles: features.length,
    analyzedCount: 0,
    pendingCount: features.length,
    generatedAt: new Date().toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '-'),
    analysisMethod: 'api-based',
    features: features
  };
  
  // Add platformSubtype if present
  if (platformSubtype) {
    inventory.platformSubtype = platformSubtype;
  }
  
  // Add techIdentifier
  inventory.techIdentifier = framework;
  
  // Write output file
  const outputFileName = `features-${platformId}.json`;
  const outputPath = path.join(outputDir, outputFileName);

  // Incremental: if features file already exists and overwrite is not set, write to *.new.json
  const actualOutputPath = (!overwrite && fs.existsSync(outputPath))
    ? outputPath.replace(/\.json$/, '.new.json')
    : outputPath;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(actualOutputPath, JSON.stringify(inventory, null, 2), 'utf8');

  if (actualOutputPath !== outputPath) {
    console.log(`Incremental: Generated ${path.basename(actualOutputPath)} (existing features detected)`);
  } else {
    console.log(`Full: Generated ${path.basename(actualOutputPath)} with ${features.length} features`);
  }
  console.log(`Output: ${actualOutputPath}`);
  
  return true;
}

// Recursively find all files matching extensions
function findFiles(dir, extensions, excludeDirs, baseDir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = normalizePath(path.relative(baseDir, fullPath));
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(item)) {
        continue;
      }
      files.push(...findFiles(fullPath, extensions, excludeDirs, baseDir));
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        files.push({
          fullPath,
          relativePath,
          fileName: path.basename(item, ext),
          extension: ext,
          directory: path.dirname(relativePath),
          lastModified: stat.mtime.toISOString()
        });
      }
    }
  }

  return files;
}

// Main function
function main() {
  const params = parseArgs();

  // Parse overwrite parameter (default: false for backward compatibility)
  const overwrite = parseBooleanParam(params.overwrite, false);

  // Check for whitelist mode (--entryDirsFile provided)
  if (params.entryDirsFile) {
    // Whitelist mode: scan only specified entry directories
    const entryDirsFilePath = path.resolve(params.entryDirsFile);
    
    if (!fs.existsSync(entryDirsFilePath)) {
      console.error(`Error: entryDirsFile does not exist: ${params.entryDirsFile}`);
      process.exit(1);
    }
    
    // Read entry-dirs JSON file
    let entryDirsData;
    try {
      const content = fs.readFileSync(entryDirsFilePath, 'utf8');
      entryDirsData = JSON.parse(content);
    } catch (e) {
      console.error(`Error: Failed to parse entryDirsFile: ${e.message}`);
      process.exit(1);
    }
    
    // Validate entryDirsData structure
    if (!entryDirsData.platformId) {
      console.error('Error: entryDirsFile missing required field "platformId"');
      process.exit(1);
    }
    if (!entryDirsData.sourcePath) {
      console.error('Error: entryDirsFile missing required field "sourcePath"');
      process.exit(1);
    }
    // Check for common format mistakes
    if (entryDirsData.businessModules && Array.isArray(entryDirsData.businessModules)) {
      console.error('Error: entryDirsFile uses unsupported "businessModules" format.');
      console.error('Expected: { "modules": [ { "name": "...", "entryDirs": ["..."] } ] }');
      console.error('Received: { "businessModules": [...] }');
      console.error('');
      console.error('Fix: The entry-dirs JSON must use a flat "modules" array.');
      console.error('Each module should have "name" (string) and "entryDirs" (array of strings).');
      console.error('Sub-modules must be flattened into top-level entries.');
      console.error('Re-run the identify-entries skill to regenerate with correct format.');
      process.exit(1);
    }

    if (!entryDirsData.modules || !Array.isArray(entryDirsData.modules)) {
      console.error('Error: entryDirsFile missing required field "modules" array.');
      console.error('Expected format: { "platformId": "...", "modules": [ { "name": "...", "entryDirs": ["..."] } ] }');
      const foundKeys = Object.keys(entryDirsData).join(', ');
      console.error(`Found top-level keys: ${foundKeys}`);
      process.exit(1);
    }
    
    // Find project root (use current directory or entryDirsFile directory)
    const projectRoot = findProjectRoot(path.dirname(entryDirsFilePath));
        
    // Build platform config from entryDirsData (no longer requires platform-mapping.json)
    // Step 1: Get platformType and platformSubtype (from entryDirsData or infer from platformId)
    let platformType = entryDirsData.platformType;
    let platformSubtype = entryDirsData.platformSubtype;
        
    if (!platformType || !platformSubtype) {
      const inferred = inferPlatformInfo(entryDirsData.platformId);
      if (!platformType) {
        platformType = inferred.platformType;
        console.log(`Inferred platformType from platformId: ${platformType}`);
      }
      if (!platformSubtype) {
        platformSubtype = inferred.platformSubtype;
        console.log(`Inferred platformSubtype from platformId: ${platformSubtype}`);
      }
    }
        
    // Step 2: Get techStack (from entryDirsData or default based on platformType)
    let techStack = entryDirsData.techStack;
    if (!techStack || techStack.length === 0) {
      techStack = getDefaultTechStack(platformType);
      console.log(`Using default techStack for ${platformType}: [${techStack.join(', ')}]`);
    }
        
    // Step 3: Infer framework from techStack
    const framework = inferFrameworkFromTechStack(techStack);
        
    // Step 4: Get platformName (from entryDirsData or build from type/subtype)
    const platformName = entryDirsData.platformName || `${platformType}-${platformSubtype}`;
        
    // Build final platformConfig object
    const platformConfig = {
      platformId: entryDirsData.platformId,
      platformType: platformType,
      platformSubtype: platformSubtype,
      framework: framework,
      platformName: platformName
    };
        
    console.log(`Platform config: type=${platformType}, subtype=${platformSubtype}, framework=${framework}`);
    
    // Set output directory (prefer --outputDir parameter, fallback to findProjectRoot)
    let outputDir;
    if (params.outputDir) {
      outputDir = path.resolve(params.outputDir);
      console.log(`Using outputDir from parameter: ${outputDir}`);
    } else {
      outputDir = path.join(projectRoot, 'speccrew-workspace', 'knowledges', 'base', 'sync-state', 'knowledge-bizs');
    }
    
    // Generate features from entry dirs
    const success = generateFromEntryDirs(entryDirsData, platformConfig, projectRoot, outputDir, overwrite);
    process.exit(success ? 0 : 1);
  }

  // Required parameters (full scan mode)
  const sourcePath = params.sourcePath;
  const outputFileName = params.outputFileName;
  const platformName = params.platformName;
  const platformType = params.platformType;
  const techStackStr = params.techStack;
  const fileExtensionsStr = params.fileExtensions;

  // Optional parameters
  const platformSubtype = params.platformSubtype || '';
  const techIdentifier = params.techIdentifier || platformSubtype;
  const analysisMethod = params.analysisMethod || 'ui-based';
  let excludeDirsStr = params.excludeDirs;
  // --includeDataObjects: set to "true" to include VO/DTO/DO/Entity/Convert files (default: false)
  const includeDataObjects = params.includeDataObjects === 'true';

  // Resolve source path first to find project root
  const resolvedSourcePath = path.resolve(sourcePath);
  if (!fs.existsSync(resolvedSourcePath)) {
    console.error(`Error: Source path does not exist: ${sourcePath}`);
    process.exit(1);
  }

  // Find project root for config file lookup
  const projectRoot = findProjectRoot(resolvedSourcePath);

  // If excludeDirs not provided or empty, try to read from tech-stack-mappings.json
  let excludeFileSuffixes = [];
  let excludeFileNames = [];
  if (!excludeDirsStr || excludeDirsStr === '[]') {
    try {
      const configPath = path.join(projectRoot, 'speccrew-workspace', 'docs', 'configs', 'tech-stack-mappings.json');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        // Load tech-stack-specific exclude_dirs
        let techExcludeDirs = [];
        let effectiveTechIdentifier = techIdentifier;

        // Try exact match first
        if (config.tech_stacks &&
            config.tech_stacks[platformType] &&
            config.tech_stacks[platformType][techIdentifier] &&
            config.tech_stacks[platformType][techIdentifier].exclude_dirs) {
          techExcludeDirs = config.tech_stacks[platformType][techIdentifier].exclude_dirs;
        } else {
          // Try normalized identifier (remove language prefix like "python-fastapi" → "fastapi")
          const normalizedIdentifier = normalizeTechIdentifier(techIdentifier);
          if (normalizedIdentifier !== techIdentifier &&
              config.tech_stacks &&
              config.tech_stacks[platformType] &&
              config.tech_stacks[platformType][normalizedIdentifier] &&
              config.tech_stacks[platformType][normalizedIdentifier].exclude_dirs) {
            techExcludeDirs = config.tech_stacks[platformType][normalizedIdentifier].exclude_dirs;
            effectiveTechIdentifier = normalizedIdentifier;
            console.log(`Using normalized tech identifier for exclude_dirs: ${techIdentifier} → ${normalizedIdentifier}`);
          }
        }

        // Load global exclude_dirs (applies to all platforms)
        const globalExcludeDirs = config.global_exclude_dirs || [];

        // Merge: global + tech-specific
        const mergedDirs = [...new Set([...globalExcludeDirs, ...techExcludeDirs])];
        excludeDirsStr = JSON.stringify(mergedDirs);
        console.log(`Loaded exclude_dirs from tech-stack-mappings.json (${globalExcludeDirs.length} global + ${techExcludeDirs.length} tech-specific = ${mergedDirs.length} total)`);

        // Load tech-stack-specific exclude_file_suffixes
        if (config.tech_stacks &&
            config.tech_stacks[platformType] &&
            config.tech_stacks[platformType][effectiveTechIdentifier] &&
            config.tech_stacks[platformType][effectiveTechIdentifier].exclude_file_suffixes) {
          excludeFileSuffixes = config.tech_stacks[platformType][effectiveTechIdentifier].exclude_file_suffixes;
          if (excludeFileSuffixes.length > 0) {
            console.log(`Loaded exclude_file_suffixes from tech-stack-mappings.json: ${excludeFileSuffixes.join(', ')}`);
          }
        }

        // Load tech-stack-specific exclude_file_names
        if (config.tech_stacks &&
            config.tech_stacks[platformType] &&
            config.tech_stacks[platformType][effectiveTechIdentifier] &&
            config.tech_stacks[platformType][effectiveTechIdentifier].exclude_file_names) {
          excludeFileNames = config.tech_stacks[platformType][effectiveTechIdentifier].exclude_file_names;
          if (excludeFileNames.length > 0) {
            console.log(`Loaded exclude_file_names from tech-stack-mappings.json: ${excludeFileNames.join(', ')}`);
          }
        }
      }
    } catch (e) {
      // Silent fallback - continue with default or empty
      console.log(`Could not load exclude_dirs from config: ${e.message}`);
    }
  }

  // Default fallback if still not set
  if (!excludeDirsStr) {
    excludeDirsStr = '["components","composables","hooks","utils"]';
  }

  // Validate required parameters
  if (!sourcePath || !outputFileName || !platformName || !platformType || !techStackStr || !fileExtensionsStr) {
    console.error('Usage: node generate-inventory.js --sourcePath <path> --outputFileName <name> --platformName <name> --platformType <type> --techStack <json> --fileExtensions <json> [--platformSubtype <subtype>] [--techIdentifier <identifier>] [--analysisMethod <method>] [--excludeDirs <json>] [--includeDataObjects <true|false>] [--outputDir <dir>]');
    console.error('Example: node generate-inventory.js --sourcePath "src/views" --outputFileName "features-web.json" --platformName "Web Frontend" --platformType "web" --platformSubtype "vue" --techStack "vue,typescript" --fileExtensions ".vue,.ts" --analysisMethod "ui-based" --excludeDirs "components,composables,hooks,utils"');
    process.exit(1);
  }

  // Find sync-state directory (prefer --outputDir parameter, fallback to findProjectRoot)
  let syncStateDir;
  if (params.outputDir) {
    syncStateDir = path.resolve(params.outputDir);
    console.log(`Using outputDir from parameter: ${syncStateDir}`);
  } else {
    syncStateDir = path.join(projectRoot, 'speccrew-workspace', 'knowledges', 'base', 'sync-state', 'knowledge-bizs');
  }
  const outputPath = path.join(syncStateDir, outputFileName);

  // Calculate relative source path from project root
  let relativeSourcePath = normalizePath(sourcePath);
  if (/^[a-zA-Z]:/.test(sourcePath) || path.isAbsolute(sourcePath)) {
    // Absolute path - make it relative to project root
    relativeSourcePath = normalizePath(path.relative(projectRoot, resolvedSourcePath));
  }

  // Handle special case: if source path is current directory (.), use empty string for proper replacement
  if (relativeSourcePath === '.') {
    relativeSourcePath = '';
  }

  // Calculate fallback module name from source path (last directory name)
  const fallbackModuleName = path.basename(resolvedSourcePath);

  console.log(`Scanning: ${sourcePath}`);
  console.log(`Output: ${outputPath}`);
  console.log(`Platform: ${platformName} (${platformType})`);
  console.log(`TechStack: ${techStackStr}`);
  console.log(`Extensions: ${fileExtensionsStr}`);

  // Parse array parameters (supports both JSON and comma-separated formats)
  const techStackArray = parseArrayParam(techStackStr);
  const extensionsArray = parseArrayParam(fileExtensionsStr);
  const excludeDirsArray = parseArrayParam(excludeDirsStr);

  console.log(`Scanning for files: ${extensionsArray.map(ext => `*${ext}`).join(', ')}`);

  // Find all files recursively matching the extensions
  const allFiles = findFiles(resolvedSourcePath, extensionsArray, excludeDirsArray, resolvedSourcePath);

  // Filter out files in excluded directories
  let files = allFiles.filter(file => !isExcludedPath(file.relativePath, excludeDirsArray));

  // For backend platforms, filter out data object files (VO/DTO/DO/Entity/Convert) unless includeDataObjects is set
  let excludedDataObjectsCount = 0;
  const isBackend = platformType === 'backend';
  if (isBackend && !includeDataObjects && excludeFileSuffixes.length > 0) {
    const filesBeforeFilter = files.length;
    files = files.filter(file => !isDataObjectFile(file.fileName, file.extension, excludeFileSuffixes));
    excludedDataObjectsCount = filesBeforeFilter - files.length;
  }

  // Filter out files with excluded names (e.g., package-info)
  let excludedFileNamesCount = 0;
  if (excludeFileNames.length > 0) {
    const filesBeforeFilter = files.length;
    files = files.filter(file => !isExcludedFileName(file.fileName, excludeFileNames));
    excludedFileNamesCount = filesBeforeFilter - files.length;
  }

  console.log(`Found ${allFiles.length} total files, ${files.length} after excluding components directories`);
  if (excludedDataObjectsCount > 0) {
    console.log(`Excluded: ${excludedDataObjectsCount} data objects (VO/DTO/DO/Entity/Convert)`);
  }
  if (excludedFileNamesCount > 0) {
    console.log(`Excluded: ${excludedFileNamesCount} files by name (${excludeFileNames.join(', ')})`);
  }

  // Build flat feature list - each file is a feature
  const features = [];

  for (const file of files) {
    // Calculate relative file path from project root
    const relativeFilePath = normalizePath(path.relative(projectRoot, file.fullPath));

    // Calculate document path: replace source path prefix with knowledge base path and change extension to .md
    let docPath;
    if (!relativeSourcePath) {
      // Source is project root, just prepend knowledge base path
      docPath = `speccrew-workspace/knowledges/bizs/${platformType}-${platformSubtype}/${relativeFilePath}`;
    } else {
      // Source is a subdirectory, replace the prefix
      const regex = new RegExp(`^${relativeSourcePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
      docPath = relativeFilePath.replace(regex, `speccrew-workspace/knowledges/bizs/${platformType}-${platformSubtype}`);
    }
    docPath = docPath.replace(/\.[^.]+$/, '.md');

    // Extract module name from relative directory, with fallback to source path's last directory
    const moduleName = getModuleName(file.directory, excludeDirsArray, fallbackModuleName);

    // Ensure docPath contains module directory when file is directly under the platform root
    const platformPrefix = `speccrew-workspace/knowledges/bizs/${platformType}-${platformSubtype}/`;
    if (docPath.startsWith(platformPrefix)) {
      const docRelative = docPath.slice(platformPrefix.length);
      if (!docRelative.includes('/')) {
        // File directly at root level, insert module directory
        docPath = `${platformPrefix}${moduleName}/${docRelative}`;
      }
    }

    // Use directory path to build unique ID, avoid filename collisions
    // Example: mail/account/index.vue → mail-account-index
    // Example: mail/template/index.vue → mail-template-index
    // Example: dict/index.vue → dict-index (keep compatible when no nesting)
    let dirSegments = file.directory
      ? file.directory.replace(/[\/\\]/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')
      : '';

    // Top-level files (directory = ".") should not include "."
    if (dirSegments === '.' || dirSegments === './') {
      dirSegments = '';
    }

    // If dirSegments already contains moduleName prefix, remove to avoid duplication
    // Example: directory='mail/account', moduleName='mail' → dirSegments='account'
    if (moduleName && dirSegments.startsWith(moduleName + '-')) {
      dirSegments = dirSegments.slice(moduleName.length + 1);
    } else if (moduleName && dirSegments === moduleName) {
      dirSegments = '';
    }

    const featureId = dirSegments
      ? `${moduleName}-${dirSegments}-${file.fileName}`
      : `${moduleName}-${file.fileName}`;
    const feature = {
      id: featureId,
      fileName: file.fileName,
      sourcePath: relativeFilePath,
      documentPath: docPath,
      module: moduleName,
      lastModified: file.lastModified,
      analyzed: false,
      startedAt: null,
      completedAt: null,
      analysisNotes: null
    };
    features.push(feature);
  }

  // Collect unique module names
  const moduleList = [...new Set(features.map(f => f.module))].sort();

  // Build inventory object
  const inventory = {
    platformName: platformName,
    platformType: platformType,
    sourcePath: relativeSourcePath,
    techStack: techStackArray,
    modules: moduleList,
    totalFiles: files.length,
    analyzedCount: 0,
    pendingCount: files.length,
    generatedAt: new Date().toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '-'),
    analysisMethod: analysisMethod,
    features: features
  };

  // Add platformSubtype if provided
  if (platformSubtype) {
    inventory.platformSubtype = platformSubtype;
  }

  // Add techIdentifier if provided (used by reindex-modules.js to lookup exclude_dirs)
  if (techIdentifier) {
    inventory.techIdentifier = techIdentifier;
  }

  // Ensure sync-state directory exists
  if (!fs.existsSync(syncStateDir)) {
    fs.mkdirSync(syncStateDir, { recursive: true });
  }

  // Incremental: if features file already exists and overwrite is not set, write to *.new.json
  const actualOutputPath = (!overwrite && fs.existsSync(outputPath))
    ? outputPath.replace(/\.json$/, '.new.json')
    : outputPath;

  // Write JSON output
  fs.writeFileSync(actualOutputPath, JSON.stringify(inventory, null, 2), 'utf8');

  if (actualOutputPath !== outputPath) {
    console.log(`Incremental: Generated ${path.basename(actualOutputPath)} (existing features detected)`);
  } else {
    console.log(`Full: Generated features.json with ${files.length} features`);
  }
  console.log(`Output: ${actualOutputPath}`);
}

main();
