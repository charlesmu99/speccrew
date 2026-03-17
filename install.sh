#!/bin/bash
# DevCrew Installer Script
# Supports macOS and Linux/WSL
# 
# Install from GitHub (Global):
#   curl -fsSL https://raw.githubusercontent.com/charlesmu99/devcrew/main/install.sh | bash
#
# Install from Gitee (China):
#   curl -fsSL https://gitee.com/amutek/devcrew/raw/main/install.sh | bash
#
# Install to specific directory:
#   curl -fsSL <url> | bash -s /path/to/project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Auto-detect mirror based on script source
SCRIPT_SOURCE="${SCRIPT_SOURCE:-github}"

if [ "$SCRIPT_SOURCE" = "gitee" ]; then
    REPO_URL="https://gitee.com/amutek/devcrew/repository/archive/main.tar.gz"
else
    REPO_URL="https://github.com/charlesmu99/devcrew/archive/refs/heads/main.tar.gz"
fi

TEMP_DIR="$(mktemp -d)"
TARGET_DIR="${1:-.}"

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

# Check if running in correct directory
check_qoder_compatibility() {
    print_info "Checking Qoder compatibility..."
    
    # Check if .qoder already exists
    if [ -d "$TARGET_DIR/.qoder" ]; then
        print_warning "DevCrew appears to be already installed in this directory."
        echo ""
        read -p "Do you want to overwrite/update the existing installation? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installation cancelled."
            exit 0
        fi
        print_info "Proceeding with update..."
    fi
    
    # Check if .devcrew-workspace exists
    if [ -d "$TARGET_DIR/.devcrew-workspace" ]; then
        print_warning ".devcrew-workspace directory already exists."
        echo ""
        read -p "Do you want to overwrite it? This will NOT affect your projects/ directory. (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installation cancelled."
            exit 0
        fi
    fi
}

# Download DevCrew
download_devcrew() {
    print_info "Downloading DevCrew..."
    
    if command -v curl &> /dev/null; then
        curl -fsSL "$REPO_URL" -o "$TEMP_DIR/devcrew.tar.gz"
    elif command -v wget &> /dev/null; then
        wget -q "$REPO_URL" -O "$TEMP_DIR/devcrew.tar.gz"
    else
        print_error "Neither curl nor wget is installed. Please install one of them."
        exit 1
    fi
    
    print_success "Download completed."
}

# Extract and install
install_devcrew() {
    print_info "Extracting files..."
    tar -xzf "$TEMP_DIR/devcrew.tar.gz" -C "$TEMP_DIR"
    
    local extracted_dir="$TEMP_DIR/devcrew-main"
    
    # If the directory name is different, find it
    if [ ! -d "$extracted_dir" ]; then
        extracted_dir=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "devcrew*" | head -n 1)
    fi
    
    print_info "Installing DevCrew to $TARGET_DIR..."
    
    # Create target directory if it doesn't exist
    mkdir -p "$TARGET_DIR"
    
    # Copy .qoder directory (incremental update)
    if [ -d "$extracted_dir/.qoder" ]; then
        mkdir -p "$TARGET_DIR/.qoder"
        
        # Copy agents (skip existing)
        if [ -d "$extracted_dir/.qoder/agents" ]; then
            mkdir -p "$TARGET_DIR/.qoder/agents"
            for agent in "$extracted_dir/.qoder/agents"/*.md; do
                if [ -f "$agent" ]; then
                    agent_name=$(basename "$agent")
                    if [ ! -f "$TARGET_DIR/.qoder/agents/$agent_name" ]; then
                        cp "$agent" "$TARGET_DIR/.qoder/agents/"
                        print_info "Added new agent: $agent_name"
                    fi
                fi
            done
        fi
        
        # Copy skills (skip existing)
        if [ -d "$extracted_dir/.qoder/skills" ]; then
            mkdir -p "$TARGET_DIR/.qoder/skills"
            for skill_dir in "$extracted_dir/.qoder/skills"/*; do
                if [ -d "$skill_dir" ]; then
                    skill_name=$(basename "$skill_dir")
                    if [ ! -d "$TARGET_DIR/.qoder/skills/$skill_name" ]; then
                        cp -r "$skill_dir" "$TARGET_DIR/.qoder/skills/"
                        print_info "Added new skill: $skill_name"
                    fi
                fi
            done
        fi
        
        print_success "Updated .qoder/ directory (incremental)."
    fi
    
    # Copy .devcrew-workspace directory (incremental update)
    if [ -d "$extracted_dir/.devcrew-workspace" ]; then
        mkdir -p "$TARGET_DIR/.devcrew-workspace"
        
        # Only copy docs templates if not exist
        if [ -d "$extracted_dir/.devcrew-workspace/docs" ]; then
            mkdir -p "$TARGET_DIR/.devcrew-workspace/docs"
            for doc in "$extracted_dir/.devcrew-workspace/docs"/*.md; do
                if [ -f "$doc" ]; then
                    doc_name=$(basename "$doc")
                    if [ ! -f "$TARGET_DIR/.devcrew-workspace/docs/$doc_name" ]; then
                        cp "$doc" "$TARGET_DIR/.devcrew-workspace/docs/"
                        print_info "Added new doc: $doc_name"
                    fi
                fi
            done
        fi
        
        # Create knowledge and projects directories if not exist
        mkdir -p "$TARGET_DIR/.devcrew-workspace/knowledge"
        mkdir -p "$TARGET_DIR/.devcrew-workspace/projects"
        
        print_success "Updated .devcrew-workspace/ directory (incremental)."
    fi
    
    # Copy README files to target directory (optional, for reference)
    for readme in "$extracted_dir"/README*.md; do
        if [ -f "$readme" ]; then
            cp "$readme" "$TARGET_DIR/"
        fi
    done
}

# Verify installation
verify_installation() {
    print_info "Verifying installation..."
    
    local errors=0
    
    if [ ! -d "$TARGET_DIR/.qoder" ]; then
        print_error ".qoder/ directory not found after installation."
        errors=$((errors + 1))
    fi
    
    if [ ! -d "$TARGET_DIR/.devcrew-workspace" ]; then
        print_error ".devcrew-workspace/ directory not found after installation."
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
    print_success "DevCrew has been successfully installed!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Open your project in Qoder IDE"
    echo "  2. Run the initialization Skill:"
    echo "     'Run devcrew-knowledge-dispatch Skill to initialize the knowledge base'"
    echo ""
    echo "  3. Start using DevCrew with your first requirement!"
    echo ""
    echo "Documentation:"
    echo "  - Agent Knowledge Map: .devcrew-workspace/docs/agent-knowledge-map.md"
    echo "  - Project Introduction: README.md"
    echo ""
    echo "To uninstall:"
    echo "  rm -rf .qoder .devcrew-workspace"
    echo ""
}

# Main function
main() {
    echo "========================================"
    echo "  DevCrew Installer for Qoder"
    echo "========================================"
    echo ""
    
    # Check OS
    case "$(uname -s)" in
        Darwin*)    print_info "Detected: macOS" ;;
        Linux*)     print_info "Detected: Linux" ;;
        CYGWIN*|MINGW*|MSYS*) 
            print_error "Windows detected. Please use install.ps1 for Windows."
            exit 1
            ;;
        *)          print_warning "Unknown OS: $(uname -s)" ;;
    esac
    
    check_qoder_compatibility
    download_devcrew
    install_devcrew
    verify_installation
    print_next_steps
}

# Run main function
main "$@"
