#!/bin/bash
# SpecCrew Installer for Qoder (macOS/Linux)
#
# Install from GitHub:
#   curl -fsSL https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/scripts/install-qoder.sh | bash
#
# Install from Gitee (China):
#   curl -fsSL https://gitee.com/amutek/speccrew/raw/main/scripts/install-qoder.sh | bash
#
# Install to specific directory:
#   curl -fsSL <url> | bash -s /path/to/project
#
# Uninstall:
#   ./install-qoder.sh --uninstall (or -u)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# IDE-specific configuration
IDEName="Qoder"
IDEConfigDir=".qoder"
SourceDir=".speccrew"

# Configuration - Auto-detect mirror
SCRIPT_SOURCE="${SCRIPT_SOURCE:-github}"

# Check for uninstall flag
UNINSTALL_MODE=false
if [ "$1" = "--uninstall" ] || [ "$1" = "-u" ]; then
    UNINSTALL_MODE=true
fi

if [ "$SCRIPT_SOURCE" = "gitee" ]; then
    REPO_URL="https://gitee.com/amutek/SpecCrew/repository/archive/main.tar.gz"
else
    REPO_URL="https://github.com/charlesmu99/SpecCrew/archive/refs/heads/main.tar.gz"
fi

TEMP_DIR="$(mktemp -d)"
TARGET_DIR="${2:-${1:-.}}"

# Cleanup on exit
trap "rm -rf $TEMP_DIR" EXIT

# Print functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Uninstall SpecCrew from Qoder
uninstall_SpecCrew() {
    echo "========================================"
    echo -e "${YELLOW}  SpecCrew Uninstaller for $IDEName${NC}"
    echo "========================================"
    echo ""
    
    print_warning "This will remove all SpecCrew-related files from $IDEName while preserving your custom agents and skills."
    echo ""
    read -p "Do you want to proceed with uninstallation? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Uninstallation cancelled."
        return
    fi
    
    print_info "Uninstalling SpecCrew from $IDEName..."
    
    # Remove SpecCrew-prefixed agents from IDE config dir
    if [ -d "$TARGET_DIR/$IDEConfigDir/agents" ]; then
        for agent in "$TARGET_DIR/$IDEConfigDir/agents"/speccrew-*.md; do
            if [ -f "$agent" ]; then
                agent_name=$(basename "$agent")
                rm -f "$agent"
                print_info "Removed agent: $agent_name"
            fi
        done
    fi

    # Remove SpecCrew-prefixed skills from IDE config dir
    if [ -d "$TARGET_DIR/$IDEConfigDir/skills" ]; then
        for skill_dir in "$TARGET_DIR/$IDEConfigDir/skills"/speccrew-*; do
            if [ -d "$skill_dir" ]; then
                skill_name=$(basename "$skill_dir")
                rm -rf "$skill_dir"
                print_info "Removed skill: $skill_name"
            fi
        done
    fi
    
    # Remove speccrew-workspace directory
    if [ -d "$TARGET_DIR/speccrew-workspace" ]; then
        rm -rf "$TARGET_DIR/speccrew-workspace"
        print_info "Removed directory: speccrew-workspace/"
    fi
    
    echo ""
    print_success "SpecCrew has been successfully uninstalled from $IDEName!"
    echo ""
    echo -e "${BLUE}Note:${NC} Your custom agents and skills in $IDEConfigDir/ have been preserved."
}

# Check if SpecCrew is already installed
function check_existing_installation() {
    print_info "Checking existing installation..."
    
    local SpecCrew_installed=false
    
    # Check for SpecCrew-prefixed agents in IDE config
    if [ -d "$TARGET_DIR/$IDEConfigDir/agents" ]; then
        if ls "$TARGET_DIR/$IDEConfigDir/agents"/speccrew-*.md 1> /dev/null 2>&1; then
            SpecCrew_installed=true
        fi
    fi

    # Check for SpecCrew-prefixed skills in IDE config
    if [ -d "$TARGET_DIR/$IDEConfigDir/skills" ]; then
        for skill_dir in "$TARGET_DIR/$IDEConfigDir/skills"/speccrew-*; do
            if [ -d "$skill_dir" ]; then
                SpecCrew_installed=true
                break
            fi
        done
    fi
    
    # Check for speccrew-workspace
    if [ -d "$TARGET_DIR/speccrew-workspace" ]; then
        SpecCrew_installed=true
    fi
    
    if [ "$SpecCrew_installed" = true ]; then
        print_warning "SpecCrew appears to be already installed in this directory."
        echo ""
        read -p "Do you want to update the existing installation? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installation cancelled."
            exit 0
        fi
        print_info "Proceeding with update..."
    fi
}

# Download SpecCrew
download_SpecCrew() {
    print_info "Downloading SpecCrew..."
    
    if command -v curl &> /dev/null; then
        curl -fsSL "$REPO_URL" -o "$TEMP_DIR/SpecCrew.tar.gz"
    elif command -v wget &> /dev/null; then
        wget -q "$REPO_URL" -O "$TEMP_DIR/SpecCrew.tar.gz"
    else
        print_error "Neither curl nor wget is installed. Please install one of them."
        exit 1
    fi
    
    print_success "Download completed."
}

# Extract and install
install_SpecCrew() {
    print_info "Extracting files..."
    tar -xzf "$TEMP_DIR/SpecCrew.tar.gz" -C "$TEMP_DIR"
    
    local extracted_dir="$TEMP_DIR/SpecCrew-main"
    
    # If the directory name is different, find it
    if [ ! -d "$extracted_dir" ]; then
        extracted_dir=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "SpecCrew*" | head -n 1)
    fi
    
    print_info "Installing SpecCrew to $TARGET_DIR..."
    
    # Create target directory if it doesn't exist
    mkdir -p "$TARGET_DIR"
    
    # Get source directory from archive
    local source_source="$extracted_dir/$SourceDir"
    
    # Copy directly to IDE config directory
    local ide_path="$TARGET_DIR/$IDEConfigDir"
    mkdir -p "$ide_path"
    
    # Copy agents to IDE config (incremental update)
    if [ -d "$source_source/agents" ]; then
        mkdir -p "$ide_path/agents"
        for agent in "$source_source/agents"/*.md; do
            if [ -f "$agent" ]; then
                agent_name=$(basename "$agent")
                is_SpecCrew=false
                case "$agent_name" in
                    speccrew-*) is_SpecCrew=true ;;
                esac
                if [ "$is_SpecCrew" = true ] || [ ! -f "$ide_path/agents/$agent_name" ]; then
                    cp "$agent" "$ide_path/agents/"
                    if [ -f "$ide_path/agents/$agent_name" ] && [ "$is_SpecCrew" = true ]; then
                        print_info "Updated IDE agent: $agent_name"
                    else
                        print_info "Added IDE agent: $agent_name"
                    fi
                fi
            fi
        done
    fi
    
    # Copy skills to IDE config (incremental update)
    if [ -d "$source_source/skills" ]; then
        mkdir -p "$ide_path/skills"
        for skill_dir in "$source_source/skills"/*; do
            if [ -d "$skill_dir" ]; then
                skill_name=$(basename "$skill_dir")
                is_SpecCrew=false
                case "$skill_name" in
                    speccrew-*) is_SpecCrew=true ;;
                esac
                if [ "$is_SpecCrew" = true ] || [ ! -d "$ide_path/skills/$skill_name" ]; then
                    if [ -d "$ide_path/skills/$skill_name" ] && [ "$is_SpecCrew" = true ]; then
                        rm -rf "$ide_path/skills/$skill_name"
                        print_info "Updated IDE skill: $skill_name"
                    else
                        print_info "Added IDE skill: $skill_name"
                    fi
                    cp -r "$skill_dir" "$ide_path/skills/"
                fi
            fi
        done
    fi
    
    print_success "Updated $IDEConfigDir/ directory for $IDEName."
    
    # Copy speccrew-workspace directory
    mkdir -p "$TARGET_DIR/speccrew-workspace"
    
    if [ -d "$extracted_dir/speccrew-workspace" ]; then
        # Copy docs from archive
        if [ -d "$extracted_dir/speccrew-workspace/docs" ]; then
            mkdir -p "$TARGET_DIR/speccrew-workspace/docs"
            for doc in "$extracted_dir/speccrew-workspace/docs"/*.md; do
                if [ -f "$doc" ]; then
                    doc_name=$(basename "$doc")
                    if [ -f "$TARGET_DIR/speccrew-workspace/docs/$doc_name" ]; then
                        print_info "Updated doc: $doc_name"
                    else
                        print_info "Added new doc: $doc_name"
                    fi
                    cp "$doc" "$TARGET_DIR/speccrew-workspace/docs/"
                fi
            done
            
            # Copy rules subdirectory
            if [ -d "$extracted_dir/speccrew-workspace/docs/rules" ]; then
                mkdir -p "$TARGET_DIR/speccrew-workspace/docs/rules"
                for rule in "$extracted_dir/speccrew-workspace/docs/rules"/*.md; do
                    if [ -f "$rule" ]; then
                        rule_name=$(basename "$rule")
                        if [ -f "$TARGET_DIR/speccrew-workspace/docs/rules/$rule_name" ]; then
                            print_info "Updated rule: $rule_name"
                        else
                            print_info "Added new rule: $rule_name"
                        fi
                        cp "$rule" "$TARGET_DIR/speccrew-workspace/docs/rules/"
                    fi
                done
            fi
            
            # Copy solutions subdirectory
            if [ -d "$extracted_dir/speccrew-workspace/docs/solutions" ]; then
                mkdir -p "$TARGET_DIR/speccrew-workspace/docs/solutions"
                for solution in "$extracted_dir/speccrew-workspace/docs/solutions"/*.md; do
                    if [ -f "$solution" ]; then
                        solution_name=$(basename "$solution")
                        if [ -f "$TARGET_DIR/speccrew-workspace/docs/solutions/$solution_name" ]; then
                            print_info "Updated solution: $solution_name"
                        else
                            print_info "Added new solution: $solution_name"
                        fi
                        cp "$solution" "$TARGET_DIR/speccrew-workspace/docs/solutions/"
                    fi
                done
            fi
            
            # Copy configs subdirectory
            if [ -d "$extracted_dir/speccrew-workspace/docs/configs" ]; then
                mkdir -p "$TARGET_DIR/speccrew-workspace/docs/configs"
                for config in "$extracted_dir/speccrew-workspace/docs/configs"/*.json; do
                    if [ -f "$config" ]; then
                        config_name=$(basename "$config")
                        if [ -f "$TARGET_DIR/speccrew-workspace/docs/configs/$config_name" ]; then
                            print_info "Updated config: $config_name"
                        else
                            print_info "Added new config: $config_name"
                        fi
                        cp "$config" "$TARGET_DIR/speccrew-workspace/docs/configs/"
                    fi
                done
            fi
        fi
        
        print_success "Updated speccrew-workspace/ directory."
    fi
    
    # Create workspace directories if not exist
    mkdir -p "$TARGET_DIR/speccrew-workspace/iterations"
    mkdir -p "$TARGET_DIR/speccrew-workspace/iteration-archives"
    mkdir -p "$TARGET_DIR/speccrew-workspace/knowledges/base/diagnosis-reports"
    mkdir -p "$TARGET_DIR/speccrew-workspace/knowledges/base/sync-state"
    mkdir -p "$TARGET_DIR/speccrew-workspace/knowledges/base/tech-debts"
    mkdir -p "$TARGET_DIR/speccrew-workspace/knowledges/bizs"
    mkdir -p "$TARGET_DIR/speccrew-workspace/knowledges/techs"
    
    # Copy README and LICENSE files to speccrew-workspace/docs
    local docs_target="$TARGET_DIR/speccrew-workspace/docs"
    for readme in "$extracted_dir"/README*.md; do
        if [ -f "$readme" ]; then
            readme_name=$(basename "$readme")
            if [ -f "$docs_target/$readme_name" ]; then
                print_info "Updated doc: $readme_name"
            else
                print_info "Added doc: $readme_name"
            fi
            cp "$readme" "$docs_target/"
        fi
    done
    
    # Copy LICENSE file
    if [ -f "$extracted_dir/LICENSE" ]; then
        if [ -f "$docs_target/LICENSE" ]; then
            print_info "Updated doc: LICENSE"
        else
            print_info "Added doc: LICENSE"
        fi
        cp "$extracted_dir/LICENSE" "$docs_target/"
    fi
}

# Verify installation
verify_installation() {
    print_info "Verifying installation..."
    
    local errors=0
    
    if [ ! -d "$TARGET_DIR/$IDEConfigDir" ]; then
        print_error "$IDEConfigDir/ directory not found after installation."
        errors=$((errors + 1))
    fi
    
    if [ ! -d "$TARGET_DIR/speccrew-workspace" ]; then
        print_error "speccrew-workspace/ directory not found after installation."
        errors=$((errors + 1))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Installation verified successfully!"
        return 0
    else
        return 1
    fi
}

# Print next steps
print_next_steps() {
    echo ""
    echo "========================================"
    print_success "SpecCrew has been successfully installed for $IDEName!"
    echo "========================================"
    echo ""
    echo "Directory structure:"
    echo "  - $IDEConfigDir/       : $IDEName IDE configuration"
    echo "  - speccrew-workspace/  : Working directory"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Open your project in $IDEName IDE"
    echo ""
    echo "  2. Start a new chat dialog and invoke the Leader Agent:"
    echo "     - Type: /SpecCrew-leader"
    echo "     - Then type: 'Analyze this project' or similar request"
    echo ""
    echo "  3. The Leader Agent will guide you through:"
    echo "     - Project diagnosis and tech stack analysis"
    echo "     - AI engineering infrastructure setup"
    echo "     - Knowledge base initialization"
    echo ""
    echo "Documentation:"
    echo "  - Agent Knowledge Map: speccrew-workspace/docs/solutions/agent-knowledge-map.md"
    echo ""
    echo "To uninstall:"
    echo "  Run: ./install-qoder.sh --uninstall (or -u)"
    echo ""
}

# Main function
main() {
    # Check if uninstall mode
    if [ "$UNINSTALL_MODE" = true ]; then
        uninstall_SpecCrew
        
        # Pause to keep terminal open
        echo ""
        read -n 1 -s -r -p "Press any key to continue..."
        echo ""
        return
    fi
    
    echo "========================================"
    echo "  SpecCrew Installer for $IDEName"
    echo "========================================"
    echo ""
    
    # Check OS
    case "$(uname -s)" in
        Darwin*)    print_info "Detected: macOS" ;;
        Linux*)     print_info "Detected: Linux" ;;
        CYGWIN*|MINGW*|MSYS*) 
            print_error "Windows detected. Please use install-qoder.ps1 for Windows."
            read -n 1 -s -r -p "Press any key to continue..."
            echo ""
            exit 1
            ;;
        *)          print_warning "Unknown OS: $(uname -s)" ;;
    esac
    
    local exit_code=0
    
    check_existing_installation
    download_SpecCrew || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        install_SpecCrew || exit_code=1
    fi
    
    if [ $exit_code -eq 0 ]; then
        verify_installation || exit_code=1
    fi
    
    if [ $exit_code -eq 0 ]; then
        print_next_steps
    fi
    
    # Pause to keep terminal open
    echo ""
    read -n 1 -s -r -p "Press any key to continue..."
    echo ""
    
    exit $exit_code
}

# Run main function
main "$@"
