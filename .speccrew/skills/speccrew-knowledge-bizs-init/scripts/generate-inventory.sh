#!/bin/bash
#
# Generate modules.json for UI module analysis
#
# Scans source directory for page files and generates an inventory with analysis status tracking.
# All configuration is passed via parameters - the script does not infer anything.
#
# Usage: ./generate-inventory.sh <source_path> <output_file_name> <platform_name> <platform_type> [platform_subtype] <tech_stack> <file_extensions> [analysis_method] [exclude_dirs]
# Example: ./generate-inventory.sh src/views "modules-web.json" "Web Frontend" "web" "vue" '["vue","typescript"]' '[".vue",".ts"]' "ui-based" '["components","composables","hooks","utils"]'

set -e

SOURCE_PATH="$1"
OUTPUT_FILE_NAME="$2"
PLATFORM_NAME="$3"
PLATFORM_TYPE="$4"
PLATFORM_SUBTYPE="$5"
TECH_STACK="$6"
FILE_EXTENSIONS="$7"
ANALYSIS_METHOD="${8:-ui-based}"
EXCLUDE_DIRS="${9:-[\"components\",\"composables\",\"hooks\",\"utils\"]}"

if [ -z "$SOURCE_PATH" ] || [ -z "$OUTPUT_FILE_NAME" ] || [ -z "$PLATFORM_NAME" ] || [ -z "$PLATFORM_TYPE" ] || [ -z "$TECH_STACK" ] || [ -z "$FILE_EXTENSIONS" ]; then
    echo "Usage: $0 <source_path> <output_file_name> <platform_name> <platform_type> [platform_subtype] <tech_stack> <file_extensions> [analysis_method] [exclude_dirs]"
    echo "Example: $0 src/views 'modules-web.json' 'Web Frontend' 'web' 'vue' '[\"vue\",\"typescript\"]' '[\".vue\",\".ts\"]' 'ui-based' '[\"components\",\"composables\"]'"
    exit 1
fi

# Resolve absolute path
SOURCE_PATH=$(cd "$SOURCE_PATH" && pwd)

# Determine sync-state directory
# Search upward from source path to find project root (contains speccrew-workspace)
find_project_root() {
    local current_dir="$1"
    while [ "$current_dir" != "/" ] && [ "$current_dir" != "." ]; do
        if [ -d "$current_dir/speccrew-workspace" ]; then
            echo "$current_dir"
            return
        fi
        current_dir="$(dirname "$current_dir")"
    done
    # Fallback: return source directory
    echo "$1"
}

PROJECT_ROOT="$(find_project_root "$SOURCE_PATH")"
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
FILE_PATTERN=$(echo "$FILE_EXTENSIONS" | jq -r '.[]' | awk '{printf "-name '\''*%s'\'' ", $0}' | sed 's/ $//' | sed 's/ -name/ -o -name/g' | sed 's/^-o -name/-name/')

# Change to source directory for relative paths
cd "$SOURCE_PATH"

# Helper function to check if a directory is in the exclude list
is_excluded_dir() {
    local dir="$1"
    # Use jq to check if dir is in EXCLUDE_DIRS array
    echo "$EXCLUDE_DIRS" | jq -e "contains([\"$dir\"])" > /dev/null 2>&1
}

# Helper function to check if path contains any excluded directory
is_excluded_path() {
    local path="$1"
    local IFS='/'
    read -ra parts <<< "$path"
    for part in "${parts[@]}"; do
        if is_excluded_dir "$part"; then
            return 0
        fi
    done
    return 1
}

# Helper function to get module path (stops at excluded subdirectories)
get_module_path() {
    local dir="$1"
    local result=""
    local IFS='/'
    read -ra parts <<< "$dir"
    for part in "${parts[@]}"; do
        # Stop at excluded directories - these belong to parent module
        if is_excluded_dir "$part"; then
            break
        fi
        if [ -n "$result" ]; then
            result="$result/$part"
        else
            result="$part"
        fi
    done
    echo "$result"
}

# Find all page files and build JSON structure
eval "find . -type f \( $FILE_PATTERN \)" | sort | \
while IFS= read -r file; do
    # Remove leading ./
    file="${file#./}"
    
    # Skip files in excluded directories
    if is_excluded_path "$file"; then
        continue
    fi
    
    dir=$(dirname "$file")
    filename=$(basename "$file" | sed 's/\.[^.]*$//')
    ext=".${file##*.}"
    # Get module path (stops at components/composables)
    modulePath=$(get_module_path "$dir")
    
    # Output as JSON object
    printf '{"dir":"%s","modulePath":"%s","file":"%s","ext":"%s","path":"%s"}\n' \
        "$dir" "$modulePath" "$filename" "$ext" "$file"
done | jq -s \
    --arg source "$SOURCE_PATH" \
    --arg date "$(date -u +%Y-%m-%d-%H%M%S)" \
    --arg platformName "$PLATFORM_NAME" \
    --arg platformType "$PLATFORM_TYPE" \
    --arg platformSubtype "$PLATFORM_SUBTYPE" \
    --arg techStack "$TECH_STACK" \
    --arg analysisMethod "$ANALYSIS_METHOD" '{
    platformName: $platformName,
    platformType: $platformType,
    platformSubtype: (if $platformSubtype == "" then null else $platformSubtype end),
    sourcePath: $source,
    techStack: ($techStack | fromjson),
    totalFiles: length,
    analyzedCount: 0,
    pendingCount: length,
    generatedAt: $date,
    analysisMethod: $analysisMethod,
    modules: group_by(.modulePath) | map({
        modulePath: .[0].modulePath,
        relativePath: .[0].modulePath,
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
}' > "$OUTPUT_PATH"

TOTAL=$(jq '.totalFiles' "$OUTPUT_PATH")
echo "Generated modules.json with $TOTAL entry points"
echo "Ready for analysis: $OUTPUT_PATH"
