#!/bin/bash
#
# Generate modules.json for UI module analysis
#
# Scans source directory for page files and generates an inventory with analysis status tracking.
# All configuration is passed via parameters - the script does not infer anything.
#
# Usage: ./generate-inventory.sh <source_path> <output_file_name> <platform_name> <platform_type> [platform_subtype] <tech_stack> <file_extensions> [analysis_method]
# Example: ./generate-inventory.sh src/views "modules-web.json" "Web Frontend" "web" "vue" '["vue","typescript"]' '[".vue",".ts"]' "ui-based"

set -e

SOURCE_PATH="$1"
OUTPUT_FILE_NAME="$2"
PLATFORM_NAME="$3"
PLATFORM_TYPE="$4"
PLATFORM_SUBTYPE="$5"
TECH_STACK="$6"
FILE_EXTENSIONS="$7"
ANALYSIS_METHOD="${8:-ui-based}"

if [ -z "$SOURCE_PATH" ] || [ -z "$OUTPUT_FILE_NAME" ] || [ -z "$PLATFORM_NAME" ] || [ -z "$PLATFORM_TYPE" ] || [ -z "$TECH_STACK" ] || [ -z "$FILE_EXTENSIONS" ]; then
    echo "Usage: $0 <source_path> <output_file_name> <platform_name> <platform_type> [platform_subtype] <tech_stack> <file_extensions> [analysis_method]"
    echo "Example: $0 src/views 'modules-web.json' 'Web Frontend' 'web' 'vue' '[\"vue\",\"typescript\"]' '[\".vue\",\".ts\"]' 'ui-based'"
    exit 1
fi

# Resolve absolute path
SOURCE_PATH=$(cd "$SOURCE_PATH" && pwd)

# Determine sync-state directory (relative to script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$SKILL_DIR")"
SYNC_STATE_DIR="$PROJECT_ROOT/speccrew-workspace/knowledges/base/sync-state"
OUTPUT_PATH="$SYNC_STATE_DIR/$OUTPUT_FILE_NAME"

if [ ! -d "$SOURCE_PATH" ]; then
    echo "Error: Source path does not exist: $SOURCE_PATH"
    exit 1
fi

echo "Scanning: $SOURCE_PATH"
echo "Output: $OUTPUT_PATH"
echo "Platform: $PLATFORM_NAME ($PLATFORM_TYPE)"
echo "TechStack: $TECH_STACK"
echo "Extensions: $FILE_EXTENSIONS"

# Ensure sync-state directory exists
mkdir -p "$SYNC_STATE_DIR"

# Check for jq
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed"
    echo "Install: apt-get install jq (Ubuntu/Debian) or brew install jq (Mac)"
    exit 1
fi

# Build file pattern from extensions
# Convert [".vue",".ts"] to -name '*.vue' -o -name '*.ts'
FILE_PATTERN=$(echo "$FILE_EXTENSIONS" | jq -r '.[]' | awk '{printf "-name '\''*%s'\'' ", $0}' | sed 's/ $//' | sed 's/ -o $//' | sed 's/ -name/ -o -name/g')

# Change to source directory for relative paths
cd "$SOURCE_PATH"

# Find all page files and build JSON structure
eval "find . -type f \( $FILE_PATTERN \)" | sort | \
while IFS= read -r file; do
    # Remove leading ./
    file="${file#./}"
    dir=$(dirname "$file")
    filename=$(basename "$file" | sed 's/\.[^.]*$//')
    ext=".${file##*.}"
    
    # Output as JSON object
    printf '{"dir":"%s","file":"%s","ext":"%s","path":"%s"}\n' \
        "$dir" "$filename" "$ext" "$file"
done | jq -s \
    --arg source "$SOURCE_PATH" \
    --arg date "$(date -u +%Y-%m-%d-%H%M%S)" \
    --arg platformName "$PLATFORM_NAME" \
    --arg platformType "$PLATFORM_TYPE" \
    --arg platformSubtype "$PLATFORM_SUBTYPE" \
    --arg techStack "$TECH_STACK" \
    --arg analysisMethod "$ANALYSIS_METHOD" '{
    generatedAt: $date,
    analysisMethod: $analysisMethod,
    platformCount: 1,
    platforms: [{
        platformName: $platformName,
        platformType: $platformType,
        platformSubtype: (if $platformSubtype == "" then null else $platformSubtype end),
        sourcePath: $source,
        techStack: ($techStack | fromjson),
        totalFiles: length,
        analyzedCount: 0,
        pendingCount: length,
        modules: group_by(.dir) | map({
            modulePath: .[0].dir,
            relativePath: .[0].dir,
            entryPoints: map({
                fileName: .file,
                fullPath: ($source + "/" + .path),
                relativePath: .path,
                extension: .ext,
                analyzed: false,
                startedAt: null,
                completedAt: null,
                analysisNotes: null
            })
        })
    }]
}' > "$OUTPUT_PATH"

TOTAL=$(jq '.platforms[0].totalFiles' "$OUTPUT_PATH")
echo "Generated modules.json with $TOTAL entry points"
echo "Ready for analysis: $OUTPUT_PATH"
