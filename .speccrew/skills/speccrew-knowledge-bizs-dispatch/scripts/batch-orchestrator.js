#!/usr/bin/env node
/**
 * batch-orchestrator.js - Batch management for Stage 2 feature processing
 * 
 * Subcommands:
 *   get-batch      - Get next batch of pending features
 *   process-results - Process completed batch results and merge graph data
 * 
 * Usage:
 *   node batch-orchestrator.js get-batch --syncStatePath <path> --batchSize <number>
 *   node batch-orchestrator.js process-results --syncStatePath <path> --graphRoot <path> --completedDir <path>
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = {
    command: null,
    syncStatePath: null,
    batchSize: 5,
    graphRoot: null,
    completedDir: null
  };
  
  const argv = process.argv.slice(2);
  args.command = argv[0];
  
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--syncStatePath' && i + 1 < argv.length) {
      args.syncStatePath = argv[++i];
    } else if (argv[i] === '--batchSize' && i + 1 < argv.length) {
      args.batchSize = parseInt(argv[++i], 10) || 5;
    } else if (argv[i] === '--graphRoot' && i + 1 < argv.length) {
      args.graphRoot = argv[++i];
    } else if (argv[i] === '--completedDir' && i + 1 < argv.length) {
      args.completedDir = argv[++i];
    }
  }
  
  return args;
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Read JSON file safely
function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    // Skip invalid JSON
  }
  return null;
}

// Get all features from syncStatePath
function getAllFeatures(syncStatePath) {
  const features = [];
  
  if (!fs.existsSync(syncStatePath)) {
    return features;
  }
  
  const files = fs.readdirSync(syncStatePath);
  const featureFiles = files.filter(f => f.startsWith('features-') && f.endsWith('.json'));
  
  for (const file of featureFiles) {
    const filePath = path.join(syncStatePath, file);
    const data = readJsonSafe(filePath);
    
    if (data && Array.isArray(data.features)) {
      for (const feature of data.features) {
        // Generate feature ID: {platformId}-{module}-{fileName} (without extension)
        const fileName = feature.fileName || feature.sourceFile || 'unknown';
        const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, '');
        const featureId = `${feature.platformId}-${feature.module}-${fileNameWithoutExt}`;
        
        features.push({
          id: featureId,
          ...feature
        });
      }
    }
  }
  
  return features;
}

// Get completed feature IDs from completed directory
function getCompletedFeatureIds(completedDir) {
  const completedIds = new Set();
  
  if (!fs.existsSync(completedDir)) {
    return completedIds;
  }
  
  const files = fs.readdirSync(completedDir);
  const doneFiles = files.filter(f => f.endsWith('.done.json'));
  
  for (const file of doneFiles) {
    // Extract feature ID from filename: {featureId}.done.json
    const featureId = file.replace('.done.json', '');
    completedIds.add(featureId);
  }
  
  return completedIds;
}

// get-batch subcommand
function getBatch(args) {
  const { syncStatePath, batchSize } = args;
  
  ensureDir(syncStatePath);
  
  // Determine completed directory (sibling to syncStatePath)
  const completedDir = path.join(path.dirname(syncStatePath), 'completed');
  ensureDir(completedDir);
  
  // Get all features and completed IDs
  const allFeatures = getAllFeatures(syncStatePath);
  const completedIds = getCompletedFeatureIds(completedDir);
  
  // Filter pending features
  const pendingFeatures = allFeatures.filter(f => !completedIds.has(f.id));
  const total = allFeatures.length;
  const completed = completedIds.size;
  const remaining = pendingFeatures.length;
  
  if (remaining === 0) {
    // All done
    console.log(JSON.stringify({
      action: 'done',
      total,
      completed
    }));
  } else {
    // Get next batch
    const batch = pendingFeatures.slice(0, batchSize);
    
    console.log(JSON.stringify({
      action: 'process',
      batch,
      remaining,
      total
    }));
  }
}

// process-results subcommand
function processResults(args) {
  const { syncStatePath, graphRoot, completedDir } = args;
  
  ensureDir(completedDir);
  ensureDir(graphRoot);
  
  let success = 0;
  let failed = 0;
  let graphUpdated = false;
  
  if (!fs.existsSync(completedDir)) {
    console.log(JSON.stringify({ success, failed, graphUpdated }));
    return;
  }
  
  const files = fs.readdirSync(completedDir);
  
  // Count done files
  const doneFiles = files.filter(f => f.endsWith('.done.json'));
  for (const file of doneFiles) {
    const filePath = path.join(completedDir, file);
    const data = readJsonSafe(filePath);
    if (data) {
      if (data.status === 'success' || data.status === 'completed') {
        success++;
      } else if (data.status === 'failed' || data.status === 'error') {
        failed++;
      } else {
        // Default to success if no status field
        success++;
      }
    } else {
      // Invalid JSON, assume success
      success++;
    }
  }
  
  // Process graph files and merge
  const graphFiles = files.filter(f => f.endsWith('.graph.json'));
  
  if (graphFiles.length > 0) {
    const nodesPath = path.join(graphRoot, 'nodes.json');
    const edgesPath = path.join(graphRoot, 'edges.json');
    
    // Load existing graph data
    let existingNodes = [];
    let existingEdges = [];
    
    if (fs.existsSync(nodesPath)) {
      const data = readJsonSafe(nodesPath);
      if (Array.isArray(data)) {
        existingNodes = data;
      }
    }
    
    if (fs.existsSync(edgesPath)) {
      const data = readJsonSafe(edgesPath);
      if (Array.isArray(data)) {
        existingEdges = data;
      }
    }
    
    // Merge graph data with deduplication
    const nodeIds = new Set(existingNodes.map(n => n.id));
    const edgeKeys = new Set(existingEdges.map(e => `${e.source}-${e.target}-${e.type}`));
    
    for (const file of graphFiles) {
      const filePath = path.join(completedDir, file);
      const graphData = readJsonSafe(filePath);
      
      if (graphData) {
        // Add nodes
        if (Array.isArray(graphData.nodes)) {
          for (const node of graphData.nodes) {
            if (node.id && !nodeIds.has(node.id)) {
              existingNodes.push(node);
              nodeIds.add(node.id);
            }
          }
        }
        
        // Add edges
        if (Array.isArray(graphData.edges)) {
          for (const edge of graphData.edges) {
            const edgeKey = `${edge.source}-${edge.target}-${edge.type}`;
            if (edge.source && edge.target && !edgeKeys.has(edgeKey)) {
              existingEdges.push(edge);
              edgeKeys.add(edgeKey);
            }
          }
        }
        
        graphUpdated = true;
      }
    }
    
    // Write merged graph data
    fs.writeFileSync(nodesPath, JSON.stringify(existingNodes, null, 2));
    fs.writeFileSync(edgesPath, JSON.stringify(existingEdges, null, 2));
  }
  
  console.log(JSON.stringify({
    success,
    failed,
    graphUpdated
  }));
}

// Main
function main() {
  const args = parseArgs();
  
  if (!args.command) {
    console.error(JSON.stringify({ error: 'No command specified' }));
    process.exit(1);
  }
  
  if (args.command === 'get-batch') {
    if (!args.syncStatePath) {
      console.error(JSON.stringify({ error: '--syncStatePath is required' }));
      process.exit(1);
    }
    getBatch(args);
  } else if (args.command === 'process-results') {
    if (!args.syncStatePath || !args.graphRoot || !args.completedDir) {
      console.error(JSON.stringify({ error: '--syncStatePath, --graphRoot, and --completedDir are required' }));
      process.exit(1);
    }
    processResults(args);
  } else {
    console.error(JSON.stringify({ error: `Unknown command: ${args.command}` }));
    process.exit(1);
  }
}

main();
