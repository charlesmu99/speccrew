#!/usr/bin/env node
/**
 * Knowledge Graph Query Operations
 * Query the knowledge graph to find nodes, edges, and trace relationships.
 * All data read from {GraphRoot}/ directory.
 */

const fs = require('fs');
const path = require('path');

// ── Parse Arguments ─────────────────────────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const nextArg = args[i + 1];
            if (nextArg && !nextArg.startsWith('--')) {
                parsed[key] = nextArg;
                i++;
            } else {
                parsed[key] = true;
            }
        }
    }
    
    return parsed;
}

const args = parseArgs();

// Validate required parameters
const validActions = ['get-node', 'query-nodes', 'get-edges', 'search', 'trace-upstream', 'trace-downstream'];
if (!args.action || !validActions.includes(args.action)) {
    console.error(JSON.stringify({
        status: 'error',
        message: `Invalid or missing action. Must be one of: ${validActions.join(', ')}`
    }));
    process.exit(1);
}

if (!args.graphRoot) {
    console.error(JSON.stringify({
        status: 'error',
        message: 'Missing required parameter: --graphRoot'
    }));
    process.exit(1);
}

// Set defaults
const action = args.action;
const id = args.id;
const nodeId = args.nodeId || args['node-id'];
const module = args.module;
const type = args.type;
const keyword = args.keyword;
const direction = args.direction || 'both';
const depth = parseInt(args.depth, 10) || 2;
const graphRoot = args.graphRoot;

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJsonFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e) {
        // Return null on error
    }
    return null;
}

function getModuleFromId(nodeId) {
    const parts = nodeId.split('-');
    if (parts.length >= 2) {
        return parts[1];
    }
    return null;
}

function getIndexPath() {
    return path.join(graphRoot, 'indices', 'index.json');
}

function getNodesPath(mod) {
    return path.join(graphRoot, 'nodes', `${mod}.json`);
}

function getEdgesPath(mod) {
    return path.join(graphRoot, 'edges', `${mod}.json`);
}

function getCrossEdgesPath() {
    return path.join(graphRoot, 'edges', 'cross-module.json');
}

function getAllEdgesForModule(mod) {
    const edges = [];
    
    // Module edges
    const ep = getEdgesPath(mod);
    const data = readJsonFile(ep);
    if (data && data.edges) {
        edges.push(...data.edges);
    }
    
    // Cross-module edges
    const cp = getCrossEdgesPath();
    const crossData = readJsonFile(cp);
    if (crossData && crossData.edges) {
        edges.push(...crossData.edges);
    }
    
    return edges;
}

function findNodeById(nodeId) {
    const mod = getModuleFromId(nodeId);
    if (!mod) return null;
    
    const np = getNodesPath(mod);
    const data = readJsonFile(np);
    if (data && data.nodes) {
        for (const n of data.nodes) {
            if (n.id === nodeId) {
                return n;
            }
        }
    }
    
    // Fallback: search index first, then node file
    const index = readJsonFile(getIndexPath());
    if (index && index[nodeId]) {
        const indexMod = index[nodeId].module;
        if (indexMod !== mod) {
            const np2 = getNodesPath(indexMod);
            const data2 = readJsonFile(np2);
            if (data2 && data2.nodes) {
                for (const n of data2.nodes) {
                    if (n.id === nodeId) {
                        return n;
                    }
                }
            }
        }
    }
    
    return null;
}

function getAllModuleNames() {
    const nodesDir = path.join(graphRoot, 'nodes');
    const modules = [];
    
    try {
        if (fs.existsSync(nodesDir)) {
            const files = fs.readdirSync(nodesDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    modules.push(path.basename(file, '.json'));
                }
            }
        }
    } catch (e) {
        // Ignore errors
    }
    
    return modules;
}

function getAllEdges() {
    const allEdges = [];
    const modules = getAllModuleNames();
    
    // Get edges from all modules
    for (const mod of modules) {
        const ep = getEdgesPath(mod);
        const data = readJsonFile(ep);
        if (data && data.edges) {
            allEdges.push(...data.edges);
        }
    }
    
    // Cross-module edges
    const cp = getCrossEdgesPath();
    const crossData = readJsonFile(cp);
    if (crossData && crossData.edges) {
        allEdges.push(...crossData.edges);
    }
    
    return allEdges;
}

// ── Actions ──────────────────────────────────────────────────────────────────

function invokeGetNode(nodeId) {
    const node = findNodeById(nodeId);
    
    if (node) {
        return {
            status: 'success',
            action: 'get-node',
            resultCount: 1,
            data: node
        };
    } else {
        return {
            status: 'not-found',
            action: 'get-node',
            resultCount: 0,
            data: null,
            message: `Node '${nodeId}' not found`
        };
    }
}

function invokeQueryNodes(mod, nodeType) {
    const results = [];
    const nodesDir = path.join(graphRoot, 'nodes');
    
    if (!fs.existsSync(nodesDir)) {
        return {
            status: 'success',
            action: 'query-nodes',
            resultCount: 0,
            data: []
        };
    }
    
    const files = [];
    if (mod) {
        const mp = getNodesPath(mod);
        if (fs.existsSync(mp)) {
            files.push(mp);
        }
    } else {
        const allFiles = fs.readdirSync(nodesDir);
        for (const f of allFiles) {
            if (f.endsWith('.json')) {
                files.push(path.join(nodesDir, f));
            }
        }
    }
    
    for (const f of files) {
        const data = readJsonFile(f);
        if (data && data.nodes) {
            for (const n of data.nodes) {
                if (nodeType && n.type !== nodeType) {
                    continue;
                }
                results.push(n);
            }
        }
    }
    
    return {
        status: 'success',
        action: 'query-nodes',
        resultCount: results.length,
        data: results
    };
}

function invokeGetEdges(nid, dir) {
    const mod = getModuleFromId(nid);
    const allEdges = getAllEdgesForModule(mod);
    const results = [];
    
    for (const e of allEdges) {
        switch (dir) {
            case 'out':
                if (e.source === nid) {
                    results.push(e);
                }
                break;
            case 'in':
                if (e.target === nid) {
                    results.push(e);
                }
                break;
            case 'both':
            default:
                if (e.source === nid || e.target === nid) {
                    results.push(e);
                }
                break;
        }
    }
    
    return {
        status: 'success',
        action: 'get-edges',
        resultCount: results.length,
        data: results
    };
}

function invokeSearch(kw, nodeType, mod) {
    const results = [];
    const nodesDir = path.join(graphRoot, 'nodes');
    const kwLower = kw.toLowerCase();
    
    if (!fs.existsSync(nodesDir)) {
        return {
            status: 'success',
            action: 'search',
            resultCount: 0,
            data: []
        };
    }
    
    const files = [];
    if (mod) {
        const mp = getNodesPath(mod);
        if (fs.existsSync(mp)) {
            files.push(mp);
        }
    } else {
        const allFiles = fs.readdirSync(nodesDir);
        for (const f of allFiles) {
            if (f.endsWith('.json')) {
                files.push(path.join(nodesDir, f));
            }
        }
    }
    
    for (const f of files) {
        const data = readJsonFile(f);
        if (data && data.nodes) {
            for (const n of data.nodes) {
                if (nodeType && n.type !== nodeType) {
                    continue;
                }
                
                let match = false;
                
                // Search in id, name, description
                if (n.id && n.id.toLowerCase().includes(kwLower)) {
                    match = true;
                }
                if (!match && n.name && n.name.toLowerCase().includes(kwLower)) {
                    match = true;
                }
                if (!match && n.description && n.description.toLowerCase().includes(kwLower)) {
                    match = true;
                }
                
                // Search in tags
                if (!match && n.tags && Array.isArray(n.tags)) {
                    for (const tag of n.tags) {
                        if (tag && tag.toLowerCase().includes(kwLower)) {
                            match = true;
                            break;
                        }
                    }
                }
                
                // Search in keywords
                if (!match && n.keywords && Array.isArray(n.keywords)) {
                    for (const k of n.keywords) {
                        if (k && k.toLowerCase().includes(kwLower)) {
                            match = true;
                            break;
                        }
                    }
                }
                
                if (match) {
                    results.push(n);
                }
            }
        }
    }
    
    return {
        status: 'success',
        action: 'search',
        keyword: kw,
        resultCount: results.length,
        data: results
    };
}

function invokeTrace(nodeId, maxDepth, traceDirection) {
    // traceDirection: "upstream" = find who points TO this node (incoming edges)
    //                 "downstream" = find what this node points TO (outgoing edges)
    
    const visited = new Set();
    const rootNode = findNodeById(nodeId);
    
    if (!rootNode) {
        return {
            status: 'not-found',
            action: `trace-${traceDirection}`,
            message: `Node '${nodeId}' not found`
        };
    }
    
    function traceRecursive(nid, currentDepth) {
        if (currentDepth > maxDepth) {
            return [];
        }
        if (visited.has(nid)) {
            return [];
        }
        visited.add(nid);
        
        // Get all edges from all modules for cross-module tracing
        const allEdges = getAllEdges();
        
        const connectedEdges = [];
        if (traceDirection === 'upstream') {
            for (const e of allEdges) {
                if (e.target === nid) {
                    connectedEdges.push(e);
                }
            }
        } else {
            for (const e of allEdges) {
                if (e.source === nid) {
                    connectedEdges.push(e);
                }
            }
        }
        
        const children = [];
        for (const edge of connectedEdges) {
            const nextId = traceDirection === 'upstream' ? edge.source : edge.target;
            const nextNode = findNodeById(nextId);
            
            let childTrace = [];
            if (currentDepth + 1 <= maxDepth) {
                childTrace = traceRecursive(nextId, currentDepth + 1);
            }
            
            const child = {
                node: nextNode || { id: nextId },
                edge: {
                    type: edge.type,
                    metadata: edge.metadata
                },
                depth: currentDepth
            };
            
            if (traceDirection === 'upstream') {
                child.upstream = childTrace;
            } else {
                child.downstream = childTrace;
            }
            
            children.push(child);
        }
        
        return children;
    }
    
    const traceResult = traceRecursive(nodeId, 1);
    
    const output = {
        status: 'success',
        action: `trace-${traceDirection}`,
        root: rootNode
    };
    
    output[traceDirection] = traceResult;
    
    return output;
}

// ── Main ─────────────────────────────────────────────────────────────────────

let result;

switch (action) {
    case 'get-node':
        if (!id) {
            console.error(JSON.stringify({
                status: 'error',
                message: 'Missing required parameter: --id'
            }));
            process.exit(1);
        }
        result = invokeGetNode(id);
        break;
        
    case 'query-nodes':
        result = invokeQueryNodes(module, type);
        break;
        
    case 'get-edges':
        if (!nodeId) {
            console.error(JSON.stringify({
                status: 'error',
                message: 'Missing required parameter: --nodeId'
            }));
            process.exit(1);
        }
        result = invokeGetEdges(nodeId, direction);
        break;
        
    case 'search':
        if (!keyword) {
            console.error(JSON.stringify({
                status: 'error',
                message: 'Missing required parameter: --keyword'
            }));
            process.exit(1);
        }
        result = invokeSearch(keyword, type, module);
        break;
        
    case 'trace-upstream':
        if (!id) {
            console.error(JSON.stringify({
                status: 'error',
                message: 'Missing required parameter: --id'
            }));
            process.exit(1);
        }
        result = invokeTrace(id, depth, 'upstream');
        break;
        
    case 'trace-downstream':
        if (!id) {
            console.error(JSON.stringify({
                status: 'error',
                message: 'Missing required parameter: --id'
            }));
            process.exit(1);
        }
        result = invokeTrace(id, depth, 'downstream');
        break;
        
    default:
        console.error(JSON.stringify({
            status: 'error',
            message: `Unknown action: ${action}`
        }));
        process.exit(1);
}

console.log(JSON.stringify(result, null, 0));
