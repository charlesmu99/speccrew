#!/usr/bin/env node

/**
 * Batch process completed analysis results.
 *
 * Scans the completed/ directory for .done and .graph.json marker files,
 * updates feature statuses, writes graph data, updates metadata, and cleans up.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        syncStatePath: null,
        graphRoot: null,
        graphWriteScript: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--syncStatePath':
            case '-SyncStatePath':
                result.syncStatePath = args[++i];
                break;
            case '--graphRoot':
            case '-GraphRoot':
                result.graphRoot = args[++i];
                break;
            case '--graphWriteScript':
            case '-GraphWriteScript':
                result.graphWriteScript = args[++i];
                break;
        }
    }

    return result;
}

function main() {
    const args = parseArgs();

    if (!args.syncStatePath || !args.graphRoot || !args.graphWriteScript) {
        console.error('Error: --syncStatePath, --graphRoot, and --graphWriteScript are required');
        process.exit(1);
    }

    // Ensure paths are absolute
    const syncStatePath = path.resolve(args.syncStatePath);
    const graphRoot = path.resolve(args.graphRoot);
    const graphWriteScript = path.resolve(args.graphWriteScript);

    if (!fs.existsSync(syncStatePath)) {
        console.error(`SyncStatePath not found: ${args.syncStatePath}`);
        process.exit(1);
    }
    if (!fs.existsSync(graphRoot)) {
        console.error(`GraphRoot not found: ${args.graphRoot}`);
        process.exit(1);
    }
    if (!fs.existsSync(graphWriteScript)) {
        console.error(`GraphWriteScript not found: ${args.graphWriteScript}`);
        process.exit(1);
    }

    const completedDir = path.join(syncStatePath, 'completed');

    // Result tracking
    let processedCount = 0;
    const modulesUpdated = [];
    const errors = [];
    const failedOperations = [];

    // Track successfully processed files for cleanup
    const successfulDoneFiles = new Set();
    const successfulGraphFiles = new Set();

    // Helper: Write error and continue
    function writeErrorContinue(message) {
        errors.push(message);
        console.warn(`Warning: ${message}`);
    }

    // Helper: Record failed operation
    function addFailedOperation(module, operation, errorMessage) {
        failedOperations.push({
            module: module,
            operation: operation,
            error: errorMessage
        });
    }

    // Helper: Call external script (graph-write)
    function callGraphWriteScript(action, module, tempFile, graphRootPath) {
        const ext = path.extname(graphWriteScript).toLowerCase();
        let command, commandArgs;

        if (ext === '.ps1') {
            command = 'powershell';
            commandArgs = ['-File', graphWriteScript, '-Action', action, '-Module', module, '-File', tempFile, '-GraphRoot', graphRootPath];
        } else {
            command = 'node';
            commandArgs = [graphWriteScript, '--action', action, '--module', module, '--file', tempFile, '--graphRoot', graphRootPath];
        }

        execFileSync(command, commandArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    }

    // Helper: Update feature status using update-feature-status.js
    function updateFeatureStatus(sourceFilePath, fileName, featureSourcePath, analyzed, setCompleted, analysisNotes) {
        const updateStatusScript = path.join(path.dirname(__filename), 'update-feature-status.js');
        const commandArgs = [
            updateStatusScript,
            '--sourceFile', sourceFilePath,
            '--fileName', fileName,
            '--analyzed', analyzed
        ];

        if (featureSourcePath) {
            commandArgs.push('--featureSourcePath', featureSourcePath);
        }
        if (setCompleted) {
            commandArgs.push('--setCompleted');
        }
        if (analysisNotes) {
            commandArgs.push('--analysisNotes', analysisNotes);
        }

        execFileSync('node', commandArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    }

    // ── Step 1: Process .done files and update status ────────────────────────────

    // Fallback: try to parse key=value format when JSON parsing fails
    function parseFallbackDone(rawContent, fileName) {
        const result = {};
        const lines = rawContent.split(/\r?\n/);
        for (const line of lines) {
            const match = line.match(/^\s*(\w+)\s*[=:]\s*(.+?)\s*$/);
            if (match) {
                result[match[1]] = match[2].replace(/^["']|["']$/g, '');
            }
        }
        if (result.fileName || result.status) {
            console.warn(`Parsed .done file ${fileName} using fallback key=value format`);
            return result;
        }
        return null;
    }

    function processDoneFiles() {
        if (!fs.existsSync(completedDir)) {
            return;
        }

        const doneFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.done'));

        for (const doneFile of doneFiles) {
            let rawContent;
            try {
                const doneFilePath = path.join(completedDir, doneFile);
                rawContent = fs.readFileSync(doneFilePath, 'utf8');
                if (!rawContent || rawContent.trim() === '') {
                    console.warn(`Empty .done file detected: ${doneFile} - Worker may have failed to write content`);
                    continue;
                }
                const content = JSON.parse(rawContent);

                const fileName = content.fileName;
                const featureSourcePath = content.sourcePath;
                const sourceFile = content.sourceFile;
                const module = content.module;
                const analysisNotes = content.analysisNotes;

                if (!fileName || !sourceFile) {
                    console.warn(`Invalid .done file format: ${doneFile}`);
                    console.warn(`  Expected fields: fileName (got: '${fileName}'), sourceFile (got: '${sourceFile}')`);
                    console.warn(`  File content preview: ${rawContent.substring(0, Math.min(200, rawContent.length))}`);
                    continue;
                }

                // Build source file path (relative to SyncStatePath)
                const sourceFilePath = path.join(syncStatePath, sourceFile);

                // Call update-feature-status.js
                updateFeatureStatus(sourceFilePath, fileName, featureSourcePath, 'true', true, analysisNotes);

                processedCount++;
                successfulDoneFiles.add(doneFile);
            } catch (error) {
                // Defensive check: if rawContent is undefined, file read itself failed
                if (rawContent === undefined) {
                    writeErrorContinue(`Failed to read .done file ${doneFile}: ${error.message}`);
                    continue;
                }
                // Try fallback parsing for non-JSON format
                const fallbackContent = parseFallbackDone(rawContent, doneFile);
                if (fallbackContent) {
                    const fileName = fallbackContent.fileName;
                    const featureSourcePath = fallbackContent.sourcePath;
                    const sourceFile = fallbackContent.sourceFile;
                    const analysisNotes = fallbackContent.analysisNotes;

                    if (fileName && sourceFile) {
                        const sourceFilePath = path.join(syncStatePath, sourceFile);
                        try {
                            updateFeatureStatus(sourceFilePath, fileName, featureSourcePath, 'true', true, analysisNotes);
                            processedCount++;
                            successfulDoneFiles.add(doneFile);
                            continue;
                        } catch (fallbackError) {
                            writeErrorContinue(`Failed to process .done file ${doneFile} (fallback): ${fallbackError.message}`);
                            continue;
                        }
                    }
                }
                writeErrorContinue(`Failed to process .done file ${doneFile}: ${error.message}`);
            }
        }
    }

    // ── Step 2: Collect .graph.json files and write by module ────────────────────

    function processGraphFiles() {
        if (!fs.existsSync(completedDir)) {
            return;
        }

        const graphFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.graph.json'));

        if (graphFiles.length === 0) {
            return;
        }

        // Group by module
        const moduleGroups = {};

        for (const graphFile of graphFiles) {
            try {
                const graphFilePath = path.join(completedDir, graphFile);
                const rawContent = fs.readFileSync(graphFilePath, 'utf8');
                if (!rawContent || rawContent.trim() === '') {
                    console.warn(`Empty .graph.json file detected: ${graphFile} - Worker may have failed to write content`);
                    continue;
                }
                const content = JSON.parse(rawContent);
                const module = content.module;

                if (!module) {
                    // Try to infer module from filename: e.g. "system-UserController.graph.json" -> "system"
                    const fileBaseName = graphFile.replace('.graph.json', '');
                    const inferredModule = fileBaseName.split('-')[0];
                    if (inferredModule) {
                        content.module = inferredModule;
                        console.warn(`Missing module field, inferred "${inferredModule}" from filename: ${graphFile}`);
                    } else {
                        console.warn(`Cannot infer module from filename: ${graphFile}, skipping`);
                        console.warn(`  File content preview: ${rawContent.substring(0, Math.min(200, rawContent.length))}`);
                        continue;
                    }
                }

                const effectiveModule = content.module;

                if (!moduleGroups[effectiveModule]) {
                    moduleGroups[effectiveModule] = {
                        nodes: [],
                        edges: [],
                        files: []
                    };
                }

                if (content.nodes && Array.isArray(content.nodes)) {
                    moduleGroups[effectiveModule].nodes.push(...content.nodes);
                }
                if (content.edges && Array.isArray(content.edges)) {
                    moduleGroups[effectiveModule].edges.push(...content.edges);
                }
                moduleGroups[effectiveModule].files.push(graphFilePath);
            } catch (error) {
                writeErrorContinue(`Failed to read .graph.json file ${graphFile}: ${error.message}`);
            }
        }

        // Process each module
        for (const module of Object.keys(moduleGroups)) {
            const group = moduleGroups[module];
            let tempFile = null;
            let nodesOk = true;
            let edgesOk = true;

            try {
                // Create temp file with merged data
                const tempFileName = `temp-graph-${module}-${new Date().toISOString().replace(/[:.]/g, '')}.json`;
                tempFile = path.join(require('os').tmpdir(), tempFileName);

                const mergedData = {
                    nodes: group.nodes,
                    edges: group.edges
                };

                fs.writeFileSync(tempFile, JSON.stringify(mergedData, null, 2), 'utf8');

                // Call graph-write script for nodes
                if (group.nodes.length > 0) {
                    try {
                        callGraphWriteScript('add-nodes', module, tempFile, graphRoot);
                    } catch (error) {
                        nodesOk = false;
                        const errorMsg = `Failed to add nodes for module '${module}': ${error.message}`;
                        console.warn(errorMsg);
                        console.warn(`  Parameters: Action=add-nodes, Module=${module}, File=${tempFile}, GraphRoot=${graphRoot}`);
                        addFailedOperation(module, 'add-nodes', error.message);
                    }
                }

                // Call graph-write script for edges
                if (group.edges.length > 0) {
                    try {
                        callGraphWriteScript('add-edges', module, tempFile, graphRoot);
                    } catch (error) {
                        edgesOk = false;
                        const errorMsg = `Failed to add edges for module '${module}': ${error.message}`;
                        console.warn(errorMsg);
                        console.warn(`  Parameters: Action=add-edges, Module=${module}, File=${tempFile}, GraphRoot=${graphRoot}`);
                        addFailedOperation(module, 'add-edges', error.message);
                    }
                }

                // Track updated module
                if (!modulesUpdated.includes(module)) {
                    modulesUpdated.push(module);
                }
            } catch (error) {
                writeErrorContinue(`Failed to write graph data for module '${module}': ${error.message}`);
            } finally {
                // Mark files as successful only if both nodes and edges were written successfully
                if (nodesOk && edgesOk) {
                    for (const filePath of group.files) {
                        successfulGraphFiles.add(path.basename(filePath));
                    }
                }
                // Clean up temp file
                if (tempFile && fs.existsSync(tempFile)) {
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
            }
        }
    }

    // ── Step 3: Update metadata ──────────────────────────────────────────────────

    function updateMetadata() {
        try {
            const ext = path.extname(graphWriteScript).toLowerCase();
            let command, commandArgs;

            if (ext === '.ps1') {
                command = 'powershell';
                commandArgs = ['-File', graphWriteScript, '-Action', 'update-meta', '-GraphRoot', graphRoot];
            } else {
                command = 'node';
                commandArgs = [graphWriteScript, '--action', 'update-meta', '--graphRoot', graphRoot];
            }

            execFileSync(command, commandArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
        } catch (error) {
            const errorMsg = `Failed to update metadata: ${error.message}`;
            console.warn(errorMsg);
            console.warn(`  Parameters: Action=update-meta, GraphRoot=${graphRoot}`);
            addFailedOperation('N/A', 'update-meta', error.message);
        }
    }

    // ── Step 4: Clean up marker files ────────────────────────────────────────────

    function removeMarkerFiles() {
        if (!fs.existsSync(completedDir)) {
            return;
        }

        // Remove .done files (only successfully processed ones)
        const doneFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.done'));
        for (const file of doneFiles) {
            if (successfulDoneFiles.has(file)) {
                try {
                    fs.unlinkSync(path.join(completedDir, file));
                } catch (error) {
                    writeErrorContinue(`Failed to remove .done file ${file}: ${error.message}`);
                }
            } else {
                // Log failed .done file content for debugging, then delete to avoid blocking get-next-batch
                try {
                    const failedContent = fs.readFileSync(path.join(completedDir, file), 'utf8');
                    console.warn(`Removing failed .done file: ${file}`);
                    console.warn(`  Content was: ${failedContent.substring(0, Math.min(500, failedContent.length))}`);
                    fs.unlinkSync(path.join(completedDir, file));
                } catch (error) {
                    writeErrorContinue(`Failed to remove failed .done file ${file}: ${error.message}`);
                }
            }
        }

        // Remove .graph.json files (only successfully processed ones)
        const graphFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.graph.json'));
        for (const file of graphFiles) {
            if (successfulGraphFiles.has(file)) {
                try {
                    fs.unlinkSync(path.join(completedDir, file));
                } catch (error) {
                    writeErrorContinue(`Failed to remove .graph.json file ${file}: ${error.message}`);
                }
            } else {
                // Log failed .graph.json file content for debugging, then delete to avoid blocking get-next-batch
                try {
                    const failedContent = fs.readFileSync(path.join(completedDir, file), 'utf8');
                    console.warn(`Removing failed .graph.json file: ${file}`);
                    console.warn(`  Content was: ${failedContent.substring(0, Math.min(500, failedContent.length))}`);
                    fs.unlinkSync(path.join(completedDir, file));
                } catch (error) {
                    writeErrorContinue(`Failed to remove failed .graph.json file ${file}: ${error.message}`);
                }
            }
        }
    }

    // ── Main Execution ───────────────────────────────────────────────────────────

    try {
        processDoneFiles();
        processGraphFiles();
        updateMetadata();
        removeMarkerFiles();
    } catch (error) {
        writeErrorContinue(`Unexpected error during batch processing: ${error.message}`);
    }

    // ── Output Summary ───────────────────────────────────────────────────────────

    const output = {
        processed: processedCount,
        modules_updated: modulesUpdated,
        errors: errors,
        failed_operations: failedOperations
    };

    console.log(JSON.stringify(output, null, 2));

    // Output failed operations summary if any
    if (failedOperations.length > 0) {
        console.warn('=== Failed Operations Summary ===');
        for (const op of failedOperations) {
            console.warn(`  Module: ${op.module}, Operation: ${op.operation}, Error: ${op.error}`);
        }
    }
}

main();
