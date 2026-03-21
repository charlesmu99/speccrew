#!/bin/bash
# SpecCrew Uninstaller Script
# Supports macOS and Linux/WSL
#
# Uninstall from GitHub:
#   curl -fsSL https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/uninstall.sh | bash
#
# Uninstall from Gitee (China):
#   curl -fsSL https://gitee.com/amutek/SpecCrew/raw/main/uninstall.sh | bash

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
uninstall_SpecCrew() {
    echo "========================================"
    echo -e "${YELLOW}  SpecCrew Uninstaller${NC}"
    echo "========================================"
    echo ""
    
    # Check if SpecCrew is installed
    local SpecCrew_found=false
    
    if [ -d "$TARGET_DIR/SpecCrew-workspace" ]; then
        SpecCrew_found=true
    fi
    
    if [ -d "$TARGET_DIR/.qoder/agents" ]; then
        if ls "$TARGET_DIR/.qoder/agents"/SpecCrew-*.md 1> /dev/null 2>&1; then
            SpecCrew_found=true
        fi
    fi
    
    if [ -d "$TARGET_DIR/.qoder/skills" ]; then
        for skill_dir in "$TARGET_DIR/.qoder/skills"/SpecCrew-*; do
            if [ -d "$skill_dir" ]; then
                SpecCrew_found=true
                break
            fi
        done
    fi
    
    if [ "$SpecCrew_found" = false ]; then
        print_warning "SpecCrew does not appear to be installed in this directory."
        echo ""
        print_info "Nothing to uninstall."
        return
    fi
    
    print_warning "This will remove all SpecCrew-related files while preserving your custom agents and skills."
    echo ""
    read -p "Do you want to proceed with uninstallation? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Uninstallation cancelled."
        return
    fi
    
    print_info "Uninstalling SpecCrew..."
    
    # Remove SpecCrew-prefixed agents
    if [ -d "$TARGET_DIR/.qoder/agents" ]; then
        for agent in "$TARGET_DIR/.qoder/agents"/SpecCrew-*.md; do
            if [ -f "$agent" ]; then
                agent_name=$(basename "$agent")
                rm -f "$agent"
                print_info "Removed agent: $agent_name"
            fi
        done
    fi
    
    # Remove SpecCrew-prefixed skills
    if [ -d "$TARGET_DIR/.qoder/skills" ]; then
        for skill_dir in "$TARGET_DIR/.qoder/skills"/SpecCrew-*; do
            if [ -d "$skill_dir" ]; then
                skill_name=$(basename "$skill_dir")
                rm -rf "$skill_dir"
                print_info "Removed skill: $skill_name"
            fi
        done
    fi
    
    # Remove SpecCrew-workspace directory
    if [ -d "$TARGET_DIR/SpecCrew-workspace" ]; then
        rm -rf "$TARGET_DIR/SpecCrew-workspace"
        print_info "Removed directory: SpecCrew-workspace/"
    fi
    
    echo ""
    print_success "SpecCrew has been successfully uninstalled!"
    echo ""
    echo -e "${BLUE}Note:${NC} Your custom agents and skills in .qoder/ have been preserved."
    echo -e "${BLUE}To completely remove all Qoder configurations, manually delete the .qoder/ directory.${NC}"
}

# Main function
main() {
    uninstall_SpecCrew
    
    # Pause to keep terminal open
    echo ""
    read -n 1 -s -r -p "Press any key to continue..."
    echo ""
}

# Run main function
main "$@"
