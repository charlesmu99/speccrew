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

// Helper: Validate and normalize .done file content
function validateAndNormalizeDoneContent(content, doneFile) {
    // Strip file extensions from fileName if present
    if (content.fileName && /\.\w+$/.test(content.fileName)) {
        const original = content.fileName;
        content.fileName = content.fileName.replace(/\.\w+$/, '');
        console.warn(`[WARN] .done file ${doneFile}: stripped extension from fileName "${original}" → "${content.fileName}"`);
    }

    // Validate required fields
    if (!content.fileName) {
        throw new Error(`Missing required field "fileName" in ${doneFile}`);
    }
    if (!content.sourceFile) {
        throw new Error(`Missing required field "sourceFile" in ${doneFile}`);
    }

    // Validate sourcePath format if present
    if (content.sourcePath && typeof content.sourcePath !== 'string') {
        console.warn(`[WARN] .done file ${doneFile}: invalid sourcePath type, converting to string`);
        content.sourcePath = String(content.sourcePath);
    }

    return content;
}

// Helper: Get project root directory (traverse upward to find speccrew-workspace or .git)
function getProjectRoot(startPath) {
    let currentDir = path.resolve(startPath);
    while (currentDir !== path.dirname(currentDir)) {
        // Check for common project root markers
        if (fs.existsSync(path.join(currentDir, 'speccrew-workspace')) ||
            fs.existsSync(path.join(currentDir, '.git'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    // Fallback: return the parent of syncStatePath
    return path.dirname(path.resolve(startPath));
}

// Helper: Find feature document path from features-{platform}.json
function findFeatureDocumentPath(syncStatePath, sourceFile, fileName, featureSourcePath) {
    try {
        // Read the source features JSON file
        const sourceFilePath = path.join(syncStatePath, sourceFile);
        if (!fs.existsSync(sourceFilePath)) {
            return null;
        }

        const content = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));
        if (!content.features || !Array.isArray(content.features)) {
            return null;
        }

        // Find matching feature by fileName and sourcePath
        const feature = content.features.find(f => {
            const nameMatch = f.fileName === fileName;
            const pathMatch = featureSourcePath ? f.sourcePath === featureSourcePath : true;
            return nameMatch && pathMatch;
        });

        return feature ? feature.documentPath : null;
    } catch (error) {
        console.warn(`[WARN] Failed to find document path for ${fileName}: ${error.message}`);
        return null;
    }
}

// Helper: Check if document exists for a feature
function checkDocumentExists(syncStatePath, sourceFile, fileName, featureSourcePath) {
    const documentPath = findFeatureDocumentPath(syncStatePath, sourceFile, fileName, featureSourcePath);
    if (!documentPath) {
        return { exists: false, path: null };
    }

    const projectRoot = getProjectRoot(syncStatePath);
    // Extract platform from sourceFile (features-{platform}.json)
    const platform = sourceFile.replace('features-', '').replace('.json', '');
    // Build correct base path: speccrew-workspace/knowledges/bizs/{platform}/
    const bizsBasePath = path.join(projectRoot, 'speccrew-workspace', 'knowledges', 'bizs', platform);
    const fullPath = path.join(bizsBasePath, documentPath);
    return { exists: fs.existsSync(fullPath), path: documentPath };
}

// Validate document existence for all analyzed features
function validateDocumentExistence(syncStatePath) {
    console.log('=== Document Existence Validation ===');

    const syncStateDir = path.resolve(syncStatePath);
    if (!fs.existsSync(syncStateDir)) {
        console.error(`SyncStatePath not found: ${syncStatePath}`);
        process.exit(1);
    }

    // Find all features-{platform}.json files
    const files = fs.readdirSync(syncStateDir).filter(f => f.startsWith('features-') && f.endsWith('.json'));

    let totalAnalyzed = 0;
    let missingDocs = 0;
    const missingList = [];

    for (const file of files) {
        const filePath = path.join(syncStateDir, file);
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!content.features || !Array.isArray(content.features)) {
                continue;
            }

            // Extract platform from filename (features-{platform}.json)
            const platform = file.replace('features-', '').replace('.json', '');
            const projectRoot = getProjectRoot(syncStatePath);
            // Build correct base path: speccrew-workspace/knowledges/bizs/{platform}/
            const bizsBasePath = path.join(projectRoot, 'speccrew-workspace', 'knowledges', 'bizs', platform);

            for (const feature of content.features) {
                if (feature.analyzed === true || feature.analyzed === 'true') {
                    totalAnalyzed++;

                    const docPath = feature.documentPath;
                    // Join with correct bizs base path instead of project root
                    const fullPath = docPath ? path.join(bizsBasePath, docPath) : null;

                    if (!docPath || !fs.existsSync(fullPath)) {
                        missingDocs++;
                        const missingInfo = {
                            platform: platform,
                            feature: feature.fileName || feature.id,
                            documentPath: docPath || 'N/A'
                        };
                        missingList.push(missingInfo);
                        console.warn(`[MISSING] ${missingInfo.platform}/${missingInfo.feature}: ${missingInfo.documentPath}`);
                    }
                }
            }
        } catch (error) {
            console.warn(`[WARN] Failed to process ${file}: ${error.message}`);
        }
    }

    console.log('\n=== Validation Summary ===');
    console.log(`Total analyzed features: ${totalAnalyzed}`);
    console.log(`Missing documents: ${missingDocs}`);

    if (missingList.length > 0) {
        console.log('\nMissing documents list:');
        for (const item of missingList) {
            console.log(`  - ${item.platform}/${item.feature}: ${item.documentPath}`);
        }
        process.exit(1);
    } else {
        console.log('All analyzed features have corresponding documents.');
        process.exit(0);
    }
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        syncStatePath: null,
        graphRoot: null,
        graphWriteScript: null,
        platformId: null,
        validateDocs: false
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
            case '--platformId':
            case '-PlatformId':
                result.platformId = args[++i];
                break;
            case '--validateDocs':
                result.validateDocs = true;
                break;
        }
    }

    return result;
}

function main() {
    const args = parseArgs();

    // Handle --validateDocs mode: validate document existence and exit
    if (args.validateDocs) {
        if (!args.syncStatePath) {
            console.error('Error: --syncStatePath is required for --validateDocs mode');
            process.exit(1);
        }
        validateDocumentExistence(args.syncStatePath);
        return;
    }

    if (!args.syncStatePath || !args.graphRoot || !args.graphWriteScript) {
        console.error('Error: --syncStatePath, --graphRoot, and --graphWriteScript are required');
        process.exit(1);
    }

    if (!args.platformId) {
        console.error('Error: --platformId is required');
        process.exit(1);
    }

    const platformId = args.platformId;

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

    // Diagnostic logging for completed directory
    console.log(`Scanning for .done files in: ${completedDir}`);
    console.log(`Directory exists: ${fs.existsSync(completedDir)}`);

    // Auto-create completed directory if it doesn't exist
    if (!fs.existsSync(completedDir)) {
        console.error(`[ERROR] completed directory does not exist: ${completedDir}`);
        console.log(`[INFO] Auto-creating completed directory...`);
        try {
            fs.mkdirSync(completedDir, { recursive: true });
            console.log(`[INFO] Successfully created completed directory`);
        } catch (error) {
            console.error(`[ERROR] Failed to create completed directory: ${error.message}`);
        }
    }

    // Check for .done files and warn if none found
    if (fs.existsSync(completedDir)) {
        const allFiles = fs.readdirSync(completedDir);
        const doneFiles = allFiles.filter(f => f.endsWith('.done'));
        if (doneFiles.length === 0) {
            console.warn(`[WARNING] No .done files found in completed directory. Workers may not have created marker files correctly.`);
            console.warn(`[INFO] Files in completed directory: ${allFiles.length > 0 ? allFiles.join(', ') : '(empty)'}`);
        } else {
            console.log(`[INFO] Found ${doneFiles.length} .done file(s)`);
        }
    }

    // Result tracking
    let processedCount = 0;
    let skippedFilesCount = 0;
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
    function callGraphWriteScript(action, module, tempFile, graphRootPath, platformId) {
        const ext = path.extname(graphWriteScript).toLowerCase();
        let command, commandArgs;

        if (ext === '.ps1') {
            command = 'powershell';
            commandArgs = ['-File', graphWriteScript, '-Action', action, '-Module', module, '-File', tempFile, '-GraphRoot', graphRootPath, '-PlatformId', platformId];
        } else {
            command = 'node';
            commandArgs = [graphWriteScript, '--action', action, '--module', module, '--file', tempFile, '--graphRoot', graphRootPath, '--platformId', platformId];
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
            console.warn(`[WARN] Parsed .done file ${fileName} using fallback key=value format`);
            return result;
        }
        return null;
    }

    // Fallback: recover minimal info from filename and context when .done is non-JSON
    function recoverDoneFileFromContext(doneFile, completedDir, syncStatePath) {
        const fileName = doneFile.replace(/\.done$/, '');
        console.warn(`[WARN] .done file is not valid JSON: ${doneFile}. Attempting recovery from filename...`);

        // Try to get module from same-named .graph.json
        let module = 'unknown';
        const graphFilePath = path.join(completedDir, fileName + '.graph.json');
        if (fs.existsSync(graphFilePath)) {
            try {
                const graphContent = JSON.parse(fs.readFileSync(graphFilePath, 'utf8'));
                if (graphContent.module) {
                    module = graphContent.module;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        // Try to match sourceFile from features-*.json files
        let sourceFile = 'unknown';
        try {
            const files = fs.readdirSync(syncStatePath);
            const featureFiles = files.filter(f => f.startsWith('features-') && f.endsWith('.json'));

            for (const f of featureFiles) {
                const filePath = path.join(syncStatePath, f);
                try {
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (content.features && Array.isArray(content.features)) {
                        const found = content.features.find(feat => feat.fileName === fileName);
                        if (found) {
                            sourceFile = f;
                            break;
                        }
                    }
                } catch (e) {
                    // Continue checking next file
                }
            }
        } catch (e) {
            // Ignore read errors
        }

        console.warn(`[WARN] Recovered minimal info: fileName=${fileName}, module=${module}, sourceFile=${sourceFile}. Some fields may be inaccurate.`);

        return {
            fileName: fileName,
            sourceFile: sourceFile,
            module: module,
            sourcePath: null,
            status: 'success',
            analysisNotes: 'Auto-recovered from non-JSON .done file'
        };
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
                    skippedFilesCount++;
                    continue;
                }
                let content = JSON.parse(rawContent);

                // Validate and normalize content
                content = validateAndNormalizeDoneContent(content, doneFile);

                const fileName = content.fileName;
                const featureSourcePath = content.sourcePath;
                const sourceFile = content.sourceFile;
                const module = content.module;
                let analysisNotes = content.analysisNotes;

                if (!fileName || !sourceFile) {
                    console.warn(`Invalid .done file format: ${doneFile}`);
                    console.warn(`  Expected fields: fileName (got: '${fileName}'), sourceFile (got: '${sourceFile}')`);
                    console.warn(`  File content preview: ${rawContent.substring(0, Math.min(200, rawContent.length))}`);
                    continue;
                }

                // Warn if module field is missing or empty (non-blocking)
                if (!module) {
                    console.warn(`[WARN] module field missing from .done file: ${doneFile}`);
                }

                // Check if document exists before marking as analyzed
                const docCheck = checkDocumentExists(syncStatePath, sourceFile, fileName, featureSourcePath);
                if (!docCheck.exists) {
                    const warnMsg = `[WARN: document missing at ${docCheck.path || 'unknown path'}]`;
                    console.warn(`Document not found for feature ${fileName}: ${warnMsg}`);
                    analysisNotes = analysisNotes ? `${analysisNotes} ${warnMsg}` : warnMsg;
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
                    try {
                        // Validate and normalize fallback content
                        validateAndNormalizeDoneContent(fallbackContent, doneFile);

                        const fileName = fallbackContent.fileName;
                        const featureSourcePath = fallbackContent.sourcePath;
                        const sourceFile = fallbackContent.sourceFile;
                        let analysisNotes = fallbackContent.analysisNotes;

                        if (fileName && sourceFile) {
                            const sourceFilePath = path.join(syncStatePath, sourceFile);

                            // Check if document exists before marking as analyzed (fallback path)
                            const docCheck = checkDocumentExists(syncStatePath, sourceFile, fileName, featureSourcePath);
                            if (!docCheck.exists) {
                                const warnMsg = `[WARN: document missing at ${docCheck.path || 'unknown path'}]`;
                                console.warn(`Document not found for feature ${fileName}: ${warnMsg}`);
                                analysisNotes = analysisNotes ? `${analysisNotes} ${warnMsg}` : warnMsg;
                            }

                            updateFeatureStatus(sourceFilePath, fileName, featureSourcePath, 'true', true, analysisNotes);
                            processedCount++;
                            successfulDoneFiles.add(doneFile);
                            continue;
                        }
                    } catch (fallbackError) {
                        writeErrorContinue(`Failed to process .done file ${doneFile} (fallback): ${fallbackError.message}`);
                        continue;
                    }
                }

                // Final fallback: recover from filename and context
                const recoveredContent = recoverDoneFileFromContext(doneFile, completedDir, syncStatePath);
                if (recoveredContent && recoveredContent.fileName && recoveredContent.sourceFile !== 'unknown') {
                    try {
                        const fileName = recoveredContent.fileName;
                        const featureSourcePath = recoveredContent.sourcePath;
                        const sourceFile = recoveredContent.sourceFile;
                        let analysisNotes = recoveredContent.analysisNotes;

                        const sourceFilePath = path.join(syncStatePath, sourceFile);

                        // Check if document exists before marking as analyzed (recovery path)
                        const docCheck = checkDocumentExists(syncStatePath, sourceFile, fileName, featureSourcePath);
                        if (!docCheck.exists) {
                            const warnMsg = `[WARN: document missing at ${docCheck.path || 'unknown path'}]`;
                            console.warn(`Document not found for feature ${fileName}: ${warnMsg}`);
                            analysisNotes = analysisNotes ? `${analysisNotes} ${warnMsg}` : warnMsg;
                        }

                        updateFeatureStatus(sourceFilePath, fileName, featureSourcePath, 'true', true, analysisNotes);
                        processedCount++;
                        successfulDoneFiles.add(doneFile);
                        continue;
                    } catch (recoveryError) {
                        writeErrorContinue(`Failed to process .done file ${doneFile} (recovery): ${recoveryError.message}`);
                        continue;
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
                    skippedFilesCount++;
                    continue;
                }
                const content = JSON.parse(rawContent);
                let module = content.module;

                if (!module) {
                    // Try to read module from corresponding .done file
                    const doneFileName = graphFile.replace('.graph.json', '.done');
                    const doneFilePath = path.join(completedDir, doneFileName);

                    if (fs.existsSync(doneFilePath)) {
                        try {
                            const doneRawContent = fs.readFileSync(doneFilePath, 'utf8');
                            const doneContent = JSON.parse(doneRawContent);
                            if (doneContent.module) {
                                module = doneContent.module;
                                content.module = module;
                                console.warn(`[WARN] .graph.json missing root-level "module" field, falling back to .done file: ${graphFile}`);
                            }
                        } catch (doneError) {
                            console.warn(`Failed to read module from .done file ${doneFileName}: ${doneError.message}`);
                        }
                    }

                    // If still no module, skip this file
                    if (!module) {
                        console.warn(`Cannot determine module for: ${graphFile}, skipping`);
                        console.warn(`  Tried to read from .done file: ${doneFileName}`);
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
                } else if (content.nodes !== undefined) {
                    console.warn(`[WARN] .graph.json "nodes" field is not an array in: ${graphFile}`);
                }
                if (content.edges && Array.isArray(content.edges)) {
                    moduleGroups[effectiveModule].edges.push(...content.edges);
                } else if (content.edges !== undefined) {
                    console.warn(`[WARN] .graph.json "edges" field is not an array in: ${graphFile}`);
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
                        callGraphWriteScript('add-nodes', module, tempFile, graphRoot, platformId);
                    } catch (error) {
                        nodesOk = false;
                        const errorMsg = `Failed to add nodes for module '${module}': ${error.message}`;
                        console.warn(errorMsg);
                        console.warn(`  Parameters: Action=add-nodes, Module=${module}, File=${tempFile}, GraphRoot=${graphRoot}, PlatformId=${platformId}`);
                        addFailedOperation(module, 'add-nodes', error.message);
                    }
                }

                // Call graph-write script for edges
                if (group.edges.length > 0) {
                    try {
                        callGraphWriteScript('add-edges', module, tempFile, graphRoot, platformId);
                    } catch (error) {
                        edgesOk = false;
                        const errorMsg = `Failed to add edges for module '${module}': ${error.message}`;
                        console.warn(errorMsg);
                        console.warn(`  Parameters: Action=add-edges, Module=${module}, File=${tempFile}, GraphRoot=${graphRoot}, PlatformId=${platformId}`);
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

        // Log cleanup plan before execution
        console.log('=== Cleanup Plan ===');
        console.log(`[INFO] Successfully processed .done files to remove: ${successfulDoneFiles.size}`);
        console.log(`[INFO] Successfully processed .graph.json files to remove: ${successfulGraphFiles.size}`);
        
        const allDoneFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.done'));
        const failedDoneFiles = allDoneFiles.filter(f => !successfulDoneFiles.has(f));
        if (failedDoneFiles.length > 0) {
            console.log(`[INFO] Failed/unprocessed .done files to PRESERVE: ${failedDoneFiles.length}`);
            for (const file of failedDoneFiles) {
                console.log(`  [PRESERVE] ${file}`);
            }
        }
        
        const allGraphFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.graph.json'));
        const failedGraphFiles = allGraphFiles.filter(f => !successfulGraphFiles.has(f));
        if (failedGraphFiles.length > 0) {
            console.log(`[INFO] Failed/unprocessed .graph.json files to PRESERVE: ${failedGraphFiles.length}`);
            for (const file of failedGraphFiles) {
                console.log(`  [PRESERVE] ${file}`);
            }
        }
        console.log('====================');

        // Remove .done files (ONLY successfully processed ones)
        // IMPORTANT: Failed .done files are PRESERVED for retry after fixing the issue
        const doneFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.done'));
        for (const file of doneFiles) {
            if (successfulDoneFiles.has(file)) {
                try {
                    const filePath = path.join(completedDir, file);
                    console.log(`[CLEANUP] Removing successfully processed .done file: ${file}`);
                    fs.unlinkSync(filePath);
                } catch (error) {
                    writeErrorContinue(`Failed to remove .done file ${file}: ${error.message}`);
                }
            } else {
                // PRESERVE failed .done files for later retry - DO NOT DELETE
                console.warn(`[PRESERVE] Keeping failed .done file for retry: ${file}`);
            }
        }

        // Remove .graph.json files (ONLY successfully processed ones)
        // IMPORTANT: Failed .graph.json files are PRESERVED for retry after fixing the issue
        const graphFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.graph.json'));
        for (const file of graphFiles) {
            if (successfulGraphFiles.has(file)) {
                try {
                    const filePath = path.join(completedDir, file);
                    console.log(`[CLEANUP] Removing successfully processed .graph.json file: ${file}`);
                    fs.unlinkSync(filePath);
                } catch (error) {
                    writeErrorContinue(`Failed to remove .graph.json file ${file}: ${error.message}`);
                }
            } else {
                // PRESERVE failed .graph.json files for later retry - DO NOT DELETE
                console.warn(`[PRESERVE] Keeping failed .graph.json file for retry: ${file}`);
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
        skipped: skippedFilesCount,
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
