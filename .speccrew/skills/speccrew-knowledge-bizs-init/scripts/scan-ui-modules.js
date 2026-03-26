#!/usr/bin/env node

/**
 * Scan UI Modules Script
 * 
 * Scans source code directory to identify business modules and their components.
 * Outputs structured data for modules.json generation.
 * 
 * Usage: node scan-ui-modules.js --source <path> --output <path> --platform <type>
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    source: '',
    output: '',
    platform: 'web', // web, mobile, desktop
    extensions: ['.vue', '.tsx', '.jsx']
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--source':
      case '-s':
        options.source = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--platform':
      case '-p':
        options.platform = args[++i];
        break;
      case '--extensions':
      case '-e':
        options.extensions = args[++i].split(',');
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  if (!options.source) {
    console.error('Error: --source is required');
    showHelp();
    process.exit(1);
  }

  return options;
}

function showHelp() {
  console.log(`
Usage: node scan-ui-modules.js [options]

Options:
  -s, --source <path>      Source code directory to scan (required)
  -o, --output <path>      Output JSON file path (default: stdout)
  -p, --platform <type>    Platform type: web, mobile, desktop (default: web)
  -e, --extensions <list>  File extensions to scan, comma-separated (default: .vue,.tsx,.jsx)
  -h, --help              Show this help message

Examples:
  node scan-ui-modules.js --source ./src/views --output ./modules-scan.json
  node scan-ui-modules.js -s ./src/pages -p web -e .vue,.ts
`);
}

// Detect framework based on file structure
function detectFramework(sourcePath) {
  const indicators = {
    vue3: ['vite.config.ts', 'vite.config.js', 'vue3', 'composition api'],
    vue2: ['vue.config.js', 'webpack.config.js'],
    react: ['react', 'jsx', 'tsx'],
    nextjs: ['next.config.js', 'next.config.ts', 'app/', 'pages/'],
    angular: ['angular.json', '.component.ts']
  };

  // Check for config files
  const files = fs.readdirSync(sourcePath, { recursive: true });
  
  if (files.some(f => f.includes('vite.config'))) return { framework: 'vue3', confidence: 'high' };
  if (files.some(f => f.includes('next.config'))) return { framework: 'nextjs', confidence: 'high' };
  if (files.some(f => f.includes('angular.json'))) return { framework: 'angular', confidence: 'high' };
  
  // Check file extensions ratio
  const vueFiles = files.filter(f => f.endsWith('.vue')).length;
  const tsxFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.jsx')).length;
  
  if (vueFiles > tsxFiles) return { framework: 'vue', confidence: 'medium' };
  if (tsxFiles > 0) return { framework: 'react', confidence: 'medium' };
  
  return { framework: 'unknown', confidence: 'low' };
}

// Classify file type based on naming patterns
function classifyFile(filePath) {
  const basename = path.basename(filePath, path.extname(filePath)).toLowerCase();
  const dirname = path.dirname(filePath).toLowerCase();
  
  // List/Index pages
  if (basename === 'index' || basename.endsWith('list') || basename.endsWith('table')) {
    return { type: 'list', category: 'page' };
  }
  
  // Detail pages
  if (basename.includes('detail') || basename.includes('[id]') || basename.includes('view')) {
    return { type: 'detail', category: 'page' };
  }
  
  // Create/Edit pages
  if (basename.includes('create') || basename.includes('edit') || basename.includes('form')) {
    return { type: 'form', category: 'page' };
  }
  
  // Modal/Dialog components
  if (basename.includes('modal') || basename.includes('dialog') || basename.includes('drawer')) {
    return { type: 'modal', category: 'component' };
  }
  
  // Import/Export
  if (basename.includes('import') || basename.includes('export')) {
    return { type: 'data-operation', category: 'component' };
  }
  
  // Tree/Selector components
  if (basename.includes('tree') || basename.includes('select') || basename.includes('picker')) {
    return { type: 'selector', category: 'component' };
  }
  
  // Layout components
  if (basename.includes('layout') || basename.includes('container') || basename.includes('wrapper')) {
    return { type: 'layout', category: 'component' };
  }
  
  return { type: 'component', category: 'component' };
}

// Extract module name from path
function extractModuleName(filePath, sourcePath) {
  const relativePath = path.relative(sourcePath, filePath);
  const parts = relativePath.split(path.sep);
  
  // Module name is typically the first or second directory
  if (parts.length >= 2) {
    return parts[0]; // e.g., src/views/system/user -> system
  }
  
  return 'unknown';
}

// Extract sub-module name from path
function extractSubModuleName(filePath, sourcePath) {
  const relativePath = path.relative(sourcePath, filePath);
  const parts = relativePath.split(path.sep);
  const basename = path.basename(filePath, path.extname(filePath));
  
  // Use directory name + file type
  if (parts.length >= 2) {
    const dirName = parts[parts.length - 2]; // Parent directory
    const classification = classifyFile(filePath);
    return `${dirName}-${classification.type}`;
  }
  
  return basename;
}

// Scan directory for all component files
function scanDirectory(sourcePath, extensions) {
  const pattern = `**/*{${extensions.join(',')}}`;
  const files = globSync(pattern, { 
    cwd: sourcePath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.*/**']
  });
  
  return files.map(file => {
    const classification = classifyFile(file);
    const moduleName = extractModuleName(file, sourcePath);
    const subModuleName = extractSubModuleName(file, sourcePath);
    
    return {
      path: file,
      relativePath: path.relative(sourcePath, file),
      module: moduleName,
      subModule: subModuleName,
      fileName: path.basename(file),
      componentName: path.basename(file, path.extname(file)),
      extension: path.extname(file),
      type: classification.type,
      category: classification.category
    };
  });
}

// Group files by module
function groupByModule(files) {
  const modules = {};
  
  files.forEach(file => {
    if (!modules[file.module]) {
      modules[file.module] = {
        name: file.module,
        codeName: file.module.toLowerCase().replace(/\s+/g, '-'),
        path: path.dirname(file.path),
        files: []
      };
    }
    modules[file.module].files.push(file);
  });
  
  return modules;
}

// Group files within module by sub-module
function groupBySubModule(moduleFiles) {
  const subModules = {};
  
  moduleFiles.forEach(file => {
    const key = file.subModule;
    if (!subModules[key]) {
      subModules[key] = {
        name: key,
        codeName: key.toLowerCase().replace(/\s+/g, '-'),
        path: path.dirname(file.path),
        files: [],
        types: new Set()
      };
    }
    subModules[key].files.push(file);
    subModules[key].types.add(file.type);
  });
  
  // Convert Set to Array for JSON serialization
  Object.values(subModules).forEach(sm => {
    sm.types = Array.from(sm.types);
  });
  
  return subModules;
}

// Generate scan result
function generateScanResult(options) {
  const sourcePath = path.resolve(options.source);
  
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source path does not exist: ${sourcePath}`);
  }
  
  console.error(`Scanning: ${sourcePath}`);
  console.error(`Extensions: ${options.extensions.join(', ')}`);
  
  // Detect framework
  const framework = detectFramework(sourcePath);
  console.error(`Detected framework: ${framework.framework} (${framework.confidence})`);
  
  // Scan files
  const files = scanDirectory(sourcePath, options.extensions);
  console.error(`Found ${files.length} component files`);
  
  // Group by module
  const modules = groupByModule(files);
  console.error(`Identified ${Object.keys(modules).length} modules`);
  
  // Group each module by sub-module
  Object.values(modules).forEach(module => {
    module.subModules = groupBySubModule(module.files);
    delete module.files; // Remove flat file list, keep structured
  });
  
  return {
    generatedAt: new Date().toISOString(),
    scanConfig: {
      sourcePath: sourcePath,
      platform: options.platform,
      extensions: options.extensions,
      framework: framework
    },
    summary: {
      totalFiles: files.length,
      totalModules: Object.keys(modules).length,
      fileTypes: files.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {})
    },
    modules: modules
  };
}

// Main execution
function main() {
  try {
    const options = parseArgs();
    const result = generateScanResult(options);
    
    const outputJson = JSON.stringify(result, null, 2);
    
    if (options.output) {
      fs.writeFileSync(options.output, outputJson, 'utf-8');
      console.error(`\nScan result written to: ${options.output}`);
    } else {
      console.log(outputJson);
    }
    
    // Exit with success
    process.exit(0);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
