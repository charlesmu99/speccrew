const fs = require('fs');
const path = require('path');

// Recursively copy directory, supports filter function and content transformation
function copyDirRecursive(src, dest, filter, contentTransform) {
  if (!fs.existsSync(src)) return { copied: 0, skipped: 0 };
  
  fs.mkdirSync(dest, { recursive: true });
  let copied = 0, skipped = 0;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (filter && !filter(entry.name, srcPath, entry.isDirectory())) {
      skipped++;
      continue;
    }
    
    if (entry.isDirectory()) {
      const sub = copyDirRecursive(srcPath, destPath, filter, contentTransform);
      copied += sub.copied;
      skipped += sub.skipped;
    } else {
      // If contentTransform provided, try to transform content
      if (contentTransform) {
        const originalContent = fs.readFileSync(srcPath, 'utf8');
        const transformedContent = contentTransform(originalContent, entry.name, srcPath);
        
        if (transformedContent != null) {
          fs.writeFileSync(destPath, transformedContent, 'utf8');
          copied++;
        } else {
          // transform returns null/undefined, copy as-is
          fs.copyFileSync(srcPath, destPath);
          copied++;
        }
      } else {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
  }
  return { copied, skipped };
}

// Check if file/directory has speccrew-* prefix
function isSpeccrewFile(name) {
  return name.startsWith('speccrew-');
}

// Read .speccrewrc configuration
function readSpeccrewRC(projectRoot) {
  const rcPath = path.join(projectRoot, '.speccrewrc');
  if (!fs.existsSync(rcPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(rcPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// Write .speccrewrc configuration
// targetDir: Target directory (usually workspace directory)
function writeSpeccrewRC(targetDir, config) {
  const rcPath = path.join(targetDir, '.speccrewrc');
  fs.writeFileSync(rcPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

// Get package version
function getPackageVersion() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

// Get package .speccrew source directory
function getSourceRoot() {
  return path.join(__dirname, '..', '.speccrew');
}

// Get package workspace-template directory
function getWorkspaceTemplatePath() {
  return path.join(__dirname, '..', 'workspace-template');
}

// Recursively create directory structure (array format)
function ensureDirectories(baseDir, dirs) {
  for (const dir of dirs) {
    fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
  }
}

// Recursively delete directory
function removeDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeDirRecursive(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dirPath);
}

// Deprecated skills that should be auto-cleaned on init/update
const DEPRECATED_SKILLS = [
  'speccrew-dev-desktop',   // replaced by speccrew-dev-desktop-electron + speccrew-dev-desktop-tauri
  'speccrew-dev-review',    // replaced by speccrew-dev-review-backend/frontend/mobile/desktop
  'speccrew-test-execute',  // replaced by speccrew-test-runner + speccrew-test-reporter
];

function cleanDeprecatedSkills(destDir, deprecatedList) {
  if (!fs.existsSync(destDir)) return 0;
  let cleaned = 0;
  try {
    const entries = fs.readdirSync(destDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && deprecatedList.includes(entry.name)) {
        const fullPath = path.join(destDir, entry.name);
        removeDirRecursive(fullPath);
        cleaned++;
      }
    }
  } catch (error) {
    // Silently ignore cleanup errors to not block main flow
  }
  return cleaned;
}

module.exports = {
  copyDirRecursive,
  isSpeccrewFile,
  readSpeccrewRC,
  writeSpeccrewRC,
  getPackageVersion,
  getSourceRoot,
  getWorkspaceTemplatePath,
  ensureDirectories,
  removeDirRecursive,
  DEPRECATED_SKILLS,
  cleanDeprecatedSkills,
};
