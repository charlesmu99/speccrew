# DevCrew Installer Script for Windows
#
# Install from GitHub (Global):
#   Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/charlesmu99/devcrew/main/install.ps1").Content
#
# Install from Gitee (China):
#   Invoke-Expression (Invoke-WebRequest -Uri "https://gitee.com/amutek/devcrew/raw/main/install.ps1").Content

param(
    [string]$TargetDir = ".",
    [string]$Mirror = "github"  # Options: github, gitee
)

$ErrorActionPreference = "Stop"

# Configuration - Select mirror
if ($Mirror -eq "gitee") {
    $RepoUrl = "https://gitee.com/amutek/devcrew/repository/archive/main.zip"
} else {
    $RepoUrl = "https://github.com/charlesmu99/devcrew/archive/refs/heads/main.zip"
}

$TempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()

# Colors for output
function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Cleanup function
function Cleanup {
    if (Test-Path $TempDir) {
        Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
    }
}

# Check if running in correct directory
function Check-QoderCompatibility {
    Write-Info "Checking Qoder compatibility..."
    
    $qoderPath = Join-Path $TargetDir ".qoder"
    $workspacePath = Join-Path $TargetDir ".devcrew-workspace"
    
    # Check if .qoder already exists
    if (Test-Path $qoderPath) {
        Write-Warning "DevCrew appears to be already installed in this directory."
        Write-Host ""
        $response = Read-Host "Do you want to overwrite/update the existing installation? (y/N)"
        if ($response -notmatch '^[Yy]$') {
            Write-Info "Installation cancelled."
            exit 0
        }
        Write-Info "Proceeding with update..."
    }
    
    # Check if .devcrew-workspace exists
    if (Test-Path $workspacePath) {
        Write-Warning ".devcrew-workspace directory already exists."
        Write-Host ""
        $response = Read-Host "Do you want to overwrite it? This will NOT affect your projects/ directory. (y/N)"
        if ($response -notmatch '^[Yy]$') {
            Write-Info "Installation cancelled."
            exit 0
        }
    }
}

# Download DevCrew
function Download-DevCrew {
    Write-Info "Downloading DevCrew..."
    
    $zipPath = Join-Path $TempDir "devcrew.zip"
    
    try {
        Invoke-WebRequest -Uri $RepoUrl -OutFile $zipPath -UseBasicParsing
        Write-Success "Download completed."
    }
    catch {
        Write-Error "Failed to download DevCrew. Please check your internet connection."
        exit 1
    }
    
    return $zipPath
}

# Extract and install
function Install-DevCrew($zipPath) {
    Write-Info "Extracting files..."
    
    Expand-Archive -Path $zipPath -DestinationPath $TempDir -Force
    
    $extractedDir = Get-ChildItem -Path $TempDir -Directory | Where-Object { $_.Name -like "devcrew*" } | Select-Object -First 1
    
    if (-not $extractedDir) {
        Write-Error "Could not find extracted DevCrew directory."
        exit 1
    }
    
    Write-Info "Installing DevCrew to $TargetDir..."
    
    # Create target directory if it doesn't exist
    if (-not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }
    
    # Copy .qoder directory
    $qoderSource = Join-Path $extractedDir.FullName ".qoder"
    if (Test-Path $qoderSource) {
        $qoderTarget = Join-Path $TargetDir ".qoder"
        if (Test-Path $qoderTarget) {
            Remove-Item -Recurse -Force $qoderTarget
        }
        Copy-Item -Recurse -Path $qoderSource -Destination $qoderTarget
        Write-Success "Installed .qoder/ directory."
    }
    
    # Copy .devcrew-workspace directory
    $workspaceSource = Join-Path $extractedDir.FullName ".devcrew-workspace"
    if (Test-Path $workspaceSource) {
        $workspaceTarget = Join-Path $TargetDir ".devcrew-workspace"
        
        # Backup existing projects if they exist
        $projectsPath = Join-Path $workspaceTarget "projects"
        $backupPath = Join-Path $TempDir "projects_backup"
        if (Test-Path $projectsPath) {
            Write-Info "Backing up existing projects..."
            Move-Item -Path $projectsPath -Destination $backupPath
        }
        
        if (Test-Path $workspaceTarget) {
            Remove-Item -Recurse -Force $workspaceTarget
        }
        Copy-Item -Recurse -Path $workspaceSource -Destination $workspaceTarget
        
        # Restore projects backup if exists
        if (Test-Path $backupPath) {
            Move-Item -Path $backupPath -Destination $projectsPath
            Write-Success "Restored existing projects."
        }
        
        Write-Success "Installed .devcrew-workspace/ directory."
    }
    
    # Copy README files
    Get-ChildItem -Path $extractedDir.FullName -Filter "README*.md" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $TargetDir
    }
}

# Verify installation
function Verify-Installation {
    Write-Info "Verifying installation..."
    
    $errors = 0
    
    $qoderPath = Join-Path $TargetDir ".qoder"
    $workspacePath = Join-Path $TargetDir ".devcrew-workspace"
    
    if (-not (Test-Path $qoderPath)) {
        Write-Error ".qoder/ directory not found after installation."
        $errors++
    }
    
    if (-not (Test-Path $workspacePath)) {
        Write-Error ".devcrew-workspace/ directory not found after installation."
        $errors++
    }
    
    if ($errors -eq 0) {
        Write-Success "Installation verified successfully!"
        return $true
    }
    else {
        return $false
    }
}

# Print next steps
function Print-NextSteps {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Success "DevCrew has been successfully installed!"
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host ""
    Write-Host "  1. Open your project in Qoder IDE"
    Write-Host "  2. Run the initialization Skill:"
    Write-Host "     'Run devcrew-project-init Skill to initialize the project'"
    Write-Host ""
    Write-Host "  3. Start using DevCrew with your first requirement!"
    Write-Host ""
    Write-Host "Documentation:"
    Write-Host "  - Agent Knowledge Map: .devcrew-workspace/docs/agent-knowledge-map.md"
    Write-Host "  - Project Introduction: README.md"
    Write-Host ""
    Write-Host "To uninstall:"
    Write-Host "  Remove-Item -Recurse -Force .qoder, .devcrew-workspace"
    Write-Host ""
}

# Main function
function Main {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  DevCrew Installer for Qoder" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check OS
    $os = [System.Environment]::OSVersion.Platform
    Write-Info "Detected: Windows"
    
    # Create temp directory
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    
    try {
        Check-QoderCompatibility
        $zipPath = Download-DevCrew
        Install-DevCrew $zipPath
        
        if (Verify-Installation) {
            Print-NextSteps
        }
        else {
            Write-Error "Installation verification failed."
            exit 1
        }
    }
    finally {
        Cleanup
    }
}

# Run main function
Main
