#!/usr/bin/env node
/**
 * Generate features.json for UI feature analysis
 *
 * Scans source directory for page files and generates a flat feature list with analysis status tracking.
 * All configuration is passed via parameters - the script does not infer anything.
 *
 * Usage: node generate-inventory.js --sourcePath <path> --outputFileName <name> --platformName <name> --platformType <type> --techStack <json> --fileExtensions <json> [--platformSubtype <subtype>] [--techIdentifier <identifier>] [--analysisMethod <method>] [--excludeDirs <json>]
 *     Array parameters (--techStack, --fileExtensions, --excludeDirs) accept both JSON format and comma-separated format.
 *
 * Example:
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
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse array parameter that supports both JSON format and comma-separated format.
 * JSON format: '["vue","typescript"]'
 * Comma-separated format: "vue,typescript"  (recommended for PowerShell compatibility)
 */
function parseArrayParam(value) {
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
      if (value && !value.startsWith('--')) {
        params[key] = value;
        i++;
      } else {
        params[key] = true;
      }
    }
  }

  return params;
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
          directory: path.dirname(relativePath)
        });
      }
    }
  }

  return files;
}

// Main function
function main() {
  const params = parseArgs();

  // Required parameters
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

  // Resolve source path first to find project root
  const resolvedSourcePath = path.resolve(sourcePath);
  if (!fs.existsSync(resolvedSourcePath)) {
    console.error(`Error: Source path does not exist: ${sourcePath}`);
    process.exit(1);
  }

  // Find project root for config file lookup
  const projectRoot = findProjectRoot(resolvedSourcePath);

  // If excludeDirs not provided or empty, try to read from tech-stack-mappings.json
  if (!excludeDirsStr || excludeDirsStr === '[]') {
    try {
      const configPath = path.join(projectRoot, 'speccrew-workspace', 'docs', 'configs', 'tech-stack-mappings.json');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        // Load tech-stack-specific exclude_dirs
        let techExcludeDirs = [];
        if (config.tech_stacks && 
            config.tech_stacks[platformType] && 
            config.tech_stacks[platformType][techIdentifier] &&
            config.tech_stacks[platformType][techIdentifier].exclude_dirs) {
          techExcludeDirs = config.tech_stacks[platformType][techIdentifier].exclude_dirs;
        }
        
        // Load global exclude_dirs (applies to all platforms)
        const globalExcludeDirs = config.global_exclude_dirs || [];
        
        // Merge: global + tech-specific
        const mergedDirs = [...new Set([...globalExcludeDirs, ...techExcludeDirs])];
        excludeDirsStr = JSON.stringify(mergedDirs);
        console.log(`Loaded exclude_dirs from tech-stack-mappings.json (${globalExcludeDirs.length} global + ${techExcludeDirs.length} tech-specific = ${mergedDirs.length} total)`);
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
    console.error('Usage: node generate-inventory.js --sourcePath <path> --outputFileName <name> --platformName <name> --platformType <type> --techStack <json> --fileExtensions <json> [--platformSubtype <subtype>] [--techIdentifier <identifier>] [--analysisMethod <method>] [--excludeDirs <json>]');
    console.error('Example: node generate-inventory.js --sourcePath "src/views" --outputFileName "features-web.json" --platformName "Web Frontend" --platformType "web" --platformSubtype "vue" --techStack "vue,typescript" --fileExtensions ".vue,.ts" --analysisMethod "ui-based" --excludeDirs "components,composables,hooks,utils"');
    process.exit(1);
  }

  // Find sync-state directory
  const syncStateDir = path.join(projectRoot, 'speccrew-workspace', 'knowledges', 'base', 'sync-state', 'knowledge-bizs');
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
  const files = allFiles.filter(file => !isExcludedPath(file.relativePath, excludeDirsArray));

  console.log(`Found ${allFiles.length} total files, ${files.length} after excluding components directories`);

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

    // 使用目录路径构建唯一 ID，避免同名文件碰撞
    // 例: mail/account/index.vue → mail-account-index
    // 例: mail/template/index.vue → mail-template-index
    // 例: dict/index.vue → dict-index (无嵌套时保持兼容)
    let dirSegments = file.directory
      ? file.directory.replace(/[\/\\]/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-')
      : '';

    // 顶层文件（directory = "."）不应引入 "."
    if (dirSegments === '.' || dirSegments === './') {
      dirSegments = '';
    }

    // 如果 dirSegments 已包含 moduleName 前缀，去除避免重复
    // 例: directory='mail/account', moduleName='mail' → dirSegments='account'
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

  // Write JSON output
  fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2), 'utf8');

  console.log(`Generated features.json with ${files.length} features`);
  console.log(`Ready for analysis: ${outputPath}`);
}

main();
