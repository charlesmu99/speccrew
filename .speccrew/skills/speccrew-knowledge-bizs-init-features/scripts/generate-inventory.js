#!/usr/bin/env node
/**
 * generate-inventory.js
 * 
 * Generate features.json inventory for a single platform.
 * This script is called by speccrew-knowledge-bizs-init-features workflow.
 * 
 * Usage:
 *   node generate-inventory.js --entryDirsFile <path> --outputDir <path>
 * 
 * Arguments:
 *   --entryDirsFile    Path to entry-dirs JSON file
 *   --outputDir        Output directory for features.json
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        parsed[key] = value;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  
  return parsed;
}

// Generate timestamp in format YYYY-MM-DD-HHMMSS
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

// Convert absolute path to project-relative path
function toRelativePath(absolutePath, projectRoot) {
  // Normalize paths
  const normalizedAbs = path.normalize(absolutePath).replace(/\\/g, '/');
  const normalizedRoot = path.normalize(projectRoot).replace(/\\/g, '/');
  
  if (normalizedAbs.startsWith(normalizedRoot)) {
    const relative = normalizedAbs.slice(normalizedRoot.length).replace(/^\/+/, '');
    return relative;
  }
  return normalizedAbs;
}

// Generate unique feature ID from source path
// Converts path separators to hyphens, removes extension
// e.g., 'src/views/bpm/form/data.ts' -> 'src-views-bpm-form-data'
// e.g., 'ruoyi-fastapi-app/src/pages/common/agreement/index.vue' -> 'ruoyi-fastapi-app-src-pages-common-agreement-index'
function generateFeatureId(relativeSourcePath) {
  // Remove file extension
  const pathWithoutExt = relativeSourcePath.replace(/\.[^.]+$/, '');
  
  // Replace path separators with hyphens
  const id = pathWithoutExt.replace(/\//g, '-').replace(/\\/g, '-');
  
  return id;
}

// Generate document path for a feature
// Format: speccrew-workspace/knowledges/bizs/{platformId}/{module}/{subpath}/{uniqueName}.md
// The documentPath must be unique to avoid overwriting
function generateDocumentPath(platformId, module, sourcePath, projectRoot) {
  // Get the relative path from project root
  const relativePath = toRelativePath(sourcePath, projectRoot);
  
  // Parse the source path to extract module and subpath
  // Expected format: {platformSourceRoot}/{module}/{subpath}/{file}
  const pathParts = relativePath.split('/');
  
  // Find module index
  let moduleIndex = -1;
  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i] === module) {
      moduleIndex = i;
      break;
    }
  }
  
  // Build subpath (everything between module and filename)
  let subpath = '';
  if (moduleIndex >= 0 && moduleIndex < pathParts.length - 2) {
    // There are directories between module and filename
    subpath = pathParts.slice(moduleIndex + 1, pathParts.length - 1).join('/');
  }
  
  // Extract filename without extension
  const basename = path.basename(sourcePath, path.extname(sourcePath));
  
  // Generate unique document name to avoid collisions
  // Use the path after module to create a unique name
  let uniqueDocName;
  if (moduleIndex >= 0 && moduleIndex < pathParts.length - 1) {
    // Get all path parts after module (excluding extension)
    const pathAfterModule = pathParts.slice(moduleIndex + 1);
    // Join with hyphens to create unique name
    uniqueDocName = pathAfterModule.join('-').replace(/\.[^.]+$/, '');
  } else {
    // Fallback: use basename
    uniqueDocName = basename;
  }
  
  // Construct document path using platformId (which follows {platformType}-{techStack} format)
  // e.g., backend-fastapi, web-vue3, mobile-uniapp
  const docPathParts = ['speccrew-workspace', 'knowledges', 'bizs', platformId, module];
  
  if (subpath) {
    docPathParts.push(subpath);
  }
  
  docPathParts.push(`${uniqueDocName}.md`);
  
  return docPathParts.join('/');
}

// Main function
function main() {
  const args = parseArgs();
  
  // Validate required arguments
  if (!args.entryDirsFile) {
    console.error('Error: --entryDirsFile is required');
    process.exit(1);
  }
  
  if (!args.outputDir) {
    console.error('Error: --outputDir is required');
    process.exit(1);
  }
  
  const entryDirsFile = path.resolve(args.entryDirsFile);
  const outputDir = path.resolve(args.outputDir);
  
  // Check if entry-dirs file exists
  if (!fs.existsSync(entryDirsFile)) {
    console.error(`Error: Entry-dirs file not found: ${entryDirsFile}`);
    process.exit(1);
  }
  
  // Read and parse entry-dirs JSON
  let entryDirsData;
  try {
    const content = fs.readFileSync(entryDirsFile, 'utf-8');
    entryDirsData = JSON.parse(content);
  } catch (error) {
    console.error(`Error: Failed to parse entry-dirs file: ${error.message}`);
    process.exit(1);
  }
  
  // Validate entry-dirs structure
  if (!entryDirsData.modules || !Array.isArray(entryDirsData.modules) || entryDirsData.modules.length === 0) {
    console.error('Error: entry-dirs JSON must have non-empty modules array');
    process.exit(1);
  }
  
  // Extract platform info from entry-dirs data
  const platformId = entryDirsData.platformId || 'unknown-platform';
  const platformName = entryDirsData.platformName || platformId;
  const platformType = entryDirsData.platformType || 'unknown';
  const platformSubtype = entryDirsData.platformSubtype || '';
  const techStack = entryDirsData.techStack || [];
  const sourceRoot = entryDirsData.sourcePath || '';
  
  // Project root is the parent of speccrew-workspace
  const projectRoot = path.resolve(outputDir, '..', '..', '..');
  
  // Generate features for each module
  const features = [];
  const modules = [];
  
  for (const moduleData of entryDirsData.modules) {
    const moduleName = moduleData.name;
    const entryDirs = moduleData.entryDirs || [];
    
    let moduleFeatureCount = 0;
    
    for (const entryDir of entryDirs) {
      // Scan files in entry directory
      const scanDirectory = (dir) => {
        const files = [];
        
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
              // Recursively scan subdirectories
              files.push(...scanDirectory(fullPath));
            } else if (entry.isFile()) {
              // Check if file is a source file based on platform type
              const ext = path.extname(entry.name).toLowerCase();
              const isSourceFile = isValidSourceFile(ext, platformType);
              
              if (isSourceFile) {
                files.push(fullPath);
              }
            }
          }
        } catch (error) {
          console.warn(`Warning: Failed to scan directory ${dir}: ${error.message}`);
        }
        
        return files;
      };
      
      const sourceFiles = scanDirectory(entryDir);
      
      for (const sourceFile of sourceFiles) {
        const relativeSourcePath = toRelativePath(sourceFile, projectRoot);
        const fileName = path.basename(sourceFile, path.extname(sourceFile));
        
        // Generate unique feature ID based on full relative path
        const featureId = generateFeatureId(relativeSourcePath);
        
        // Generate document path using platformId (now with unique filename)
        const documentPath = generateDocumentPath(platformId, moduleName, sourceFile, projectRoot);
        
        features.push({
          id: featureId,
          fileName: fileName,
          sourcePath: relativeSourcePath,
          documentPath: documentPath,
          module: moduleName,
          analyzed: false,
          startedAt: null,
          completedAt: null,
          analysisNotes: null
        });
        
        moduleFeatureCount++;
      }
    }
    
    modules.push({
      name: moduleName,
      featureCount: moduleFeatureCount
    });
  }
  
  // Determine analysis method based on platform type
  const analysisMethod = platformType === 'backend' ? 'api-based' : 'ui-based';
  
  // Build output JSON
  const outputData = {
    platformName: platformName,
    platformType: platformType,
    platformSubtype: platformSubtype,
    platformId: platformId,
    sourcePath: sourceRoot,
    techStack: techStack,
    analysisMethod: analysisMethod,
    modules: modules,
    totalFiles: features.length,
    analyzedCount: 0,
    pendingCount: features.length,
    generatedAt: generateTimestamp(),
    features: features
  };
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write output file
  const outputFile = path.join(outputDir, `features-${platformId}.json`);
  try {
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`Generated: ${outputFile}`);
    console.log(`  Platform: ${platformName} (${platformId})`);
    console.log(`  Type: ${platformType}${platformSubtype ? '/' + platformSubtype : ''}`);
    console.log(`  Features: ${features.length}`);
    console.log(`  Modules: ${modules.map(m => m.name).join(', ')}`);
  } catch (error) {
    console.error(`Error: Failed to write output file: ${error.message}`);
    process.exit(1);
  }
}

// Check if file extension is valid for the platform type
function isValidSourceFile(ext, platformType) {
  const backendExts = ['.java', '.kt', '.py', '.go', '.rs', '.cs', '.php', '.rb'];
  const webExts = ['.vue', '.tsx', '.jsx', '.ts', '.js', '.svelte'];
  const mobileExts = ['.vue', '.tsx', '.jsx', '.ts', '.js', '.dart', '.swift', '.kt', '.java'];
  const desktopExts = ['.vue', '.tsx', '.jsx', '.ts', '.js', '.cs', '.xaml'];
  
  switch (platformType) {
    case 'backend':
      return backendExts.includes(ext);
    case 'web':
      return webExts.includes(ext);
    case 'mobile':
      return mobileExts.includes(ext);
    case 'desktop':
      return desktopExts.includes(ext);
    default:
      // Accept all common source file extensions
      return [...backendExts, ...webExts, ...mobileExts, ...desktopExts].includes(ext);
  }
}

// Run main function
main();
