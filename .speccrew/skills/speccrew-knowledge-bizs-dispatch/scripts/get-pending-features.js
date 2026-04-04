#!/usr/bin/env node

/**
 * Get all pending features from features-*.json files.
 *
 * Scans the sync-state directory for all features-*.json files and extracts
 * features where status='pending' or status field is missing (backward compatibility).
 * Returns a flat JSON array with platform metadata attached to each feature for easy dispatch.
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        syncStatePath: null,
        platformId: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--syncStatePath':
            case '-SyncStatePath':
                result.syncStatePath = args[++i];
                break;
            case '--platformId':
            case '-platformId':
                result.platformId = args[++i];
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

        // Find features-*.json files, filtered by platformId if specified
        let featureFiles = fs.readdirSync(fullPath).filter(f => {
            return f.startsWith('features-') && f.endsWith('.json') && fs.statSync(path.join(fullPath, f)).isFile();
        });

        // If platformId is specified, filter to only the matching file
        if (args.platformId) {
            const targetFile = `features-${args.platformId}.json`;
            featureFiles = featureFiles.filter(f => f === targetFile);
        }

        const pendingFeatures = [];

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
                if (!('status' in feature) || feature.status === 'pending') {
                    pendingFeatures.push({
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
        }

        // Output as JSON
        console.log(JSON.stringify(pendingFeatures, null, 2));
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main();
