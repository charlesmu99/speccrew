#!/usr/bin/env node

/**
 * Batch Orchestrator - Main control script for Stage 2 loop.
 *
 * This script simplifies the Stage 2 loop in SKILL.md by merging
 * "get batch" and "process previous batch results" steps into a single call.
 *
 * Modes:
 *   1. get-batch: Get the next batch of features to process
 *   2. process-results: Process the previous batch results
 */

const { execFileSync } = require('child_process');
const path = require('path');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        mode: null,
        syncStatePath: null,
        batchSize: 5,
        graphRoot: null,
        graphWriteScript: null
    };

    // First non-option argument is the mode
    let modeFound = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        // Skip if it's a flag
        if (arg.startsWith('--')) {
            switch (arg) {
                case '--syncStatePath':
                case '-SyncStatePath':
                    result.syncStatePath = args[++i];
                    break;
                case '--batchSize':
                case '-BatchSize':
                    result.batchSize = parseInt(args[++i], 10) || 5;
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
        } else if (!modeFound) {
            // First non-flag argument is the mode
            result.mode = arg;
            modeFound = true;
        }
    }

    return result;
}

// Get the path to a script in the same directory
function getScriptPath(scriptName) {
    return path.join(__dirname, scriptName);
}

// Mode 1: Get the next batch of features
function getBatch(args) {
    if (!args.syncStatePath) {
        throw new Error('--syncStatePath is required for get-batch mode');
    }

    const getNextBatchScript = getScriptPath('get-next-batch.js');

    const commandArgs = [
        getNextBatchScript,
        '--syncStatePath', args.syncStatePath,
        '--batchSize', String(args.batchSize)
    ];

    // Execute get-next-batch.js and capture output
    const output = execFileSync('node', commandArgs, { encoding: 'utf8' });

    // Parse the output (JSON array of features)
    const batch = JSON.parse(output);

    // Determine the response based on whether there are features
    if (batch.length === 0) {
        return {
            action: 'done',
            message: 'All features have been processed'
        };
    } else {
        return {
            action: 'process',
            batch: batch,
            batchSize: batch.length,
            iteration: null // Could be enhanced with state tracking
        };
    }
}

// Mode 2: Process the previous batch results
function processResults(args) {
    if (!args.syncStatePath) {
        throw new Error('--syncStatePath is required for process-results mode');
    }
    if (!args.graphRoot) {
        throw new Error('--graphRoot is required for process-results mode');
    }
    if (!args.graphWriteScript) {
        throw new Error('--graphWriteScript is required for process-results mode');
    }

    const processBatchResultsScript = getScriptPath('process-batch-results.js');

    const commandArgs = [
        processBatchResultsScript,
        '--syncStatePath', args.syncStatePath,
        '--graphRoot', args.graphRoot,
        '--graphWriteScript', args.graphWriteScript
    ];

    // Execute process-batch-results.js and capture output
    const output = execFileSync('node', commandArgs, { encoding: 'utf8' });

    // Parse and return the output (JSON result)
    return JSON.parse(output);
}

function main() {
    try {
        const args = parseArgs();

        if (!args.mode) {
            console.error('Error: Mode is required. Use "get-batch" or "process-results"');
            console.error('Usage:');
            console.error('  node batch-orchestrator.js get-batch --syncStatePath <path> [--batchSize 5]');
            console.error('  node batch-orchestrator.js process-results --syncStatePath <path> --graphRoot <path> --graphWriteScript <path>');
            process.exit(1);
        }

        let result;

        switch (args.mode) {
            case 'get-batch':
                result = getBatch(args);
                break;
            case 'process-results':
                result = processResults(args);
                break;
            default:
                throw new Error(`Unknown mode: ${args.mode}. Use "get-batch" or "process-results"`);
        }

        // Output result as JSON
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main();
