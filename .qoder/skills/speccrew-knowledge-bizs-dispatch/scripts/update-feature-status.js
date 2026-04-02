#!/usr/bin/env node

/**
 * Update the status of a feature in a features-*.json file.
 *
 * Updates the analyzed status, timestamps, and notes for a specific feature
 * within a features-*.json file. Matches by fileName and sourcePath.
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        sourceFile: null,
        fileName: null,
        featureSourcePath: null,
        analyzed: null,
        setStarted: false,
        setCompleted: false,
        analysisNotes: null,
        status: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--sourceFile':
            case '-SourceFile':
                result.sourceFile = args[++i];
                break;
            case '--fileName':
            case '-FileName':
                result.fileName = args[++i];
                break;
            case '--featureSourcePath':
            case '-FeatureSourcePath':
                result.featureSourcePath = args[++i];
                break;
            case '--analyzed':
            case '-Analyzed':
                result.analyzed = args[++i];
                break;
            case '--setStarted':
            case '-SetStarted':
                result.setStarted = true;
                break;
            case '--setCompleted':
            case '-SetCompleted':
                result.setCompleted = true;
                break;
            case '--analysisNotes':
            case '-AnalysisNotes':
                result.analysisNotes = args[++i];
                break;
            case '--status':
            case '-Status':
                result.status = args[++i];
                break;
        }
    }

    return result;
}

// Helper function to safely set property on object
function setFeatureProperty(obj, propertyName, value) {
    obj[propertyName] = value;
}

// Helper function to format timestamp
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

function main() {
    try {
        const args = parseArgs();

        if (!args.sourceFile || !args.fileName || args.analyzed === null) {
            console.error('Error: --sourceFile, --fileName, and --analyzed are required');
            process.exit(1);
        }

        // Check if file exists
        const sourceFilePath = path.resolve(args.sourceFile);
        if (!fs.existsSync(sourceFilePath)) {
            console.error(`Source file not found: ${args.sourceFile}`);
            process.exit(1);
        }

        // Acquire file lock to prevent concurrent access
        const lockPath = `${sourceFilePath}.lock`;
        const maxRetries = 30;
        let retryCount = 0;
        let lockAcquired = false;

        while (!lockAcquired && retryCount < maxRetries) {
            try {
                // Try to create lock file exclusively
                const fd = fs.openSync(lockPath, 'wx');
                fs.closeSync(fd);
                lockAcquired = true;
            } catch (error) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    const errorMsg = `Failed to acquire file lock for '${sourceFilePath}' after ${maxRetries} attempts (waited ${maxRetries} seconds). The file may be locked by another process.`;
                    console.warn(errorMsg);
                    // Return error object instead of exiting
                    const errorResult = {
                        success: false,
                        error: errorMsg,
                        sourceFile: args.sourceFile,
                        fileName: args.fileName,
                        retryCount: retryCount
                    };
                    console.log(JSON.stringify(errorResult, null, 2));
                    process.exit(0);
                }
                if (retryCount % 5 === 0) {
                    console.warn(`Waiting for file lock on '${sourceFilePath}'... (attempt ${retryCount} of ${maxRetries})`);
                }
                // Wait 1 second before retry
                const start = Date.now();
                while (Date.now() - start < 1000) {
                    // Busy wait
                }
            }
        }

        try {
            // Read the JSON file
            const rawContent = fs.readFileSync(sourceFilePath, 'utf8');
            const content = JSON.parse(rawContent);

            // Convert Analyzed string to boolean
            const analyzedBool = ['true', '1', '$true', 'True', 'TRUE'].includes(args.analyzed);

            // Find and update the feature
            let found = false;
            if (content.features && Array.isArray(content.features)) {
                for (let i = 0; i < content.features.length; i++) {
                    const feature = content.features[i];

                    // Match by fileName (and optionally sourcePath for disambiguation)
                    const nameMatch = feature.fileName === args.fileName;
                    const pathMatch = !args.featureSourcePath || feature.sourcePath === args.featureSourcePath;

                    if (nameMatch && pathMatch) {
                        setFeatureProperty(feature, 'analyzed', analyzedBool);

                        if (args.setStarted) {
                            setFeatureProperty(feature, 'startedAt', getTimestamp());
                        }
                        if (args.setCompleted) {
                            setFeatureProperty(feature, 'completedAt', getTimestamp());
                        }
                        if (args.analysisNotes !== null) {
                            setFeatureProperty(feature, 'analysisNotes', args.analysisNotes);
                        }

                        // Handle Status parameter with backward compatibility
                        if (args.status !== null) {
                            setFeatureProperty(feature, 'status', args.status);
                            // Backward compatibility: update analyzed based on status
                            if (args.status === 'completed') {
                                setFeatureProperty(feature, 'analyzed', true);
                            } else {
                                setFeatureProperty(feature, 'analyzed', false);
                            }
                        }

                        content.features[i] = feature;
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                console.error(`Feature not found: FileName=${args.fileName}, SourcePath=${args.featureSourcePath}`);
                // Clean up lock file before exit
                try {
                    fs.unlinkSync(lockPath);
                } catch (e) {
                    // Ignore
                }
                process.exit(1);
            }

            // Update counters
            content.analyzedCount = content.features.filter(f => f.analyzed === true).length;
            content.pendingCount = content.features.filter(f => f.analyzed === false).length;

            // Write back to file using atomic write (temp file + rename)
            const tempFile = `${sourceFilePath}.tmp`;
            fs.writeFileSync(tempFile, JSON.stringify(content, null, 2), 'utf8');
            fs.renameSync(tempFile, sourceFilePath);

            console.warn(`Updated feature: ${args.fileName} (analyzed=${analyzedBool})`);
        } finally {
            // Release lock - remove lock file
            try {
                if (fs.existsSync(lockPath)) {
                    fs.unlinkSync(lockPath);
                }
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main();
