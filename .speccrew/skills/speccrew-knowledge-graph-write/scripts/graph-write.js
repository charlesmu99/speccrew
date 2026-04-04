#!/usr/bin/env node
/**
 * Knowledge Graph Write Operations
 * Write, update, and initialize knowledge graph data (nodes, edges, index, metadata).
 * All data stored under {graphRoot}/ directory.
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
            const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
            parsed[key] = value;
            if (value !== true) i++;
        }
    }
    
    return parsed;
}

const args = parseArgs();

// ── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJsonFile(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    return null;
}

function writeJsonFile(filePath, obj) {
    const json = JSON.stringify(obj, null, 2);
    fs.writeFileSync(filePath, json, 'utf-8');
}

function getModuleFromId(nodeId) {
    if (!nodeId || typeof nodeId !== 'string') return null;
    // ID format: {type}-{module}-{name}, extract module (second segment)
    const parts = nodeId.split('-');
    if (parts.length >= 2) return parts[1];
    return null;
}

function getIndexPath(graphRoot) {
    return path.join(graphRoot, 'indices', 'index.json');
}

function getMetaPath(graphRoot) {
    return path.join(graphRoot, 'graph-meta.json');
}

function getNodesPath(graphRoot, platformId, module) {
    return path.join(graphRoot, 'nodes', platformId, `${module}.json`);
}

function getEdgesPath(graphRoot, platformId, module) {
    return path.join(graphRoot, 'edges', platformId, `${module}.json`);
}

function getCrossEdgesPath(graphRoot, platformId) {
    return path.join(graphRoot, 'edges', platformId, 'cross-module.json');
}

function getCurrentTimestamp() {
    return new Date().toISOString();
}

// ── Actions ─────────────────────────────────────────────────────────────────

function invokeInitModule(graphRoot, platformId, module) {
    ensureDir(path.join(graphRoot, 'nodes', platformId));
    ensureDir(path.join(graphRoot, 'edges', platformId));
    ensureDir(path.join(graphRoot, 'indices'));

    // nodes/{platformId}/{module}.json
    const nodesPath = getNodesPath(graphRoot, platformId, module);
    if (!fs.existsSync(nodesPath)) {
        const nodesObj = { module, nodes: [] };
        writeJsonFile(nodesPath, nodesObj);
    }

    // edges/{platformId}/{module}.json
    const edgesPath = getEdgesPath(graphRoot, platformId, module);
    if (!fs.existsSync(edgesPath)) {
        const edgesObj = { module, edges: [] };
        writeJsonFile(edgesPath, edgesObj);
    }

    // edges/{platformId}/cross-module.json
    const crossPath = getCrossEdgesPath(graphRoot, platformId);
    if (!fs.existsSync(crossPath)) {
        const crossObj = { edges: [] };
        writeJsonFile(crossPath, crossObj);
    }

    // indices/index.json
    const indexPath = getIndexPath(graphRoot);
    if (!fs.existsSync(indexPath)) {
        writeJsonFile(indexPath, {});
    }

    // graph-meta.json
    const metaPath = getMetaPath(graphRoot);
    if (fs.existsSync(metaPath)) {
        const meta = readJsonFile(metaPath);
        const modules = meta.modules || [];
        const moduleKey = `${platformId}/${module}`;
        if (!modules.includes(moduleKey)) {
            modules.push(moduleKey);
            meta.modules = modules;
            meta.updatedAt = getCurrentTimestamp();
            writeJsonFile(metaPath, meta);
        }
    } else {
        const meta = {
            version: '1.0.0',
            updatedAt: getCurrentTimestamp(),
            modules: [`${platformId}/${module}`],
            stats: {
                totalNodes: 0,
                totalEdges: 0,
                nodesByType: {
                    page: 0, api: 0, table: 0, service: 0, component: 0, dto: 0, module: 0
                }
            }
        };
        writeJsonFile(metaPath, meta);
    }

    return {
        status: 'success',
        action: 'init-module',
        platformId,
        module,
        message: `Module '${module}' initialized for platform '${platformId}'`
    };
}

function invokeAddNodes(graphRoot, platformId, module, filePath) {
    const batchData = readJsonFile(filePath);
    const newNodes = batchData.nodes || [];
    
    if (newNodes.length === 0) {
        return {
            status: 'success',
            action: 'add-nodes',
            platformId,
            module,
            nodesWritten: 0,
            message: 'No nodes to add'
        };
    }

    const nodesPath = getNodesPath(graphRoot, platformId, module);
    let existing = readJsonFile(nodesPath);
    if (!existing) {
        invokeInitModule(graphRoot, platformId, module);
        existing = readJsonFile(nodesPath);
    }

    // Build lookup of existing nodes by id
    const nodeMap = {};
    for (const n of existing.nodes) {
        nodeMap[n.id] = n;
    }

    // Add/replace nodes
    for (const n of newNodes) {
        nodeMap[n.id] = n;
    }

    existing.nodes = Object.values(nodeMap);
    writeJsonFile(nodesPath, existing);

    // Update index
    const indexPath = getIndexPath(graphRoot);
    let index = readJsonFile(indexPath);
    if (!index) index = {};

    for (const n of newNodes) {
        index[n.id] = { platformId, module, type: n.type };
    }
    writeJsonFile(indexPath, index);

    // Update graph-meta.json stats
    invokeUpdateMeta(graphRoot);

    return {
        status: 'success',
        action: 'add-nodes',
        platformId,
        module,
        nodesWritten: newNodes.length,
        message: `Added ${newNodes.length} nodes to ${platformId}/${module}`
    };
}

function invokeAddEdges(graphRoot, platformId, module, filePath) {
    const batchData = readJsonFile(filePath);
    const newEdges = batchData.edges || [];
    
    if (newEdges.length === 0) {
        return {
            status: 'success',
            action: 'add-edges',
            platformId,
            module,
            edgesWritten: 0,
            message: 'No edges to add'
        };
    }

    // Separate module-internal and cross-module edges
    const internalEdges = [];
    const crossEdges = [];

    for (const e of newEdges) {
        if (!e.source || !e.target) {
            console.warn(`Skipping invalid edge (missing source/target): ${JSON.stringify(e)}`);
            continue;
        }
        const srcMod = getModuleFromId(e.source);
        const tgtMod = getModuleFromId(e.target);
        if (!srcMod || !tgtMod) {
            console.warn(`Skipping edge with unparseable node ID: source=${e.source}, target=${e.target}`);
            continue;
        }
        if (srcMod !== tgtMod) {
            crossEdges.push(e);
        } else {
            internalEdges.push(e);
        }
    }

    // Write internal edges
    if (internalEdges.length > 0) {
        const edgesPath = getEdgesPath(graphRoot, platformId, module);
        let existing = readJsonFile(edgesPath);
        if (!existing) {
            invokeInitModule(graphRoot, platformId, module);
            existing = readJsonFile(edgesPath);
        }

        // Build dedup key: source+target+type
        const edgeMap = {};
        for (const e of existing.edges) {
            const key = `${e.source}|${e.target}|${e.type}`;
            edgeMap[key] = e;
        }
        for (const e of internalEdges) {
            const key = `${e.source}|${e.target}|${e.type}`;
            edgeMap[key] = e;
        }

        existing.edges = Object.values(edgeMap);
        writeJsonFile(edgesPath, existing);
    }

    // Write cross-module edges
    if (crossEdges.length > 0) {
        const crossPath = getCrossEdgesPath(graphRoot, platformId);
        let crossFile = readJsonFile(crossPath);
        if (!crossFile) {
            // Ensure directory exists before creating cross-module.json
            ensureDir(path.dirname(crossPath));
            crossFile = { edges: [] };
        }

        const edgeMap = {};
        for (const e of crossFile.edges) {
            const key = `${e.source}|${e.target}|${e.type}`;
            edgeMap[key] = e;
        }
        for (const e of crossEdges) {
            const key = `${e.source}|${e.target}|${e.type}`;
            edgeMap[key] = e;
        }

        crossFile.edges = Object.values(edgeMap);
        writeJsonFile(crossPath, crossFile);
    }

    const total = internalEdges.length + crossEdges.length;

    // Update graph-meta.json stats
    invokeUpdateMeta(graphRoot);

    return {
        status: 'success',
        action: 'add-edges',
        platformId,
        module,
        edgesWritten: total,
        internalEdges: internalEdges.length,
        crossModuleEdges: crossEdges.length,
        message: `Added ${total} edges (${internalEdges.length} internal, ${crossEdges.length} cross-module)`
    };
}

function invokeUpdateNode(graphRoot, platformId, nodeId, dataJson) {
    const module = getModuleFromId(nodeId);
    const nodesPath = getNodesPath(graphRoot, platformId, module);
    const existing = readJsonFile(nodesPath);
    
    if (!existing) {
        return {
            status: 'failed',
            message: `Module '${module}' not found for platform '${platformId}'`
        };
    }

    const updateData = JSON.parse(dataJson);
    let found = false;

    for (let i = 0; i < existing.nodes.length; i++) {
        if (existing.nodes[i].id === nodeId) {
            // Merge update fields into existing node
            Object.assign(existing.nodes[i], updateData);
            found = true;
            break;
        }
    }

    if (!found) {
        return {
            status: 'failed',
            message: `Node '${nodeId}' not found in module '${module}' (platform: ${platformId})`
        };
    }

    writeJsonFile(nodesPath, existing);
    return {
        status: 'success',
        action: 'update-node',
        platformId,
        nodeId,
        message: `Node '${nodeId}' updated`
    };
}

function invokeRemoveNode(graphRoot, platformId, nodeId) {
    const module = getModuleFromId(nodeId);
    const nodesPath = getNodesPath(graphRoot, platformId, module);
    const existing = readJsonFile(nodesPath);
    
    if (!existing) {
        return {
            status: 'failed',
            message: `Module '${module}' not found for platform '${platformId}'`
        };
    }

    // Remove node
    existing.nodes = existing.nodes.filter(n => n.id !== nodeId);
    writeJsonFile(nodesPath, existing);

    // Remove edges referencing this node (internal)
    const edgesPath = getEdgesPath(graphRoot, platformId, module);
    const edgesFile = readJsonFile(edgesPath);
    if (edgesFile) {
        edgesFile.edges = edgesFile.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        writeJsonFile(edgesPath, edgesFile);
    }

    // Remove edges referencing this node (cross-module)
    const crossPath = getCrossEdgesPath(graphRoot, platformId);
    const crossFile = readJsonFile(crossPath);
    if (crossFile) {
        crossFile.edges = crossFile.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        writeJsonFile(crossPath, crossFile);
    }

    // Remove from index
    const indexPath = getIndexPath(graphRoot);
    const index = readJsonFile(indexPath);
    if (index && index[nodeId]) {
        delete index[nodeId];
        writeJsonFile(indexPath, index);
    }

    return {
        status: 'success',
        action: 'remove-node',
        platformId,
        nodeId,
        message: `Node '${nodeId}' and related edges removed`
    };
}

function invokeRebuildIndex(graphRoot) {
    const indexPath = getIndexPath(graphRoot);
    const nodesDir = path.join(graphRoot, 'nodes');
    const index = {};

    if (fs.existsSync(nodesDir)) {
        // Scan platform subdirectories
        const platformDirs = fs.readdirSync(nodesDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const platformId of platformDirs) {
            const platformDir = path.join(nodesDir, platformId);
            const files = fs.readdirSync(platformDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(platformDir, file);
                const data = readJsonFile(filePath);
                if (data && data.nodes) {
                    for (const n of data.nodes) {
                        index[n.id] = { platformId, module: data.module, type: n.type };
                    }
                }
            }
        }
    }

    writeJsonFile(indexPath, index);
    const count = Object.keys(index).length;
    return {
        status: 'success',
        action: 'rebuild-index',
        indexEntries: count,
        message: `Index rebuilt with ${count} entries`
    };
}

function invokeUpdateMeta(graphRoot) {
    const metaPath = getMetaPath(graphRoot);
    const nodesDir = path.join(graphRoot, 'nodes');
    const edgesDir = path.join(graphRoot, 'edges');

    let totalNodes = 0;
    let totalEdges = 0;
    const nodesByType = { page: 0, api: 0, table: 0, service: 0, component: 0, dto: 0, module: 0 };
    const modules = [];

    if (fs.existsSync(nodesDir)) {
        // Scan platform subdirectories
        const platformDirs = fs.readdirSync(nodesDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const platformId of platformDirs) {
            const platformDir = path.join(nodesDir, platformId);
            const files = fs.readdirSync(platformDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(platformDir, file);
                const data = readJsonFile(filePath);
                if (data && data.nodes) {
                    modules.push(`${platformId}/${data.module}`);
                    for (const n of data.nodes) {
                        totalNodes++;
                        if (nodesByType.hasOwnProperty(n.type)) {
                            nodesByType[n.type]++;
                        }
                    }
                }
            }
        }
    }

    if (fs.existsSync(edgesDir)) {
        // Scan platform subdirectories
        const platformDirs = fs.readdirSync(edgesDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const platformId of platformDirs) {
            const platformDir = path.join(edgesDir, platformId);
            const files = fs.readdirSync(platformDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(platformDir, file);
                const data = readJsonFile(filePath);
                if (data && data.edges) {
                    totalEdges += data.edges.length;
                }
            }
        }
    }

    const meta = {
        version: '1.0.0',
        updatedAt: getCurrentTimestamp(),
        modules: [...new Set(modules)].sort(),
        stats: {
            totalNodes,
            totalEdges,
            nodesByType
        }
    };

    writeJsonFile(metaPath, meta);
    return {
        status: 'success',
        action: 'update-meta',
        totalNodes,
        totalEdges,
        message: `Metadata updated: ${totalNodes} nodes, ${totalEdges} edges`
    };
}

function invokeBatchWrite(graphRoot, platformId, module, filePath) {
    // Batch write combines add-nodes and add-edges
    const batchData = readJsonFile(filePath);
    
    let nodesWritten = 0;
    let edgesWritten = 0;
    let internalEdges = 0;
    let crossModuleEdges = 0;

    // Add nodes if present
    if (batchData.nodes && batchData.nodes.length > 0) {
        const nodesResult = invokeAddNodes(graphRoot, platformId, module, filePath);
        nodesWritten = nodesResult.nodesWritten || 0;
    }

    // Add edges if present
    if (batchData.edges && batchData.edges.length > 0) {
        const edgesResult = invokeAddEdges(graphRoot, platformId, module, filePath);
        edgesWritten = edgesResult.edgesWritten || 0;
        internalEdges = edgesResult.internalEdges || 0;
        crossModuleEdges = edgesResult.crossModuleEdges || 0;
    }

    // Update index and meta
    invokeRebuildIndex(graphRoot);
    invokeUpdateMeta(graphRoot);

    return {
        status: 'success',
        action: 'batch-write',
        platformId,
        module,
        nodesWritten,
        edgesWritten,
        internalEdges,
        crossModuleEdges,
        message: `Successfully wrote ${nodesWritten} nodes and ${edgesWritten} edges to ${platformId}/${module} module`
    };
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
    const action = args.action;
    const graphRoot = args.graphRoot;
    const platformId = args.platformId;

    if (!action) {
        console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameter: --action' }));
        process.exit(1);
    }

    if (!graphRoot) {
        console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameter: --graphRoot' }));
        process.exit(1);
    }

    const validActions = ['batch-write', 'init-module', 'add-nodes', 'add-edges', 'update-node', 'remove-node', 'rebuild-index', 'update-meta'];
    if (!validActions.includes(action)) {
        console.error(JSON.stringify({ status: 'failed', message: `Invalid action: ${action}. Valid actions: ${validActions.join(', ')}` }));
        process.exit(1);
    }

    // Actions that require platformId
    const platformRequiredActions = ['batch-write', 'init-module', 'add-nodes', 'add-edges', 'update-node', 'remove-node'];
    if (platformRequiredActions.includes(action) && !platformId) {
        console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameter: --platformId' }));
        process.exit(1);
    }

    let result;

    switch (action) {
        case 'init-module':
            if (!args.module) {
                console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameter: --module' }));
                process.exit(1);
            }
            result = invokeInitModule(graphRoot, platformId, args.module);
            break;
        
        case 'add-nodes':
            if (!args.module || !args.file) {
                console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameters: --module and --file' }));
                process.exit(1);
            }
            result = invokeAddNodes(graphRoot, platformId, args.module, args.file);
            break;
        
        case 'add-edges':
            if (!args.module || !args.file) {
                console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameters: --module and --file' }));
                process.exit(1);
            }
            result = invokeAddEdges(graphRoot, platformId, args.module, args.file);
            break;
        
        case 'update-node':
            if (!args.id || !args.data) {
                console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameters: --id and --data' }));
                process.exit(1);
            }
            result = invokeUpdateNode(graphRoot, platformId, args.id, args.data);
            break;
        
        case 'remove-node':
            if (!args.id) {
                console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameter: --id' }));
                process.exit(1);
            }
            result = invokeRemoveNode(graphRoot, platformId, args.id);
            break;
        
        case 'rebuild-index':
            result = invokeRebuildIndex(graphRoot);
            break;
        
        case 'update-meta':
            result = invokeUpdateMeta(graphRoot);
            break;
        
        case 'batch-write':
            if (!args.module || !args.file) {
                console.error(JSON.stringify({ status: 'failed', message: 'Missing required parameters: --module and --file' }));
                process.exit(1);
            }
            result = invokeBatchWrite(graphRoot, platformId, args.module, args.file);
            break;
    }

    console.log(JSON.stringify(result));
}

main();
