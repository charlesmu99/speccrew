#!/usr/bin/env node

/**
 * Mark features as stale (pending re-analysis) for specified paths.
 *
 * Scans all features-*.json files in the SyncStatePath directory and marks
 * features as stale when their sourcePath matches one of the provided paths.
 * Matching supports exact path match or directory prefix match (when a
 * directory path is provided, all features under that directory are marked).
 *
 * Resets the following fields for matched features:
 * - analyzed = false
 * - status = "pending" (if the field exists)
 * - startedAt = null
 * - completedAt = null
 * - analysisNotes = null
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        syncStatePath: null,
        paths: []
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--syncStatePath':
            case '-SyncStatePath':
                result.syncStatePath = args[++i];
                break;
            case '--paths':
            case '-Paths':
                // Support comma-separated paths or multiple --paths arguments
                const pathsValue = args[++i];
                if (pathsValue) {
                    result.paths.push(...pathsValue.split(',').map(p => p.trim()).filter(p => p));
                }
                break;
        }
    }

    return result;
}

// Helper function to safely set property on object
function setFeatureProperty(obj, propertyName, value) {
    obj[propertyName] = value;
}

// Helper function to safely remove property from object
function removeFeatureProperty(obj, propertyName) {
    if (propertyName in obj) {
        delete obj[propertyName];
    }
}

// Helper function to normalize path for comparison
// - Convert backslashes to forward slashes
// - Remove trailing slashes
// - Convert to lowercase for case-insensitive comparison (Windows)
function normalizePath(inputPath) {
    if (!inputPath) {
        return '';
    }
    let normalized = inputPath.replace(/\\/g, '/');
    normalized = normalized.replace(/\/$/, '');
    return normalized.toLowerCase();
}

function main() {
    try {
        const args = parseArgs();

        if (!args.syncStatePath) {
            console.error('Error: --syncStatePath is required');
            process.exit(1);
        }

        if (args.paths.length === 0) {
            console.error('Error: --paths is required');
            process.exit(1);
        }

        // Validate SyncStatePath exists
        const resolvedSyncStatePath = path.resolve(args.syncStatePath);
        if (!fs.existsSync(resolvedSyncStatePath)) {
            console.error(`SyncStatePath not found: ${args.syncStatePath}`);
            process.exit(1);
        }

        // Normalize input paths for matching
        const normalizedInputPaths = args.paths.map(p => normalizePath(p));

        // Find all features-*.json files
        const featureFiles = fs.readdirSync(resolvedSyncStatePath).filter(f => {
            return f.startsWith('features-') && f.endsWith('.json') && fs.statSync(path.join(resolvedSyncStatePath, f)).isFile();
        });

        if (featureFiles.length === 0) {
            // No feature files found, output empty result
            const result = {
                totalAffected: 0,
                features: []
            };
            console.log(JSON.stringify(result, null, 2));
            process.exit(0);
        }

        const affectedFeatures = [];

        for (const fileName of featureFiles) {
            const filePath = path.join(resolvedSyncStatePath, fileName);
            const lockPath = `${filePath}.lock`;
            const maxRetries = 30;
            let retryCount = 0;
            let lockAcquired = false;

            // Acquire file lock
            while (!lockAcquired && retryCount < maxRetries) {
                try {
                    // Try to create lock file exclusively
                    const fd = fs.openSync(lockPath, 'wx');
                    fs.closeSync(fd);
                    lockAcquired = true;
                } catch (error) {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        const errorMsg = `Failed to acquire file lock for '${fileName}' after ${maxRetries} attempts (waited ${maxRetries} seconds). The file may be locked by another process.`;
                        console.warn(errorMsg);
                        // Continue to next file instead of exiting
                        break;
                    }
                    if (retryCount % 5 === 0) {
                        console.warn(`Waiting for file lock on '${fileName}'... (attempt ${retryCount} of ${maxRetries})`);
                    }
                    // Wait 1 second before retry
                    const start = Date.now();
                    while (Date.now() - start < 1000) {
                        // Busy wait
                    }
                }
            }

            // Skip this file if lock could not be acquired
            if (!lockAcquired) {
                continue;
            }

            try {
                // Read the JSON file
                const rawContent = fs.readFileSync(filePath, 'utf8');
                const content = JSON.parse(rawContent);
                let fileModified = false;

                if (content.features && Array.isArray(content.features)) {
                    for (let i = 0; i < content.features.length; i++) {
                        const feature = content.features[i];
                        const featureSourcePath = feature.sourcePath;

                        if (!featureSourcePath) {
                            continue;
                        }

                        const normalizedFeaturePath = normalizePath(featureSourcePath);

                        // Check if any input path matches this feature
                        let matched = false;
                        for (const inputPath of normalizedInputPaths) {
                            // Exact match or directory prefix match
                            if (normalizedFeaturePath === inputPath) {
                                matched = true;
                                break;
                            }
                            // Directory prefix match: input path is a directory and feature path starts with it
                            if (normalizedFeaturePath.startsWith(`${inputPath}/`)) {
                                matched = true;
                                break;
                            }
                        }

                        if (matched) {
                            // Reset fields
                            setFeatureProperty(feature, 'analyzed', false);

                            // Only set status if the field already exists
                            if ('status' in feature) {
                                setFeatureProperty(feature, 'status', 'pending');
                            }

                            // Clear timestamp fields
                            removeFeatureProperty(feature, 'startedAt');
                            removeFeatureProperty(feature, 'completedAt');
                            removeFeatureProperty(feature, 'analysisNotes');

                            content.features[i] = feature;
                            fileModified = true;

                            // Add to affected list
                            affectedFeatures.push({
                                sourcePath: featureSourcePath,
                                module: feature.module,
                                sourceFile: fileName
                            });
                        }
                    }
                }

                // Update counters and write back if modified
                if (fileModified) {
                    content.analyzedCount = content.features.filter(f => f.analyzed === true).length;
                    content.pendingCount = content.features.filter(f => f.analyzed === false).length;

                    // Atomic write: temp file + rename
                    const tempFile = `${filePath}.tmp`;
                    fs.writeFileSync(tempFile, JSON.stringify(content, null, 2), 'utf8');
                    fs.renameSync(tempFile, filePath);
                }
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
        }

        // Output result as JSON
        const result = {
            totalAffected: affectedFeatures.length,
            features: affectedFeatures
        };

        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main();