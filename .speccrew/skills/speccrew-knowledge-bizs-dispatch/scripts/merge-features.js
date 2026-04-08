#!/usr/bin/env node
/**
 * merge-features.js
 * 
 * Merge incremental feature inventory (*.new.json) with existing features (*.json).
 * Identifies added/removed/changed/unchanged features and cleans up artifacts for removed features.
 * 
 * Usage: node merge-features.js --syncStatePath <path> --completedDir <path> --projectRoot <path>
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
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

function normalizePath(p) {
  return p ? p.replace(/\\/g, '/') : '';
}

// Safely delete a file, logging the action
function safeDelete(filePath, cleanedFiles) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      cleanedFiles.push(normalizePath(filePath));
      return true;
    } catch (e) {
      console.error(`Warning: Failed to delete ${filePath}: ${e.message}`);
      return false;
    }
  }
  return false;
}

// Compare timestamps: returns true if sourceModified is newer than analysisCompleted
function isNewer(lastModified, completedAt) {
  if (!completedAt) return true; // never analyzed → needs analysis
  if (!lastModified) return false; // no modification info → assume unchanged
  
  // lastModified is ISO format: "2026-04-07T12:30:00.000Z"
  // completedAt is custom format: "2026-04-07-123000" (from dispatch)
  // Normalize completedAt to comparable format
  const normalizedCompleted = normalizeCompletedAt(completedAt);
  
  const modDate = new Date(lastModified);
  const compDate = new Date(normalizedCompleted);
  
  // If either date is invalid, treat as changed (safer)
  if (isNaN(modDate.getTime()) || isNaN(compDate.getTime())) {
    return true;
  }
  
  return modDate > compDate;
}

// Normalize completedAt format "2026-04-07-123000" → "2026-04-07T12:30:00"
function normalizeCompletedAt(completedAt) {
  if (!completedAt) return null;
  
  // Try ISO format first
  if (completedAt.includes('T')) return completedAt;
  
  // Handle "YYYY-MM-DD-HHmmss" format
  const match = completedAt.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]}T${match[2]}:${match[3]}:${match[4]}`;
  }
  
  return completedAt;
}

function main() {
  const params = parseArgs();
  
  const syncStatePath = params.syncStatePath;
  const completedDir = params.completedDir;
  const projectRoot = params.projectRoot;
  
  if (!syncStatePath || !completedDir || !projectRoot) {
    console.error('Usage: node merge-features.js --syncStatePath <path> --completedDir <path> --projectRoot <path>');
    process.exit(1);
  }
  
  const resolvedSyncState = path.resolve(syncStatePath);
  const resolvedCompletedDir = path.resolve(completedDir);
  const resolvedProjectRoot = path.resolve(projectRoot);
  
  // Scan for *.new.json files
  if (!fs.existsSync(resolvedSyncState)) {
    // Output empty result
    console.log(JSON.stringify({ platforms: [], totalAdded: 0, totalRemoved: 0, totalChanged: 0, totalUnchanged: 0 }));
    return;
  }
  
  const newFiles = fs.readdirSync(resolvedSyncState)
    .filter(f => f.startsWith('features-') && f.endsWith('.new.json'));
  
  if (newFiles.length === 0) {
    // No incremental files found
    console.log(JSON.stringify({ platforms: [], totalAdded: 0, totalRemoved: 0, totalChanged: 0, totalUnchanged: 0 }));
    return;
  }
  
  const result = {
    platforms: [],
    totalAdded: 0,
    totalRemoved: 0,
    totalChanged: 0,
    totalUnchanged: 0
  };
  
  for (const newFile of newFiles) {
    const newFilePath = path.join(resolvedSyncState, newFile);
    // features-backend-bpm.new.json → features-backend-bpm.json
    const oldFileName = newFile.replace('.new.json', '.json');
    const oldFilePath = path.join(resolvedSyncState, oldFileName);
    
    // Read new features
    let newData;
    try {
      newData = JSON.parse(fs.readFileSync(newFilePath, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${newFile}: ${e.message}`);
      continue;
    }
    
    // Read old features (if exists)
    let oldData = null;
    if (fs.existsSync(oldFilePath)) {
      try {
        oldData = JSON.parse(fs.readFileSync(oldFilePath, 'utf8'));
      } catch (e) {
        console.error(`Warning: Failed to read ${oldFileName}, treating as fresh: ${e.message}`);
      }
    }
    
    // If no old data, just rename new → old (first-time generation)
    if (!oldData) {
      fs.renameSync(newFilePath, oldFilePath);
      const platformResult = {
        platformId: newData.platformId || oldFileName.replace('features-', '').replace('.json', ''),
        added: newData.features.map(f => f.fileName),
        removed: [],
        changed: [],
        unchanged: [],
        cleanedFiles: []
      };
      result.platforms.push(platformResult);
      result.totalAdded += platformResult.added.length;
      console.error(`Platform ${platformResult.platformId}: ${platformResult.added.length} features (first run)`);
      continue;
    }
    
    // Build old features map by sourcePath
    const oldMap = new Map();
    for (const feature of (oldData.features || [])) {
      oldMap.set(normalizePath(feature.sourcePath), feature);
    }
    
    // Build new features map by sourcePath
    const newMap = new Map();
    for (const feature of (newData.features || [])) {
      newMap.set(normalizePath(feature.sourcePath), feature);
    }
    
    const platformResult = {
      platformId: newData.platformId || oldData.platformId || oldFileName.replace('features-', '').replace('.json', ''),
      added: [],
      removed: [],
      changed: [],
      unchanged: [],
      cleanedFiles: []
    };
    
    // Merged features list
    const mergedFeatures = [];
    
    // Process new features
    for (const [sourcePath, newFeature] of newMap) {
      const oldFeature = oldMap.get(sourcePath);
      
      if (!oldFeature) {
        // Added: new feature not in old
        mergedFeatures.push({
          ...newFeature,
          analyzed: false,
          startedAt: null,
          completedAt: null,
          analysisNotes: null
        });
        platformResult.added.push(newFeature.fileName);
      } else if (!oldFeature.analyzed || !oldFeature.completedAt) {
        // Previously not analyzed → keep as not analyzed, use new metadata
        mergedFeatures.push({
          ...newFeature,
          analyzed: false,
          startedAt: oldFeature.startedAt,
          completedAt: oldFeature.completedAt,
          analysisNotes: oldFeature.analysisNotes
        });
        platformResult.changed.push(newFeature.fileName);
      } else if (isNewer(newFeature.lastModified, oldFeature.completedAt)) {
        // Changed: source modified after last analysis
        mergedFeatures.push({
          ...newFeature,
          analyzed: false,
          startedAt: null,
          completedAt: oldFeature.completedAt, // preserve for reference
          analysisNotes: `Source modified since last analysis (was: ${oldFeature.analysisNotes || 'N/A'})`
        });
        platformResult.changed.push(newFeature.fileName);
      } else {
        // Unchanged: keep old feature state entirely
        mergedFeatures.push({
          ...oldFeature,
          // Update metadata from new scan (in case id/documentPath changed)
          id: newFeature.id,
          documentPath: newFeature.documentPath,
          lastModified: newFeature.lastModified
        });
        platformResult.unchanged.push(newFeature.fileName);
      }
    }
    
    // Process removed features (in old but not in new)
    for (const [sourcePath, oldFeature] of oldMap) {
      if (!newMap.has(sourcePath)) {
        platformResult.removed.push(oldFeature.fileName);
        
        // Clean up artifacts
        // 1. Delete document .md file
        if (oldFeature.documentPath) {
          const docAbsPath = path.join(resolvedProjectRoot, oldFeature.documentPath);
          safeDelete(docAbsPath, platformResult.cleanedFiles);
        }
        
        // 2. Delete .done.json marker
        const donePath = path.join(resolvedCompletedDir, `${oldFeature.fileName}.done.json`);
        safeDelete(donePath, platformResult.cleanedFiles);
        
        // 3. Delete .graph.json marker
        const graphPath = path.join(resolvedCompletedDir, `${oldFeature.fileName}.graph.json`);
        safeDelete(graphPath, platformResult.cleanedFiles);
      }
    }
    
    // Update inventory metadata
    const analyzedCount = mergedFeatures.filter(f => f.analyzed).length;
    const mergedInventory = {
      ...newData,
      // Preserve some old metadata
      analysisMethod: oldData.analysisMethod || newData.analysisMethod,
      // Update counts
      totalFiles: mergedFeatures.length,
      analyzedCount: analyzedCount,
      pendingCount: mergedFeatures.length - analyzedCount,
      generatedAt: new Date().toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '-'),
      features: mergedFeatures
    };
    
    // Also recalculate modules list
    const moduleSet = new Set(mergedFeatures.map(f => f.module));
    mergedInventory.modules = [...moduleSet].sort();
    
    // Write back merged features (overwrite old file)
    fs.writeFileSync(oldFilePath, JSON.stringify(mergedInventory, null, 2), 'utf8');
    
    // Delete .new.json file
    fs.unlinkSync(newFilePath);
    
    result.platforms.push(platformResult);
    result.totalAdded += platformResult.added.length;
    result.totalRemoved += platformResult.removed.length;
    result.totalChanged += platformResult.changed.length;
    result.totalUnchanged += platformResult.unchanged.length;
    
    console.error(`Platform ${platformResult.platformId}: +${platformResult.added.length} added, -${platformResult.removed.length} removed, ~${platformResult.changed.length} changed, =${platformResult.unchanged.length} unchanged`);
  }
  
  // Output result as JSON to stdout
  console.log(JSON.stringify(result, null, 2));
}

main();
