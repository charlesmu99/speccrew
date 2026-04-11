#!/usr/bin/env node

/**
 * update-progress.js - 通用进度文件更新工具
 *
 * 为 SpecCrew 所有 Agent 提供统一的进度文件更新工具，替代手动 PowerShell/Python 内联操作。
 *
 * 支持的命令：
 *
 * 1. init - 初始化 DISPATCH-PROGRESS.json
 *    node update-progress.js init --file <path> --stage <stage_name> --tasks <tasks_json_or_file>
 *    选项：
 *      --file <path>           进度文件路径（必需）
 *      --stage <name>          阶段名称（必需）
 *      --tasks <json|file>     任务列表 JSON 或 JSON 文件路径
 *      --tasks-file <path>     从文件读取任务列表
 *
 * 2. read - 读取进度文件
 *    node update-progress.js read --file <path> [options]
 *    选项：
 *      --file <path>           进度文件路径（必需）
 *      --task-id <id>          仅输出指定任务
 *      --status <status>       按状态过滤任务列表（pending/in_progress/partial/completed/failed）
 *      --summary               输出进度摘要（总数/完成/失败/部分/待处理）
 *      --checkpoints           读取所有 checkpoint 状态
 *      --overview              读取 workflow 全景（阶段概览）
 *
 * 3. update-task - 更新单个任务状态
 *    node update-progress.js update-task --file <path> --task-id <id> --status <status> [options]
 *    选项：
 *      --file <path>           进度文件路径（必需）
 *      --task-id <id>          任务 ID（必需）
 *      --status <status>       任务状态：pending/in_progress/partial/completed/failed（必需）
 *      --output <text>         任务输出（completed 时使用）
 *      --error <text>          错误信息（failed 时使用）
 *      --error-category <cat>  错误类别（failed 时使用）
 *
 * 4. update-counts - 强制重算计数
 *    node update-progress.js update-counts --file <path>
 *
 * 5. write-checkpoint - 写入/更新 checkpoint
 *    node update-progress.js write-checkpoint --file <path> --stage <stage> --checkpoint <name> --passed <true|false> [--description <text>]
 *    选项：
 *      --file <path>           进度文件路径（必需）
 *      --stage <name>          阶段名称（必需，如文件不存在则创建）
 *      --checkpoint <name>     检查点名称（必需）
 *      --passed <true|false>   是否通过（必需）
 *      --description <text>    描述信息（可选）
 *
 * 6. update-workflow - 更新 WORKFLOW-PROGRESS 阶段状态
 *    node update-progress.js update-workflow --file <path> --stage <name> --status <status> [--output <text>]
 *    选项：
 *      --file <path>           进度文件路径（必需）
 *      --stage <name>          阶段名称（必需）
 *      --status <status>       状态：pending/in_progress/completed/confirmed（必需）
 *      --output <text>         输出信息（可选）
 *
 * 输出格式：
 *   成功：{"success": true, "message": "...", "data": {...}}
 *   失败：{"success": false, "error": "..."}（输出到 stderr，exit code 1）
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 生成本地时区的 ISO 8601 格式时间戳
 * 例如：2026-04-10T20:38:21.978+08:00
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
 * 生成 ISO 8601 格式时间戳（本地时区）
 */
function getTimestamp() {
    return getLocalISOString();
}

/**
 * 输出成功结果到 stdout
 */
function outputSuccess(message, data = null) {
    const result = { success: true, message };
    if (data !== null) {
        result.data = data;
    }
    console.log(JSON.stringify(result, null, 2));
}

/**
 * 输出错误结果到 stderr 并退出
 */
function outputError(error) {
    console.error(JSON.stringify({ success: false, error }, null, 2));
    process.exit(1);
}

/**
 * 获取文件锁（防止并发冲突）
 * @param {string} filePath 目标文件路径
 * @returns {string} 锁文件路径
 */
function acquireLock(filePath) {
    const lockPath = `${filePath}.lock`;
    const maxRetries = 30;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            // 尝试独占创建锁文件
            const fd = fs.openSync(lockPath, 'wx');
            fs.closeSync(fd);
            return lockPath;
        } catch (error) {
            retryCount++;
            if (retryCount >= maxRetries) {
                throw new Error(`Failed to acquire file lock for '${filePath}' after ${maxRetries} attempts`);
            }
            // 等待 1 秒后重试
            const start = Date.now();
            while (Date.now() - start < 1000) {
                // Busy wait
            }
        }
    }
}

/**
 * 释放文件锁
 * @param {string} lockPath 锁文件路径
 */
function releaseLock(lockPath) {
    try {
        if (fs.existsSync(lockPath)) {
            fs.unlinkSync(lockPath);
        }
    } catch (e) {
        // 忽略清理错误
    }
}

/**
 * 原子写入 JSON 文件
 * @param {string} filePath 目标文件路径
 * @param {object} data 要写入的数据
 */
function atomicWriteJson(filePath, data) {
    const tempFile = `${filePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, filePath);
}

/**
 * 读取 JSON 文件
 * @param {string} filePath 文件路径
 * @returns {object} 解析后的 JSON 对象
 */
function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(content);
    } catch (e) {
        throw new Error(`Failed to parse JSON from ${filePath}: ${e.message}`);
    }
}

/**
 * 计算任务计数
 * @param {Array} tasks 任务列表
 * @returns {object} 计数结果
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
// 参数解析
// ============================================================================

/**
 * 解析命令行参数
 * 支持 --flag value 和 -Flag value 两种格式
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
        force: false
    };

    // 第一个参数是命令
    if (args.length > 0 && !args[0].startsWith('-')) {
        result.command = args[0];
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        // 跳过命令本身
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
        }
    }

    return result;
}

// ============================================================================
// 命令实现
// ============================================================================

/**
 * 命令：init - 初始化进度文件
 */
function cmdInit(args) {
    if (!args.file || !args.stage) {
        outputError('Usage: init --file <path> --stage <stage_name> [--tasks <json>] [--tasks-file <path>]');
    }

    const filePath = path.resolve(args.file);
    let tasks = [];

    // 从参数或文件读取任务列表
    if (args.tasksFile) {
        // 从文件读取
        const tasksContent = fs.readFileSync(path.resolve(args.tasksFile), 'utf8');
        try {
            tasks = JSON.parse(tasksContent);
        } catch (e) {
            outputError(`Failed to parse tasks file: ${e.message}`);
        }
    } else if (args.tasks) {
        // 直接解析 JSON
        try {
            tasks = JSON.parse(args.tasks);
        } catch (e) {
            outputError(`Failed to parse tasks JSON: ${e.message}`);
        }
    }

    // 验证 tasks 是数组
    if (!Array.isArray(tasks)) {
        outputError('Tasks must be an array');
    }

    // 确保每个任务有必要的字段
    tasks = tasks.map((task, index) => ({
        id: task.id || `task-${index + 1}`,
        name: task.name || task.id || `Task ${index + 1}`,
        status: task.status || 'pending',
        created_at: task.created_at || getTimestamp(),
        ...task
    }));

    // 创建进度文件结构
    const progressData = {
        stage: args.stage,
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
        counts: calculateCounts(tasks),
        tasks: tasks,
        checkpoints: {}
    };

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // 获取锁并写入
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
 * 命令：read - 读取进度文件（增强版）
 * 支持多种查询模式：
 * - 默认：读取整个文件
 * - --task-id：查询单个任务
 * - --status：按状态过滤任务
 * - --summary：输出进度摘要
 * - --checkpoints：读取 checkpoint 状态
 * - --overview：读取 workflow 全景
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

        // 1. --summary 模式：输出进度摘要
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

        // 2. --checkpoints 模式：读取 checkpoint 状态
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

        // 3. --overview 模式：读取 workflow 全景
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

        // 4. --task-id 模式：查询单个任务
        if (args.taskId) {
            const task = data.tasks?.find(t => t.id === args.taskId);
            if (!task) {
                outputError(`Task not found: ${args.taskId}`);
            }
            outputSuccess(`Task: ${args.taskId}`, task);
            return;
        }

        // 5. --status 模式：按状态过滤任务
        if (args.status) {
            const validStatuses = ['pending', 'in_progress', 'partial', 'completed', 'failed'];
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

        // 6. 默认模式：输出整个文件
        outputSuccess(`Progress file: ${filePath}`, data);
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * 命令：update-task - 更新单个任务状态
 */
function cmdUpdateTask(args) {
    if (!args.file || !args.taskId || !args.status) {
        outputError('Usage: update-task --file <path> --task-id <id> --status <status> [options]');
    }

    const validStatuses = ['pending', 'in_progress', 'partial', 'completed', 'failed'];
    if (!validStatuses.includes(args.status)) {
        outputError(`Invalid status: ${args.status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const filePath = path.resolve(args.file);
    let lockPath = null;

    try {
        lockPath = acquireLock(filePath);
        const data = readJsonFile(filePath);

        // 查找任务
        const taskIndex = data.tasks?.findIndex(t => t.id === args.taskId);
        if (taskIndex === -1 || taskIndex === undefined) {
            outputError(`Task not found: ${args.taskId}`);
        }

        const task = data.tasks[taskIndex];
        const now = getTimestamp();

        // 更新状态
        task.status = args.status;
        task.updated_at = now;

        // 根据状态自动设置时间戳（始终使用脚本生成的真实时间，不接受外部参数）
        if (args.status === 'in_progress') {
            task.started_at = now;
        } else if (args.status === 'partial') {
            // partial 状态：部分完成，可能已有 started_at，可选设置 completed_at
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
        } else if (args.status === 'failed') {
            task.completed_at = now;
            if (args.error) {
                task.error = args.error;
            }
            if (args.errorCategory) {
                task.error_category = args.errorCategory;
            }
        }

        // 更新任务
        data.tasks[taskIndex] = task;
        data.updated_at = now;

        // 重算计数
        data.counts = calculateCounts(data.tasks);

        // 原子写入
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
 * 命令：update-counts - 强制重算计数
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

        // 重算计数
        data.counts = calculateCounts(data.tasks);
        data.updated_at = getTimestamp();

        // 原子写入
        atomicWriteJson(filePath, data);

        outputSuccess('Counts updated', { counts: data.counts });
    } finally {
        if (lockPath) releaseLock(lockPath);
    }
}

/**
 * 命令：write-checkpoint - 写入/更新 checkpoint
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
            // 创建新文件
            data = {
                stage: args.stage,
                created_at: now,
                counts: { total: 0, completed: 0, failed: 0, pending: 0, in_progress: 0 },
                tasks: [],
                checkpoints: {}
            };
        }

        // 确保 checkpoints 对象存在
        if (!data.checkpoints) {
            data.checkpoints = {};
        }

        // 更新或创建 checkpoint
        data.checkpoints[args.checkpoint] = {
            passed: passed,
            checked_at: now,
            confirmed_at: passed ? now : null,
            description: args.description || null
        };

        data.updated_at = now;

        // 确保目录存在
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 原子写入
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
 * 命令：update-workflow - 更新 WORKFLOW-PROGRESS 阶段状态
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
            // 创建新文件
            data = {
                created_at: now,
                stages: {},
                current_stage: null
            };
        }

        // 确保 stages 对象存在
        if (!data.stages) {
            data.stages = {};
        }

        // 获取或创建阶段
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

        // 更新状态
        stage.status = args.status;

        // 根据状态自动设置时间戳（始终使用脚本生成的真实时间，不接受外部参数）
        if (args.status === 'in_progress') {
            // 如 started_at 已有值则不覆盖
            if (!stage.started_at) {
                stage.started_at = now;
            }
        } else if (args.status === 'completed') {
            stage.completed_at = now;
        } else if (args.status === 'confirmed') {
            stage.confirmed_at = now;
        }

        // 更新输出
        if (args.output) {
            stage.output = args.output;
        }

        // 更新当前阶段
        data.current_stage = args.stage;
        data.updated_at = now;

        // 确保目录存在
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 原子写入
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
 * 命令：init-tasks - 扫描 feature-design 目录生成任务列表
 */
function cmdInitTasks(args) {
    // 参数验证
    if (!args.file || !args.stage || !args.featuresDir || !args.platforms) {
        outputError('Usage: init-tasks --file <path> --stage <stage_name> --features-dir <dir> --platforms <comma-separated> [--force]');
    }

    const filePath = path.resolve(args.file);
    const featuresDir = path.resolve(args.featuresDir);
    const platforms = args.platforms.split(',').map(p => p.trim()).filter(p => p);
    
    // 验证 platforms 非空
    if (platforms.length === 0) {
        outputError('Platforms list cannot be empty');
    }

    // 验证 features-dir 存在
    if (!fs.existsSync(featuresDir)) {
        outputError(`Features directory not found: ${featuresDir}`);
    }

    // 扫描 .feature-spec.md 文件
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

    // 从文件名提取 feature 信息
    // 格式: F-{MODULE}-{NNN}-{feature-name}.feature-spec.md
    const featurePattern = /^(F-([A-Z]+)-\d+)-(.+)\.feature-spec\.md$/;
    const features = [];

    for (const file of featureFiles) {
        const match = file.match(featurePattern);
        if (match) {
            features.push({
                feature_id: match[1],      // F-APPT-001
                module: match[2],           // APPT
                name: match[3],             // 预约信息CRUD
                file: file
            });
        }
    }

    if (features.length === 0) {
        outputError('No valid feature files found. Expected format: F-{MODULE}-{NNN}-{feature-name}.feature-spec.md');
    }

    // 按 feature ID 排序
    features.sort((a, b) => a.feature_id.localeCompare(b.feature_id));

    // 检查目标文件是否已有 tasks
    if (fs.existsSync(filePath)) {
        const existingData = readJsonFile(filePath);
        if (existingData.tasks && existingData.tasks.length > 0 && !args.force) {
            outputError(`Progress file already has ${existingData.tasks.length} tasks. Use --force to overwrite.`);
        }
    }

    // 生成任务列表
    const tasks = [];
    const now = getTimestamp();

    // Module 排序顺序
    const moduleOrder = ['APPT', 'BASE', 'CUST', 'EMP', 'ITEM', 'KNW', 'REPORT', 'REV', 'SERV'];
    const getModuleIndex = (module) => {
        const idx = moduleOrder.indexOf(module);
        return idx === -1 ? 999 : idx;
    };

    // 按 module 分组
    const featuresByModule = {};
    for (const feature of features) {
        if (!featuresByModule[feature.module]) {
            featuresByModule[feature.module] = [];
        }
        featuresByModule[feature.module].push(feature);
    }

    // 每个 module 内按 feature ID 排序
    for (const module of Object.keys(featuresByModule)) {
        featuresByModule[module].sort((a, b) => a.feature_id.localeCompare(b.feature_id));
    }

    // 按 module 顺序生成任务
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

    // 创建进度文件结构
    const progressData = {
        stage: args.stage,
        created_at: now,
        updated_at: now,
        counts: calculateCounts(tasks),
        tasks: tasks,
        checkpoints: {}
    };

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // 获取锁并写入
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
// 主入口
// ============================================================================

function main() {
    const args = parseArgs();

    // 无命令时显示帮助
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
        console.error('  init-tasks      Generate tasks from feature-spec files');
        console.error('');
        console.error('Run "node update-progress.js <command> --help" for more information.');
        process.exit(1);
    }

    // 分发命令
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
            default:
                outputError(`Unknown command: ${args.command}`);
        }
    } catch (error) {
        outputError(error.message);
    }
}

main();
