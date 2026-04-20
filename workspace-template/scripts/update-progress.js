#!/usr/bin/env node

/**
 * update-progress.js - Universal Progress File Update Tool
 *
 * Provides a unified progress file update tool for all SpecCrew Agents,
 * replacing manual PowerShell/Python inline operations.
 *
 * Supported Commands:
 *
 * 1. init - Initialize DISPATCH-PROGRESS.json
 *    node update-progress.js init --file <path> --stage <stage_name> --tasks <tasks_json_or_file>
 *    Options:
 *      --file <path>           Progress file path (required)
 *      --stage <name>          Stage name (required)
 *      --tasks <json|file>     Task list JSON or JSON file path
 *      --tasks-file <path>     Read task list from file
 *
 * 2. read - Read progress file
 *    node update-progress.js read --file <path> [options]
 *    Options:
 *      --file <path>           Progress file path (required)
 *      --task-id <id>          Output only the specified task
 *      --status <status>       Filter tasks by status (pending/in_progress/partial/completed/failed)
 *      --summary               Output progress summary (total/completed/failed/partial/pending)
 *      --checkpoints           Read all checkpoint statuses
 *      --overview              Read workflow overview (stage summary)
 *
 * 3. update-task - Update a single task status
 *    node update-progress.js update-task --file <path> --task-id <id> --status <status> [options]
 *    Options:
 *      --file <path>           Progress file path (required)
 *      --task-id <id>          Task ID (required)
 *      --status <status>       Task status: pending/in_progress/partial/completed/failed (required)
 *      --output <text>         Task output (used when completed)
 *      --error <text>          Error message (used when failed)
 *      --error-category <cat>  Error category (used when failed)
 *      --metadata <json>       Metadata JSON string to merge into task
 *
 * 4. update-counts - Force recalculate counts
 *    node update-progress.js update-counts --file <path>
 *
 * 5. write-checkpoint - Write/update checkpoint
 *    node update-progress.js write-checkpoint --file <path> --stage <stage> --checkpoint <name> --passed <true|false> [--description <text>]
 *    Options:
 *      --file <path>           Progress file path (required)
 *      --stage <name>          Stage name (required, creates file if not exists)
 *      --checkpoint <name>     Checkpoint name (required)
 *      --passed <true|false>   Whether passed (required)
 *      --description <text>    Description (optional)
 *
 * 6. update-workflow - Update WORKFLOW-PROGRESS stage status
 *    node update-progress.js update-workflow --file <path> --stage <name> --status <status> [--output <text>]
 *    Options:
 *      --file <path>           Progress file path (required)
 *      --stage <name>          Stage name (required)
 *      --status <status>       Status: pending/in_progress/completed/confirmed (required)
 *      --output <text>         Output information (optional)
 *
 * 7. init-knowledge-tasks - Generate knowledge initialization tasks from matcher results
 *    node update-progress.js init-knowledge-tasks --file <path> --matcher-result <path> --features-dir <dir> [--force]
 *    Options:
 *      --file <path>           Progress file path (required)
 *      --matcher-result <path> Matcher result JSON file path (required)
 *      --features-dir <dir>    Directory containing features-*.json files (required)
 *      --force                 Overwrite existing file
 *
 * 8. sync - Sync task status with actual output files
 *    node update-progress.js sync --file <path> --dir <dir> --suffix <suffix> [--strict]
 *    Options:
 *      --file <path>           Progress file path (required)
 *      --dir <path>            Output directory absolute path (required)
 *      --suffix <suffix>       File suffix to match, e.g., -api-contract.md (required)
 *      --strict                Also mark completed tasks as pending if file is missing
 *
 * Output Format:
 *   Success: {"success": true, "message": "...", "data": {...}}
 *   Failure: {"success": false, "error": "..."} (output to stderr, exit code 1)
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate ISO 8601 format timestamp in local timezone
 * Example: 2026-04-10T20:38:21.978+08:00
 */
function getLocalISOString() {
    const now = new Date();
    const off = -now.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const pad2 = n => String(Math.abs(n)).padStart(2, '0');
    const tz = sign + pad2(Math.floor(off / 60)) + ':' + pad2(off % 60);
    return now.getFullYear() + '-' +
        pad2(now.getMonth() + 1) + '-' +
        pad2(now.getDate()) + 'T' +
        pad2(now.getHours()) + ':' +
        pad2(now.getMinutes()) + ':' +
        pad2(now.getSeconds()) + '.' +
        String(now.getMilliseconds()).padStart(3, '0') + tz;
}

/**
 * Generate ISO 8601 format timestamp (local timezone)
 */
function getTimestamp() {
    return getLocalISOString();
}

/**
 * Output success result to stdout
 */
function outputSuccess(message, data = null) {
    const result = { success: true, message };
    if (data !== null) {
        result.data = data;
    }
    console.log(JSON.stringify(result, null, 2));
}

/**
 * Output error result to stderr and exit
 */
function outputError(error) {
    console.error(JSON.stringify({ success: false, error }, null, 2));
    process.exit(1);
}

/**
 * Acquire file lock (prevent concurrent conflicts)
 * @param {string} filePath Target file path
 * @returns {string} Lock file path
 */
function acquireLock(filePath) {
    const lockPath = `${filePath}.lock`;
    const maxRetries = 50;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            // Attempt to exclusively create lock file
            const fd = fs.openSync(lockPath, 'wx');
            fs.closeSync(fd);
            return lockPath;
        } catch (error) {
            // Check if error is lock file already exists
            if (error.code === 'EEXIST') {
                try {
                    const lockStat = fs.statSync(lockPath);
                    const ageSeconds = (Date.now() - lockStat.mtimeMs) / 1000;
                    if (ageSeconds > 30) {
                        console.error(`Warning: Stale lock file detected (age: ${Math.round(ageSeconds)}s), removing: ${lockPath}`);
                        fs.unlinkSync(lockPath);
                        // Do not consume retry count, continue to next loop attempt to acquire lock
                        continue;
                    }
                } catch (statErr) {
                    // Lock file was deleted during stat, continue retrying
                }
            } else {
                // Non-EEXIST error (EACCES, EPERM, etc.) - log for debugging
                if (retryCount === 0) {
                    console.error(`Warning: Lock creation failed with ${error.code} for: ${lockPath}`);
                }
            }
            retryCount++;
            if (retryCount >= maxRetries) {
                // Force acquire as last resort
                try {
                    // Remove any existing lock file regardless of age
                    if (fs.existsSync(lockPath)) {
                        fs.unlinkSync(lockPath);
                    }
                    // Brief random delay to avoid thundering herd on force acquire
                    const forceDelay = Math.floor(Math.random() * 500);
                    const forceStart = Date.now();
                    while (Date.now() - forceStart < forceDelay) {}

                    const fd = fs.openSync(lockPath, 'wx');
                    fs.closeSync(fd);
                    console.error(`Warning: Lock acquired by force after ${maxRetries} retries for: ${filePath}`);
                    return lockPath;
                } catch (forceErr) {
                    throw new Error(`Failed to acquire file lock for '${filePath}' after ${maxRetries} attempts (force acquire also failed: ${forceErr.code})`);
                }
            }
            // Retry with jitter to avoid thundering herd
            const delay = 200 + Math.floor(Math.random() * 300);
            const start = Date.now();
            while (Date.now() - start < delay) {
                // Busy wait
            }
        }
    }
}

/**
 * Release file lock
 * @param {string} lockPath Lock file path
 */
function releaseLock(lockPath) {
    try {
        if (fs.existsSync(lockPath)) {
            fs.unlinkSync(lockPath);
        }
    } catch (e) {
        // Ignore cleanup errors
    }
}

/**
 * Atomically write JSON file
 * @param {string} filePath Target file path
 * @param {object} data Data to write
 */
function atomicWriteJson(filePath, data) {
    const tempFile = `${filePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, filePath);
}

/**
 * Read JSON file
 * @param {string} filePath File path
 * @returns {object} Parsed JSON object
 */
function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    
    try {
        return JSON.parse(content);
    } catch (e) {
        throw new Error(`Failed to parse JSON from ${filePath}: ${e.message}`);
    }
}

/**
 * Calculate task counts
 * @param {Array} tasks Task list
 * @returns {object} Count results
 */
function calculateCounts(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const partial = tasks.filter(t => t.status === 'partial').length;
    const pending = tasks.filter(t => t.status === 'pending' || !t.status).length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    return { total, completed, failed, partial, pending, in_progress: inProgress };
}

// ============================================================================
// Argument Parsing
// ============================================================================

/**
 * Parse command line arguments
 * Supports both --flag value and -Flag value formats
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        command: null,
        file: null,
        stage: null,
        tasks: null,
        tasksFile: null,
        taskId: null,
        status: null,
        output: null,
        error: null,
        errorCategory: null,
        checkpoint: null,
        passed: null,
        description: null,
        startedAt: null,
        completedAt: null,
        confirmedAt: null,
        featuresDir: null,
        platforms: null,
        force: false,
        metadata: null,
        dir: null,
        suffix: null,
        strict: false
    };

    // First argument is the command
    if (args.length > 0 && !args[0].startsWith('-')) {
        result.command = args[0];
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        // Skip the command itself
        if (i === 0 && !arg.startsWith('-')) {
            continue;
        }

        switch (arg) {
            case '--file':
            case '-File':
                result.file = args[++i];
                break;
            case '--stage':
            case '-Stage':
                result.stage = args[++i];
                break;
            case '--tasks':
            case '-Tasks':
                result.tasks = args[++i];
                break;
            case '--tasks-file':
            case '-Tasks-File':
                result.tasksFile = args[++i];
                break;
            case '--task-id':
            case '-Task-Id':
                result.taskId = args[++i];
                break;
            case '--status':
            case '-Status':
                result.status = args[++i];
                break;
            case '--output':
            case '-Output':
                result.output = args[++i];
                break;
            case '--error':
            case '-Error':
                result.error = args[++i];
                break;
            case '--error-category':
            case '-Error-Category':
                result.errorCategory = args[++i];
                break;
            case '--checkpoint':
            case '-Checkpoint':
                result.checkpoint = args[++i];
                break;
            case '--passed':
            case '-Passed':
                result.passed = args[++i];
                break;
            case '--description':
            case '-Description':
                result.description = args[++i];
                break;
            case '--started-at':
            case '-Started-At':
                result.startedAt = args[++i];
                break;
            case '--completed-at':
            case '-Completed-At':
                result.completedAt = args[++i];
                break;
                case '--confirmed-at':
            case '-Confirmed-At':
                result.confirmedAt = args[++i];
                break;
            case '--summary':
            case '-Summary':
                result.summary = true;
                break;
            case '--checkpoints':
            case '-Checkpoints':
                result.checkpoints = true;
                break;
            case '--overview':
            case '-Overview':
                result.overview = true;
                break;
            case '--features-dir':
            case '-Features-Dir':
                result.featuresDir = args[++i];
                break;
            case '--platforms':
            case '-Platforms':
                result.platforms = args[++i];
                break;
            case '--force':
            case '-Force':
                result.force = true;
                break;
            case '--matcher-result':
            case '-Matcher-Result':
                result.matcherResult = args[++i];
                break;
            case '--metadata':
            case '-Metadata':
                result.metadata = args[++i];
                break;
            case '--dir':
            case '-Dir':
                result.dir = args[++i];
                break;
            case '--suffix':
            case '-Suffix':
                result.suffix = args[++i];
                break;
            case '--strict':
            case '-Strict':
                result.strict = true;
                break;
        }
    }

    return result;
}

// ============================================================================
// Command Implementations
// ============================================================================

/**
 * Command: init - Initialize progress file
 */
function cmdInit(args) {
    if (!args.file || !args.stage) {
        outputError('Usage: init --file <path> --stage <stage_name> [--tasks <json>] [--tasks-file <path>]');
    }

    const filePath = path.resolve(args.file);
    let tasks = [];

    // Read task list from argument or file
    if (args.tasksFile) {
        // Read from file
        const tasksContent = fs.readFileSync(path.resolve(args.tasksFile), 'utf8');
        try {
            tasks = JSON.parse(tasksContent);
        } catch (e) {
            outputError(`Failed to parse tasks file: ${e.message}`);
        }
    } else if (args.tasks) {
        // Parse JSON directly
        try {
            tasks = JSON.parse(args.tasks);
        } catch (e) {
            outputError(`Failed to parse tasks JSON: ${e.message}`);
        }
    }

    // Validate tasks is an array
    if (!Array.isArray(tasks)) {
        outputError('Tasks must be an array');
    }

    // Ensure each task has required fields
    tasks = tasks.map((task, index) => ({
        id: task.id || `task-${index + 1}`,
        name: task.name || task.id || `Task ${index + 1}`,
        status: task.status || 'pending',
        created_at: task.created_at || getTimestamp(),
        ...task
    }));

    // Create progress file structure
    const progressData = {
        stage: args.stage,
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
        counts: calculateCounts(tasks),
        tasks: tasks,
        checkpoints: {}
    };

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Acquire lock and write
    let lockPath = null;
    try {
        lockPath = acquireLock(filePath);
        atomicWriteJson(filePath, progressData);
        outputSuccess(`Progress file initialized: ${filePath}`, { 
            file: filePath,
            stage: args.stage,
            counts: progressData.counts
        });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: read - Read progress file (enhanced version)
 * Supports multiple query modes:
 * - Default: read entire file
 * - --task-id: query single task
 * - --status: filter tasks by status
 * - --summary: output progress summary
 * - --checkpoints: read checkpoint status
 * - --overview: read workflow overview
 */
function cmdRead(args) {
    if (!args.file) {
        outputError('Usage: read --file <path> [--task-id <id>] [--status <status>] [--summary] [--checkpoints] [--overview]');
    }

    const filePath = path.resolve(args.file);
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);
        const data = readJsonFile(filePath);

        // 1. --summary mode: output progress summary
        if (args.summary) {
            const counts = data.counts || calculateCounts(data.tasks || []);
            const summary = {
                file: filePath,
                stage: data.stage || null,
                current_stage: data.current_stage || null,
                updated_at: data.updated_at || null,
                counts: counts,
                progress_percent: counts.total > 0 
                    ? Math.round((counts.completed / counts.total) * 100) 
                    : 0
            };
            outputSuccess('Progress summary', summary);
            return;
        }

        // 2. --checkpoints mode: read checkpoint status
        if (args.checkpoints) {
            const checkpoints = data.checkpoints || {};
            const checkpointList = Object.entries(checkpoints).map(([name, cp]) => ({
                name,
                passed: cp.passed,
                checked_at: cp.checked_at,
                confirmed_at: cp.confirmed_at,
                description: cp.description
            }));
            outputSuccess('Checkpoints', {
                total: checkpointList.length,
                passed: checkpointList.filter(cp => cp.passed).length,
                failed: checkpointList.filter(cp => !cp.passed).length,
                checkpoints: checkpointList
            });
            return;
        }

        // 3. --overview mode: read workflow overview
        if (args.overview) {
            const stages = data.stages || {};
            const stageList = Object.entries(stages).map(([name, stage]) => ({
                name,
                status: stage.status,
                started_at: stage.started_at,
                completed_at: stage.completed_at,
                confirmed_at: stage.confirmed_at,
                output: stage.output
            }));
            
            const overview = {
                current_stage: data.current_stage || null,
                created_at: data.created_at,
                updated_at: data.updated_at,
                stages: stageList,
                stage_summary: {
                    total: stageList.length,
                    pending: stageList.filter(s => s.status === 'pending').length,
                    in_progress: stageList.filter(s => s.status === 'in_progress').length,
                    completed: stageList.filter(s => s.status === 'completed').length,
                    confirmed: stageList.filter(s => s.status === 'confirmed').length
                }
            };
            outputSuccess('Workflow overview', overview);
            return;
        }

        // 4. --task-id mode: query single task
        if (args.taskId) {
            const task = data.tasks?.find(t => t.id === args.taskId);
            if (!task) {
                outputError(`Task not found: ${args.taskId}`);
            }
            outputSuccess(`Task: ${args.taskId}`, task);
            return;
        }

        // 5. --status mode: filter tasks by status
        if (args.status) {
            const validStatuses = ['pending', 'in_progress', 'partial', 'completed', 'failed', 'confirmed'];
            if (!validStatuses.includes(args.status)) {
                outputError(`Invalid status filter: ${args.status}. Must be one of: ${validStatuses.join(', ')}`);
            }
            const filteredTasks = (data.tasks || []).filter(t => t.status === args.status);
            outputSuccess(`Tasks with status: ${args.status}`, {
                status: args.status,
                count: filteredTasks.length,
                tasks: filteredTasks
            });
            return;
        }

        // 6. Default mode: output entire file
        outputSuccess(`Progress file: ${filePath}`, data);
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: update-task - Update a single task status
 */
function cmdUpdateTask(args) {
    if (!args.file || !args.taskId || !args.status) {
        outputError('Usage: update-task --file <path> --task-id <id> --status <status> [options]');
    }

    const validStatuses = ['pending', 'in_progress', 'partial', 'completed', 'failed', 'confirmed'];
    if (!validStatuses.includes(args.status)) {
        outputError(`Invalid status: ${args.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const filePath = path.resolve(args.file);
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);
        const data = readJsonFile(filePath);

        // Find task (support both flat structure and nested stages structure)
        let task = null;
        let taskIndex = -1;
        let taskArray = null;
        let isStageMode = false;
        let targetStage = null;

        if (args.stage) {
            // Nested structure: stages.{stage}.features
            isStageMode = true;
            if (!data.stages || !data.stages[args.stage]) {
                outputError(`Stage not found: ${args.stage}`);
            }
            targetStage = data.stages[args.stage];
            if (!targetStage.features) {
                targetStage.features = {};
            }
            const features = targetStage.features;
            if (Array.isArray(features)) {
                // Array form: [{id: "F-M08-03", ...}, ...]
                taskArray = features;
                taskIndex = taskArray.findIndex(t => t.id === args.taskId);
                if (taskIndex === -1) {
                    console.error(`Info: Task ${args.taskId} not found in stage ${args.stage}, creating new entry`);
                    taskArray.push({ id: args.taskId, status: 'pending' });
                    taskIndex = taskArray.length - 1;
                }
                task = taskArray[taskIndex];
            } else {
                // Object form: { "F-M08-03": { status: ... }, ... }
                if (!features[args.taskId]) {
                    console.error(`Info: Task ${args.taskId} not found in stage ${args.stage}, creating new entry`);
                    features[args.taskId] = { status: 'pending' };
                }
                task = features[args.taskId];
            }
        } else {
            // Flat structure: data.tasks
            taskArray = data.tasks;
            taskIndex = taskArray?.findIndex(t => t.id === args.taskId);
            if (taskIndex === -1 || taskIndex === undefined) {
                outputError(`Task not found: ${args.taskId}`);
            }
            task = taskArray[taskIndex];
        }
        const now = getTimestamp();

        // Update status
        task.status = args.status;
        task.updated_at = now;

        // Set timestamps based on status (always use real timestamp generated by script, external parameters not accepted)
        if (args.status === 'in_progress') {
            task.started_at = now;
        } else if (args.status === 'partial') {
            // partial status: partially completed, may already have started_at, optionally set completed_at
            if (!task.started_at) {
                task.started_at = now;
            }
            if (args.output) {
                task.output = args.output;
            }
        } else if (args.status === 'completed') {
            task.completed_at = now;
            if (args.output) {
                task.output = args.output;
            }
        } else if (args.status === 'confirmed') {
            task.confirmed_at = now;
        } else if (args.status === 'failed') {
            task.completed_at = now;
            if (args.error) {
                task.error = args.error;
            }
            if (args.errorCategory) {
                task.error_category = args.errorCategory;
            }
        }

        // Handle metadata (merge into task)
        if (args.metadata) {
            try {
                const metadataObj = JSON.parse(args.metadata);
                task.metadata = { ...task.metadata, ...metadataObj };
            } catch (e) {
                outputError(`Failed to parse metadata JSON: ${e.message}`);
            }
        }

        // Update task
        taskArray[taskIndex] = task;
        data.updated_at = now;

        // Recalculate counts
        if (isStageMode && targetStage.counts) {
            // Update stage-level counts
            targetStage.counts = calculateCounts(taskArray);
        } else {
            // Update global counts
            data.counts = calculateCounts(data.tasks);
        }

        // Atomic write
        atomicWriteJson(filePath, data);

        outputSuccess(`Task updated: ${args.taskId}`, {
            task_id: args.taskId,
            status: args.status,
            counts: data.counts
        });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: update-counts - Force recalculate counts
 */
function cmdUpdateCounts(args) {
    if (!args.file) {
        outputError('Usage: update-counts --file <path>');
    }

    const filePath = path.resolve(args.file);
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);
        const data = readJsonFile(filePath);

        if (!data.tasks || !Array.isArray(data.tasks)) {
            outputError('No tasks array found in progress file');
        }

        // Recalculate counts
        data.counts = calculateCounts(data.tasks);
        data.updated_at = getTimestamp();

        // Atomic write
        atomicWriteJson(filePath, data);

        outputSuccess('Counts updated', { counts: data.counts });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: write-checkpoint - Write/update checkpoint
 */
function cmdWriteCheckpoint(args) {
    if (!args.file || !args.stage || !args.checkpoint || args.passed === null) {
        outputError('Usage: write-checkpoint --file <path> --stage <stage> --checkpoint <name> --passed <true|false> [--description <text>]');
    }

    const filePath = path.resolve(args.file);
    const passed = ['true', '1', '$true', 'True', 'TRUE'].includes(args.passed);
    const now = getTimestamp();
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);

        let data;
        if (fs.existsSync(filePath)) {
            data = readJsonFile(filePath);
        } else {
            // Create new file
            data = {
                stage: args.stage,
                created_at: now,
                counts: { total: 0, completed: 0, failed: 0, pending: 0, in_progress: 0 },
                tasks: [],
                checkpoints: {}
            };
        }

        // Ensure checkpoints object exists
        if (!data.checkpoints) {
            data.checkpoints = {};
        }

        // Update or create checkpoint
        data.checkpoints[args.checkpoint] = {
            passed: passed,
            checked_at: now,
            confirmed_at: passed ? now : null,
            description: args.description || null
        };

        data.updated_at = now;

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Atomic write
        atomicWriteJson(filePath, data);

        outputSuccess(`Checkpoint updated: ${args.checkpoint}`, {
            checkpoint: args.checkpoint,
            passed: passed,
            confirmed_at: data.checkpoints[args.checkpoint].confirmed_at
        });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: update-workflow - Update WORKFLOW-PROGRESS stage status
 */
function cmdUpdateWorkflow(args) {
    if (!args.file || !args.stage || !args.status) {
        outputError('Usage: update-workflow --file <path> --stage <name> --status <status> [--output <text>]');
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'confirmed'];
    if (!validStatuses.includes(args.status)) {
        outputError(`Invalid status: ${args.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const filePath = path.resolve(args.file);
    const now = getTimestamp();
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);

        let data;
        if (fs.existsSync(filePath)) {
            data = readJsonFile(filePath);
        } else {
            // Create new file
            data = {
                created_at: now,
                stages: {},
                current_stage: null
            };
        }

        // Ensure stages object exists
        if (!data.stages) {
            data.stages = {};
        }

        // Get or create stage
        if (!data.stages[args.stage]) {
            data.stages[args.stage] = {
                status: 'pending',
                started_at: null,
                completed_at: null,
                confirmed_at: null,
                output: null
            };
        }

        const stage = data.stages[args.stage];

        // Update status
        stage.status = args.status;

        // Set timestamps based on status (always use real timestamp generated by script, external parameters not accepted)
        if (args.status === 'in_progress') {
            // Do not overwrite if started_at already has a value
            if (!stage.started_at) {
                stage.started_at = now;
            }
        } else if (args.status === 'completed') {
            stage.completed_at = now;
        } else if (args.status === 'confirmed') {
            stage.confirmed_at = now;
        }

        // Update output
        if (args.output) {
            stage.output = args.output;
        }

        // Update current stage
        data.current_stage = args.stage;
        data.updated_at = now;

        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Atomic write
        atomicWriteJson(filePath, data);

        outputSuccess(`Workflow stage updated: ${args.stage}`, {
            stage: args.stage,
            status: args.status,
            current_stage: data.current_stage
        });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Determine analyzer skill based on platform_id
 * @param {string} platformId - Platform identifier
 * @returns {string} Analyzer skill name
 */
function getAnalyzerSkill(platformId) {
    const pid = platformId.toLowerCase();
    if (pid.includes('web') || pid.includes('mobile')) {
        return 'speccrew-knowledge-bizs-ui-analyze';
    }
    if (pid.includes('backend') || pid.includes('api')) {
        return 'speccrew-knowledge-bizs-api-analyze';
    }
    // Default to UI analyzer for unknown platforms
    return 'speccrew-knowledge-bizs-ui-analyze';
}

/**
 * Command: init-knowledge-tasks - Generate knowledge initialization tasks from matcher results
 * 
 * Reads matcher result and features-*.json files to generate a task list for knowledge initialization.
 * Each task corresponds to a feature that needs to be analyzed.
 */
function cmdInitKnowledgeTasks(args) {
    // Validate required arguments
    if (!args.file || !args.matcherResult || !args.featuresDir) {
        outputError('Usage: init-knowledge-tasks --file <path> --matcher-result <path> --features-dir <dir> [--force]');
    }

    const filePath = path.resolve(args.file);
    const matcherResultPath = path.resolve(args.matcherResult);
    const featuresDir = path.resolve(args.featuresDir);

    // Check if matcher result file exists
    if (!fs.existsSync(matcherResultPath)) {
        outputError(`Matcher result file not found: ${matcherResultPath}`);
    }

    // Check if features directory exists
    if (!fs.existsSync(featuresDir)) {
        outputError(`Features directory not found: ${featuresDir}`);
    }

    // Check if target file already exists (prevent overwrite without --force)
    if (fs.existsSync(filePath) && !args.force) {
        outputError(`Progress file already exists: ${filePath}. Use --force to overwrite.`);
    }

    // Read matcher result
    let matcherResult;
    try {
        matcherResult = readJsonFile(matcherResultPath);
    } catch (e) {
        outputError(`Failed to read matcher result: ${e.message}`);
    }

    // Extract matched modules (high + medium confidence)
    const matchedModules = matcherResult.matched_modules || [];
    if (matchedModules.length === 0) {
        outputError('No matched modules found in matcher result');
    }

    // Filter to high and medium confidence matches
    const validConfidences = ['high', 'medium'];
    const filteredModules = matchedModules.filter(m => 
        validConfidences.includes((m.confidence || '').toLowerCase())
    );

    if (filteredModules.length === 0) {
        outputError('No modules with high or medium confidence found');
    }

    // Scan features-*.json files
    const featuresFiles = fs.readdirSync(featuresDir).filter(f => 
        f.startsWith('features-') && f.endsWith('.json')
    );

    if (featuresFiles.length === 0) {
        outputError(`No features-*.json files found in: ${featuresDir}`);
    }

    // Load all features data indexed by platform_id
    const featuresDataByPlatform = {};
    for (const file of featuresFiles) {
        const filePath = path.join(featuresDir, file);
        try {
            const data = readJsonFile(filePath);
            // Support both platformId (camelCase) and platform_id (snake_case)
            const platformId = data.platformId || data.platform_id;
            if (platformId) {
                featuresDataByPlatform[platformId] = data;
            }
        } catch (e) {
            outputError(`Failed to parse features file ${file}: ${e.message}`);
        }
    }

    // Generate tasks from matched modules and features
    const tasks = [];
    const now = getTimestamp();

    for (const matchedModule of filteredModules) {
        const { module_name, platform_id, features: matchedFeatures } = matchedModule;

        // Determine analyzer skill based on platform
        const analyzerSkill = getAnalyzerSkill(platform_id);

        // Get features for this module
        let featuresToProcess = [];

        if (matchedFeatures && Array.isArray(matchedFeatures) && matchedFeatures.length > 0) {
            // Use features directly from matcher result
            featuresToProcess = matchedFeatures;
        } else {
            // Look up features from features-*.json files
            const platformData = featuresDataByPlatform[platform_id];
            if (platformData && platformData.features && Array.isArray(platformData.features)) {
                // Filter features by module name
                featuresToProcess = platformData.features.filter(f => f.module === module_name);
            }
        }

        // Filter to only unanalyzed features (analyzed !== true)
        const unanalyzedFeatures = featuresToProcess.filter(f => f.analyzed !== true);

        // Create task for each unanalyzed feature
        for (const feature of unanalyzedFeatures) {
            const fileName = feature.fileName || feature.file_name || 'unknown';
            const sourcePath = feature.sourcePath || feature.source_path || '';

            // Generate task ID: ki-{platform_id}-{module}-{fileName}
            // Sanitize fileName for ID (remove extension, replace special chars)
            const fileNameForId = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
            const taskId = `ki-${platform_id}-${module_name}-${fileNameForId}`;

            tasks.push({
                id: taskId,
                name: `Analyze ${module_name}.${fileName} (${platform_id})`,
                status: 'pending',
                module: module_name,
                platform_id: platform_id,
                fileName: fileName,
                sourcePath: sourcePath,
                analyzer_skill: analyzerSkill,
                created_at: now
            });
        }
    }

    // Sort tasks: by platform_id, then module, then fileName
    tasks.sort((a, b) => {
        if (a.platform_id !== b.platform_id) {
            return a.platform_id.localeCompare(b.platform_id);
        }
        if (a.module !== b.module) {
            return a.module.localeCompare(b.module);
        }
        return a.fileName.localeCompare(b.fileName);
    });

    // Create progress file structure
    const progressData = {
        stage: 'knowledge_initialization',
        created_at: now,
        updated_at: now,
        counts: calculateCounts(tasks),
        tasks: tasks,
        checkpoints: {}
    };

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Acquire lock and write
    let lockPath = null;
    try {
        lockPath = acquireLock(filePath);
        atomicWriteJson(filePath, progressData);
        outputSuccess(
            `Generated ${tasks.length} knowledge initialization tasks`,
            {
                file: filePath,
                stage: 'knowledge_initialization',
                matched_modules: filteredModules.length,
                counts: progressData.counts
            }
        );
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: sync - Sync task status with actual output files
 * Scans directory for files matching suffix, extracts task IDs from filenames,
 * and updates task status accordingly.
 */
function cmdSync(args) {
    if (!args.file) { outputError('--file is required'); process.exit(1); }
    if (!args.dir) { outputError('--dir is required'); process.exit(1); }
    if (!args.suffix) { outputError('--suffix is required'); process.exit(1); }

    const filePath = path.resolve(args.file);
    const dirPath = path.resolve(args.dir);
    
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);
        
        const data = readJsonFile(filePath);
        if (!data || !data.tasks) { outputError('Invalid progress file'); process.exit(1); }

        // Check if directory exists
        if (!fs.existsSync(dirPath)) {
            outputError(`Directory not found: ${dirPath}`);
        }

        // Scan directory for matching files
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith(args.suffix));

        // Extract task IDs from filenames
        // Format: {task-id}-{feature-name}{suffix}
        // task-id pattern: F-Mxx-xx (starts with F-, contains module and feature number)
        const fileTaskIds = new Set();
        const fileMap = {};
        for (const file of files) {
            // Extract task ID: match F-M followed by digits, dash, digits
            const match = file.match(/^(F-M\d+-\d+)/);
            if (match) {
                fileTaskIds.add(match[1]);
                fileMap[match[1]] = file;
            }
        }

        let synced = 0;
        let alreadyCorrect = 0;
        let missing = 0;
        const now = getTimestamp();

        for (const task of data.tasks) {
            const taskId = task.id;
            if (fileTaskIds.has(taskId)) {
                if (task.status !== 'completed') {
                    task.status = 'completed';
                    task.output = fileMap[taskId];
                    task.completed_at = now;
                    task.updated_at = now;
                    synced++;
                } else {
                    alreadyCorrect++;
                }
            } else {
                if (task.status === 'completed' && args.strict) {
                    task.status = 'pending';
                    delete task.output;
                    delete task.completed_at;
                    task.updated_at = now;
                    missing++;
                }
            }
        }

        // Recalculate counts
        data.counts = calculateCounts(data.tasks);
        data.updated_at = now;

        // Atomic write
        atomicWriteJson(filePath, data);

        outputSuccess('Sync completed', {
            scanned_files: files.length,
            synced: synced,
            already_correct: alreadyCorrect,
            missing_files: missing,
            counts: data.counts
        });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: sync - Sync task status with actual output files
 * Scans directory for files matching suffix, extracts task IDs from filenames,
 * and updates task status accordingly.
 */
function cmdSync(args) {
    if (!args.file) { outputError('--file is required'); process.exit(1); }
    if (!args.dir) { outputError('--dir is required'); process.exit(1); }
    if (!args.suffix) { outputError('--suffix is required'); process.exit(1); }

    const filePath = path.resolve(args.file);
    const dirPath = path.resolve(args.dir);
    
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);
        
        const data = readJsonFile(filePath);
        if (!data || !data.tasks) { outputError('Invalid progress file'); process.exit(1); }

        // Check if directory exists
        if (!fs.existsSync(dirPath)) {
            outputError(`Directory not found: ${dirPath}`);
        }

        // Scan directory for matching files
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith(args.suffix));

        // Extract task IDs from filenames
        // Format: {task-id}-{feature-name}{suffix}
        // task-id pattern: F-Mxx-xx (starts with F-, contains module and feature number)
        const fileTaskIds = new Set();
        const fileMap = {};
        for (const file of files) {
            // Extract task ID: match F-M followed by digits, dash, digits
            const match = file.match(/^(F-M\d+-\d+)/);
            if (match) {
                fileTaskIds.add(match[1]);
                fileMap[match[1]] = file;
            }
        }

        let synced = 0;
        let alreadyCorrect = 0;
        let missing = 0;
        const now = getTimestamp();

        for (const task of data.tasks) {
            const taskId = task.id;
            if (fileTaskIds.has(taskId)) {
                if (task.status !== 'completed') {
                    task.status = 'completed';
                    task.output = fileMap[taskId];
                    task.completed_at = now;
                    task.updated_at = now;
                    synced++;
                } else {
                    alreadyCorrect++;
                }
            } else {
                if (task.status === 'completed' && args.strict) {
                    task.status = 'pending';
                    delete task.output;
                    delete task.completed_at;
                    task.updated_at = now;
                    missing++;
                }
            }
        }

        // Recalculate counts
        data.counts = calculateCounts(data.tasks);
        data.updated_at = now;

        // Atomic write
        atomicWriteJson(filePath, data);

        outputSuccess('Sync completed', {
            scanned_files: files.length,
            synced: synced,
            already_correct: alreadyCorrect,
            missing_files: missing,
            counts: data.counts
        });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * Command: init-tasks - Scan feature-design directory to generate task list
 */
function cmdInitTasks(args) {
    // Argument validation
    if (!args.file || !args.stage || !args.featuresDir || !args.platforms) {
        outputError('Usage: init-tasks --file <path> --stage <stage_name> --features-dir <dir> --platforms <comma-separated> [--force]');
    }

    const filePath = path.resolve(args.file);
    const featuresDir = path.resolve(args.featuresDir);
    const platforms = args.platforms.split(',').map(p => p.trim()).filter(p => p);
    
    // Validate platforms is not empty
    if (platforms.length === 0) {
        outputError('Platforms list cannot be empty');
    }

    // Validate features-dir exists
    if (!fs.existsSync(featuresDir)) {
        outputError(`Features directory not found: ${featuresDir}`);
    }

    // Scan .feature-spec.md files
    const featureFiles = [];
    const files = fs.readdirSync(featuresDir);
    for (const file of files) {
        if (file.endsWith('.feature-spec.md')) {
            featureFiles.push(file);
        }
    }

    if (featureFiles.length === 0) {
        outputError(`No .feature-spec.md files found in: ${featuresDir}`);
    }

    // Extract feature info from filenames
    // Format: F-{MODULE}-{NNN}-{feature-name}.feature-spec.md
    const featurePattern = /^(F-([A-Z]+)-\d+)-(.+)\.feature-spec\.md$/;
    const features = [];

    for (const file of featureFiles) {
        const match = file.match(featurePattern);
        if (match) {
            features.push({
                feature_id: match[1],      // F-APPT-001
                module: match[2],           // APPT
                name: match[3],             // appointment-crud
                file: file
            });
        }
    }

    if (features.length === 0) {
        outputError('No valid feature files found. Expected format: F-{MODULE}-{NNN}-{feature-name}.feature-spec.md');
    }

    // Sort by feature ID
    features.sort((a, b) => a.feature_id.localeCompare(b.feature_id));

    // Check if target file already has tasks
    if (fs.existsSync(filePath)) {
        const existingData = readJsonFile(filePath);
        if (existingData.tasks && existingData.tasks.length > 0 && !args.force) {
            outputError(`Progress file already has ${existingData.tasks.length} tasks. Use --force to overwrite.`);
        }
    }

    // Generate task list
    const tasks = [];
    const now = getTimestamp();

    // Module sort order
    const moduleOrder = ['APPT', 'BASE', 'CUST', 'EMP', 'ITEM', 'KNW', 'REPORT', 'REV', 'SERV'];
    const getModuleIndex = (module) => {
        const idx = moduleOrder.indexOf(module);
        return idx === -1 ? 999 : idx;
    };

    // Group by module
    const featuresByModule = {};
    for (const feature of features) {
        if (!featuresByModule[feature.module]) {
            featuresByModule[feature.module] = [];
        }
        featuresByModule[feature.module].push(feature);
    }

    // Sort by feature ID within each module
    for (const module of Object.keys(featuresByModule)) {
        featuresByModule[module].sort((a, b) => a.feature_id.localeCompare(b.feature_id));
    }

    // Generate tasks in module order
    const sortedModules = Object.keys(featuresByModule).sort((a, b) => getModuleIndex(a) - getModuleIndex(b));

    for (const module of sortedModules) {
        for (const feature of featuresByModule[module]) {
            for (const platform of platforms) {
                tasks.push({
                    id: `sd-${platform}-${feature.feature_id}`,
                    name: `System Design - ${platform} - ${feature.feature_id} ${feature.name}`,
                    status: 'pending',
                    platform: platform,
                    feature_id: feature.feature_id,
                    module: feature.module,
                    created_at: now
                });
            }
        }
    }

    // Create progress file structure
    const progressData = {
        stage: args.stage,
        created_at: now,
        updated_at: now,
        counts: calculateCounts(tasks),
        tasks: tasks,
        checkpoints: {}
    };

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Acquire lock and write
    let lockPath = null;
    try {
        lockPath = acquireLock(filePath);
        atomicWriteJson(filePath, progressData);
        outputSuccess(
            `Generated ${tasks.length} tasks from ${features.length} features × ${platforms.length} platforms`,
            {
                file: filePath,
                stage: args.stage,
                features_count: features.length,
                platforms: platforms,
                counts: progressData.counts
            }
        );
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

// ============================================================================
// Main Entry
// ============================================================================

function main() {
    const args = parseArgs();

    // Show help when no command
    if (!args.command) {
        console.error('Usage: node update-progress.js <command> [options]');
        console.error('');
        console.error('Commands:');
        console.error('  init             Initialize a progress file');
        console.error('  read             Read a progress file');
        console.error('  update-task      Update a task status');
        console.error('  update-counts    Recalculate task counts');
        console.error('  write-checkpoint Write or update a checkpoint');
        console.error('  update-workflow  Update a workflow stage status');
        console.error('  init-tasks       Generate tasks from feature-spec files');
        console.error('  init-knowledge-tasks  Generate knowledge initialization tasks from matcher results');
        console.error('  sync             Sync task status with actual output files');
        console.error('');
        console.error('Run "node update-progress.js <command> --help" for more information.');
        process.exit(1);
    }

    // Dispatch command
    try {
        switch (args.command) {
            case 'init':
                cmdInit(args);
                break;
            case 'read':
                cmdRead(args);
                break;
            case 'update-task':
                cmdUpdateTask(args);
                break;
            case 'update-counts':
                cmdUpdateCounts(args);
                break;
            case 'write-checkpoint':
                cmdWriteCheckpoint(args);
                break;
            case 'update-workflow':
                cmdUpdateWorkflow(args);
                break;
            case 'init-tasks':
                cmdInitTasks(args);
                break;
            case 'init-knowledge-tasks':
                cmdInitKnowledgeTasks(args);
                break;
            case 'sync':
                cmdSync(args);
                break;
            default:
                outputError(`Unknown command: ${args.command}`);
        }
    } catch (error) {
        outputError(error.message);
    }
}

main();
