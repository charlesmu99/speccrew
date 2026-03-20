#!/bin/bash
# DevCrew Uninstaller Script
# Supports macOS and Linux/WSL
#
# Uninstall from GitHub:
#   curl -fsSL https://raw.githubusercontent.com/charlesmu99/devcrew/main/uninstall.sh | bash
#
# Uninstall from Gitee (China):
#   curl -fsSL https://gitee.com/amutek/devcrew/raw/main/uninstall.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default target directory
TARGET_DIR="${1:-.}"

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

# Main uninstall function
uninstall_devcrew() {
    echo "========================================"
    echo -e "${YELLOW}  DevCrew Uninstaller${NC}"
    echo "========================================"
    echo ""
    
    # Check if DevCrew is installed
    local devcrew_found=false
    
    if [ -d "$TARGET_DIR/devcrew-workspace" ]; then
        devcrew_found=true
    fi
    
    if [ -d "$TARGET_DIR/.qoder/agents" ]; then
        if ls "$TARGET_DIR/.qoder/agents"/devcrew-*.md 1> /dev/null 2>&1; then
            devcrew_found=true
        fi
    fi
    
    if [ -d "$TARGET_DIR/.qoder/skills" ]; then
        for skill_dir in "$TARGET_DIR/.qoder/skills"/devcrew-*; do
            if [ -d "$skill_dir" ]; then
                devcrew_found=true
                break
            fi
        done
    fi
    
    if [ "$devcrew_found" = false ]; then
        print_warning "DevCrew does not appear to be installed in this directory."
        echo ""
        print_info "Nothing to uninstall."
        return
    fi
    
    print_warning "This will remove all DevCrew-related files while preserving your custom agents and skills."
    echo ""
    read -p "Do you want to proceed with uninstallation? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Uninstallation cancelled."
        return
    fi
    
    print_info "Uninstalling DevCrew..."
    
    # Remove devcrew-prefixed agents
    if [ -d "$TARGET_DIR/.qoder/agents" ]; then
        for agent in "$TARGET_DIR/.qoder/agents"/devcrew-*.md; do
            if [ -f "$agent" ]; then
                agent_name=$(basename "$agent")
                rm -f "$agent"
                print_info "Removed agent: $agent_name"
            fi
        done
    fi
    
    # Remove devcrew-prefixed skills
    if [ -d "$TARGET_DIR/.qoder/skills" ]; then
        for skill_dir in "$TARGET_DIR/.qoder/skills"/devcrew-*; do
            if [ -d "$skill_dir" ]; then
                skill_name=$(basename "$skill_dir")
                rm -rf "$skill_dir"
                print_info "Removed skill: $skill_name"
            fi
        done
    fi
    
    # Remove devcrew-workspace directory
    if [ -d "$TARGET_DIR/devcrew-workspace" ]; then
        rm -rf "$TARGET_DIR/devcrew-workspace"
        print_info "Removed directory: devcrew-workspace/"
    fi
    
    echo ""
    print_success "DevCrew has been successfully uninstalled!"
    echo ""
    echo -e "${BLUE}Note:${NC} Your custom agents and skills in .qoder/ have been preserved."
    echo -e "${BLUE}To completely remove all Qoder configurations, manually delete the .qoder/ directory.${NC}"
}

# Main function
main() {
    uninstall_devcrew
    
    # Pause to keep terminal open
    echo ""
    read -n 1 -s -r -p "Press any key to continue..."
    echo ""
}

# Run main function
main "$@"
