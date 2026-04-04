#!/usr/bin/env node

/**
 * Get the next batch of features to process from features-*.json files.
 *
 * Scans the sync-state directory for all features-*.json files and extracts
 * features where analyzed=false or analyzed field is missing.
 * Additionally excludes features that have a corresponding .done.json file in the
 * completed/ directory (indicating Worker has finished but results not yet processed).
 * Returns a JSON array limited to BatchSize items.
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        syncStatePath: null,
        batchSize: 5
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--syncStatePath':
            case '-SyncStatePath':
                result.syncStatePath = args[++i];
                break;
            case '--batchSize':
            case '-BatchSize':
                result.batchSize = parseInt(args[++i], 10) || 5;
                break;
        }
    }

    return result;
}

function main() {
    try {
        const args = parseArgs();

        if (!args.syncStatePath) {
            console.error('Error: --syncStatePath is required');
            process.exit(1);
        }

        // Resolve full path
        const fullPath = path.resolve(args.syncStatePath);
        if (!fs.existsSync(fullPath)) {
            console.error(`SyncStatePath not found: ${args.syncStatePath}`);
            process.exit(1);
        }

        // Path to completed directory
        const completedDir = path.join(fullPath, 'completed');

        // Build set of completed feature fileNames (for fast lookup)
        const completedFeatureFileNames = new Set();
        const completedFeatureIds = new Set();
        if (fs.existsSync(completedDir) && fs.statSync(completedDir).isDirectory()) {
            const doneFiles = fs.readdirSync(completedDir).filter(f => f.endsWith('.done.json'));
            for (const doneFile of doneFiles) {
                // Read .done.json file content to extract fileName or featureId
                const doneFilePath = path.join(completedDir, doneFile);
                try {
                    const doneRawContent = fs.readFileSync(doneFilePath, 'utf8');
                    const doneContent = JSON.parse(doneRawContent);
                    // Use fileName field if available, fallback to featureId
                    if (doneContent.fileName) {
                        completedFeatureFileNames.add(doneContent.fileName);
                    }
                    if (doneContent.featureId) {
                        completedFeatureIds.add(doneContent.featureId);
                    }
                } catch (error) {
                    console.warn(`Warning: Failed to read .done.json file ${doneFile}: ${error.message}`);
                    // Fallback: use filename without extension (legacy behavior)
                    const baseName = path.basename(doneFile, '.done.json');
                    completedFeatureIds.add(baseName);
                }
            }
        }

        // Find all features-*.json files
        const featureFiles = fs.readdirSync(fullPath).filter(f => {
            return f.startsWith('features-') && f.endsWith('.json') && fs.statSync(path.join(fullPath, f)).isFile();
        });

        const candidateFeatures = [];

        for (const fileName of featureFiles) {
            const filePath = path.join(fullPath, fileName);
            const rawContent = fs.readFileSync(filePath, 'utf8');
            const content = JSON.parse(rawContent);

            const platformType = content.platformType;
            const platformSubtype = content.platformSubtype || null;
            const sourcePath = content.sourcePath;
            const techStack = content.techStack;
            const platformName = content.platformName;

            if (!content.features || !Array.isArray(content.features)) {
                continue;
            }

            for (const feature of content.features) {
                // Check if feature needs analysis: analyzed=false or analyzed field missing
                const needsAnalysis = !('analyzed' in feature) || feature.analyzed === false;

                if (!needsAnalysis) {
                    continue;
                }

                // Use feature's id and fileName fields
                const featureId = feature.id;
                const featureFileName = feature.fileName;

                // Skip if already completed (has .done.json file)
                // Check both fileName (new format) and featureId (legacy format)
                if (completedFeatureFileNames.has(featureFileName) || completedFeatureIds.has(featureId)) {
                    continue;
                }

                candidateFeatures.push({
                    sourceFile: fileName,
                    platformName: platformName,
                    platformType: platformType,
                    platformSubtype: platformSubtype,
                    sourcePath: sourcePath,
                    techStack: techStack,
                    feature: feature
                });
            }
        }

        // Take only the first BatchSize items
        const batchFeatures = candidateFeatures.slice(0, args.batchSize);

        // Output as JSON
        console.log(JSON.stringify(batchFeatures, null, 2));
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main();
