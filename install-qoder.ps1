# SpecCrew Installer for Qoder (Windows)
#
# Install from GitHub:
#   Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/install-qoder.ps1").Content
#
# Install from Gitee (China):
#   Invoke-Expression (Invoke-WebRequest -Uri "https://gitee.com/amutek/SpecCrew/raw/main/install-qoder.ps1").Content
#
# Uninstall:
#   .\install-qoder.ps1 -Uninstall

param(
    [string]$TargetDir = ".",
    [string]$Mirror = "github",
    [switch]$Uninstall = $false
)

$ErrorActionPreference = "Stop"

# Configuration - Select mirror
if ($Mirror -eq "gitee") {
    $RepoUrl = "https://gitee.com/amutek/SpecCrew/archive/main.zip"
} else {
    $RepoUrl = "https://github.com/charlesmu99/SpecCrew/archive/refs/heads/main.zip"
}

$TempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()

# IDE-specific configuration
$IDEName = "Qoder"
$IDEConfigDir = ".qoder"
$SourceDir = ".speccrew"

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

# Uninstall SpecCrew from Qoder
function Uninstall-SpecCrew {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  SpecCrew Uninstaller for $IDEName" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Warning "This will remove all SpecCrew-related files from $IDEName while preserving your custom agents and skills."
    $response = Read-Host "Do you want to proceed with uninstallation? (y/N)"
    if ($response -notmatch '^[Yy]$') {
        Write-Info "Uninstallation cancelled."
        return
    }
    
    Write-Info "Uninstalling SpecCrew from $IDEName..."
    
    # Remove SpecCrew-prefixed agents from IDE config dir
    $agentsPath = Join-Path $TargetDir "$IDEConfigDir\agents"
    if (Test-Path $agentsPath) {
        $SpecCrewAgents = Get-ChildItem -Path $agentsPath -Filter "SpecCrew-*.md" -ErrorAction SilentlyContinue
        foreach ($agent in $SpecCrewAgents) {
            Remove-Item -Path $agent.FullName -Force
            Write-Info "Removed agent: $($agent.Name)"
        }
    }
    
    # Remove SpecCrew-prefixed skills from IDE config dir
    $skillsPath = Join-Path $TargetDir "$IDEConfigDir\skills"
    if (Test-Path $skillsPath) {
        $SpecCrewSkills = Get-ChildItem -Path $skillsPath -Directory -Filter "SpecCrew-*" -ErrorAction SilentlyContinue
        foreach ($skill in $SpecCrewSkills) {
            Remove-Item -Recurse -Force $skill.FullName
            Write-Info "Removed skill: $($skill.Name)"
        }
    }
    
    # Remove SpecCrew-workspace directory
    $workspacePath = Join-Path $TargetDir "SpecCrew-workspace"
    if (Test-Path $workspacePath) {
        Remove-Item -Recurse -Force $workspacePath
        Write-Info "Removed directory: SpecCrew-workspace/"
    }
    
    # Note: We don't remove .speccrew/ as it may be a git submodule or user-managed
    
    Write-Host ""
    Write-Success "SpecCrew has been successfully uninstalled from $IDEName!"
    Write-Host ""
    Write-Host "Note: Your custom agents and skills in $IDEConfigDir/ have been preserved." -ForegroundColor Cyan
    Write-Host "Note: Source files in $SourceDir/ have been preserved (may be under version control)." -ForegroundColor Cyan
}

# Check if SpecCrew is already installed
function Check-ExistingInstallation {
    Write-Info "Checking existing installation..."
    
    $SpecCrewInstalled = $false
    $agentsPath = Join-Path $TargetDir "$IDEConfigDir\agents"
    $skillsPath = Join-Path $TargetDir "$IDEConfigDir\skills"
    $workspacePath = Join-Path $TargetDir "SpecCrew-workspace"
    
    # Check for SpecCrew-prefixed agents in IDE config
    if (Test-Path $agentsPath) {
        $SpecCrewAgents = Get-ChildItem -Path $agentsPath -Filter "SpecCrew-*.md" -ErrorAction SilentlyContinue
        if ($SpecCrewAgents) {
            $SpecCrewInstalled = $true
        }
    }
    
    # Check for SpecCrew-prefixed skills in IDE config
    if (Test-Path $skillsPath) {
        $SpecCrewSkills = Get-ChildItem -Path $skillsPath -Directory -Filter "SpecCrew-*" -ErrorAction SilentlyContinue
        if ($SpecCrewSkills) {
            $SpecCrewInstalled = $true
        }
    }
    
    # Check for SpecCrew-workspace
    if (Test-Path $workspacePath) {
        $SpecCrewInstalled = $true
    }
    
    if ($SpecCrewInstalled) {
        Write-Warning "SpecCrew appears to be already installed in this directory."
        Write-Host ""
        $response = Read-Host "Do you want to update the existing installation? (y/N)"
        if ($response -notmatch '^[Yy]$') {
            Write-Info "Installation cancelled."
            exit 0
        }
        Write-Info "Proceeding with update..."
    }
}

# Download SpecCrew
function Download-SpecCrew {
    Write-Info "Downloading SpecCrew..."
    
    $zipPath = Join-Path $TempDir "SpecCrew.zip"
    
    try {
        Invoke-WebRequest -Uri $RepoUrl -OutFile $zipPath -UseBasicParsing
        Write-Success "Download completed."
    }
    catch {
        Write-Error "Failed to download SpecCrew. Please check your internet connection."
        exit 1
    }
    
    return $zipPath
}

# Extract and install
function Install-SpecCrew($zipPath) {
    Write-Info "Extracting files..."
    
    Expand-Archive -Path $zipPath -DestinationPath $TempDir -Force
    
    $extractedDir = Get-ChildItem -Path $TempDir -Directory | Where-Object { $_.Name -like "SpecCrew*" } | Select-Object -First 1
    
    if (-not $extractedDir) {
        Write-Error "Could not find extracted SpecCrew directory."
        exit 1
    }
    
    Write-Info "Installing SpecCrew to $TargetDir..."
    
    # Create target directory if it doesn't exist
    if (-not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }
    
    # Install to .speccrew/ (source directory)
    $sourceTarget = Join-Path $TargetDir $SourceDir
    $sourceSource = Join-Path $extractedDir.FullName $SourceDir
    
    if (Test-Path $sourceSource) {
        if (-not (Test-Path $sourceTarget)) {
            New-Item -ItemType Directory -Path $sourceTarget -Force | Out-Null
        }
        
        # Copy agents to .speccrew/
        $agentsSource = Join-Path $sourceSource "agents"
        if (Test-Path $agentsSource) {
            $agentsTarget = Join-Path $sourceTarget "agents"
            New-Item -ItemType Directory -Path $agentsTarget -Force | Out-Null
            Get-ChildItem -Path $agentsSource -Filter "*.md" | ForEach-Object {
                $agentTarget = Join-Path $agentsTarget $_.Name
                Copy-Item -Path $_.FullName -Destination $agentTarget -Force
                Write-Info "Installed agent: $($_.Name)"
            }
        }
        
        # Copy skills to .speccrew/
        $skillsSource = Join-Path $sourceSource "skills"
        if (Test-Path $skillsSource) {
            $skillsTarget = Join-Path $sourceTarget "skills"
            New-Item -ItemType Directory -Path $skillsTarget -Force | Out-Null
            Get-ChildItem -Path $skillsSource -Directory | ForEach-Object {
                $skillTarget = Join-Path $skillsTarget $_.Name
                if (Test-Path $skillTarget) {
                    Remove-Item -Recurse -Force $skillTarget
                }
                Copy-Item -Recurse -Path $_.FullName -Destination $skillTarget
                Write-Info "Installed skill: $($_.Name)"
            }
        }
        
        Write-Success "Updated $SourceDir/ directory."
    }
    
    # Copy from .speccrew/ to IDE config directory (.qoder/)
    $idePath = Join-Path $TargetDir $IDEConfigDir
    if (-not (Test-Path $idePath)) {
        New-Item -ItemType Directory -Path $idePath -Force | Out-Null
    }
    
    # Copy agents to IDE config (incremental update)
    $sourceAgents = Join-Path $sourceTarget "agents"
    $ideAgents = Join-Path $idePath "agents"
    if (Test-Path $sourceAgents) {
        New-Item -ItemType Directory -Path $ideAgents -Force | Out-Null
        Get-ChildItem -Path $sourceAgents -Filter "*.md" | ForEach-Object {
            $agentTarget = Join-Path $ideAgents $_.Name
            $isSpecCrew = $_.Name -match '^SpecCrew-'
            $exists = Test-Path $agentTarget
            if ($isSpecCrew -or -not $exists) {
                Copy-Item -Path $_.FullName -Destination $agentTarget -Force
                if ($exists) {
                    Write-Info "Updated IDE agent: $($_.Name)"
                } else {
                    Write-Info "Added IDE agent: $($_.Name)"
                }
            }
        }
    }
    
    # Copy skills to IDE config (incremental update)
    $sourceSkills = Join-Path $sourceTarget "skills"
    $ideSkills = Join-Path $idePath "skills"
    if (Test-Path $sourceSkills) {
        New-Item -ItemType Directory -Path $ideSkills -Force | Out-Null
        Get-ChildItem -Path $sourceSkills -Directory | ForEach-Object {
            $skillTarget = Join-Path $ideSkills $_.Name
            $isSpecCrew = $_.Name -match '^SpecCrew-'
            $exists = Test-Path $skillTarget
            if ($isSpecCrew -or -not $exists) {
                if ($exists) {
                    Remove-Item -Recurse -Force $skillTarget
                    Write-Info "Updated IDE skill: $($_.Name)"
                } else {
                    Write-Info "Added IDE skill: $($_.Name)"
                }
                Copy-Item -Recurse -Path $_.FullName -Destination $skillTarget
            }
        }
    }
    
    Write-Success "Updated $IDEConfigDir/ directory for $IDEName."
    
    # Copy SpecCrew-workspace directory
    $workspaceSource = Join-Path $extractedDir.FullName "SpecCrew-workspace"
    $workspaceTarget = Join-Path $TargetDir "SpecCrew-workspace"
    New-Item -ItemType Directory -Path $workspaceTarget -Force | Out-Null
    
    if (Test-Path $workspaceSource) {
        # Copy docs from archive
        $docsSource = Join-Path $workspaceSource "docs"
        if (Test-Path $docsSource) {
            $docsTarget = Join-Path $workspaceTarget "docs"
            New-Item -ItemType Directory -Path $docsTarget -Force | Out-Null
            Get-ChildItem -Path $docsSource -Filter "*.md" | ForEach-Object {
                $docTarget = Join-Path $docsTarget $_.Name
                $exists = Test-Path $docTarget
                Copy-Item -Path $_.FullName -Destination $docTarget -Force
                if ($exists) {
                    Write-Info "Updated doc: $($_.Name)"
                } else {
                    Write-Info "Added new doc: $($_.Name)"
                }
            }
            
            # Copy rules subdirectory
            $rulesSource = Join-Path $docsSource "rules"
            if (Test-Path $rulesSource) {
                $rulesTarget = Join-Path $docsTarget "rules"
                New-Item -ItemType Directory -Path $rulesTarget -Force | Out-Null
                Get-ChildItem -Path $rulesSource -Filter "*.md" | ForEach-Object {
                    $ruleTarget = Join-Path $rulesTarget $_.Name
                    $exists = Test-Path $ruleTarget
                    Copy-Item -Path $_.FullName -Destination $ruleTarget -Force
                    if ($exists) {
                        Write-Info "Updated rule: $($_.Name)"
                    } else {
                        Write-Info "Added new rule: $($_.Name)"
                    }
                }
            }
        }
        
        Write-Success "Updated SpecCrew-workspace/ directory."
    }
    
    # Create knowledge and projects directories if not exist
    $knowledgePath = Join-Path $workspaceTarget "knowledge"
    $projectsPath = Join-Path $workspaceTarget "projects"
    New-Item -ItemType Directory -Path $knowledgePath -Force | Out-Null
    New-Item -ItemType Directory -Path $projectsPath -Force | Out-Null
    
    # Copy README and LICENSE files to SpecCrew-workspace/docs
    $docsTarget = Join-Path $workspaceTarget "docs"
    Get-ChildItem -Path $extractedDir.FullName -Filter "README*.md" | ForEach-Object {
        $docTargetPath = Join-Path $docsTarget $_.Name
        $exists = Test-Path $docTargetPath
        Copy-Item -Path $_.FullName -Destination $docTargetPath -Force
        if ($exists) {
            Write-Info "Updated doc: $($_.Name)"
        } else {
            Write-Info "Added doc: $($_.Name)"
        }
    }
    
    $licenseSource = Join-Path $extractedDir.FullName "LICENSE"
    $licenseTarget = Join-Path $docsTarget "LICENSE"
    if (Test-Path $licenseSource) {
        $exists = Test-Path $licenseTarget
        Copy-Item -Path $licenseSource -Destination $licenseTarget -Force
        if ($exists) {
            Write-Info "Updated doc: LICENSE"
        } else {
            Write-Info "Added doc: LICENSE"
        }
    }
}

# Verify installation
function Verify-Installation {
    Write-Info "Verifying installation..."
    
    $errors = 0
    
    $sourcePath = Join-Path $TargetDir $SourceDir
    $idePath = Join-Path $TargetDir $IDEConfigDir
    $workspacePath = Join-Path $TargetDir "SpecCrew-workspace"
    
    if (-not (Test-Path $sourcePath)) {
        Write-Error "$SourceDir/ directory not found after installation."
        $errors++
    }
    
    if (-not (Test-Path $idePath)) {
        Write-Error "$IDEConfigDir/ directory not found after installation."
        $errors++
    }
    
    if (-not (Test-Path $workspacePath)) {
        Write-Error "SpecCrew-workspace/ directory not found after installation."
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
    Write-Success "SpecCrew has been successfully installed for $IDEName!"
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Directory structure:"
    Write-Host "  - $SourceDir/          : Source files (can be version controlled)"
    Write-Host "  - $IDEConfigDir/       : $IDEName IDE configuration"
    Write-Host "  - SpecCrew-workspace/  : Working directory"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host ""
    Write-Host "  1. Open your project in $IDEName IDE"
    Write-Host ""
    Write-Host "  2. Start a new chat dialog and invoke the Leader Agent:"
    Write-Host "     - Type: /SpecCrew-leader"
    Write-Host "     - Then type: 'Analyze this project' or similar request"
    Write-Host ""
    Write-Host "  3. The Leader Agent will guide you through:"
    Write-Host "     - Project diagnosis and tech stack analysis"
    Write-Host "     - AI engineering infrastructure setup"
    Write-Host "     - Knowledge base initialization"
    Write-Host ""
    Write-Host "Documentation:"
    Write-Host "  - Agent Knowledge Map: SpecCrew-workspace/docs/agent-knowledge-map.md"
    Write-Host "  - Project Introduction: $SourceDir/README.md"
    Write-Host ""
    Write-Host "To uninstall:"
    Write-Host "  Run: .\install-qoder.ps1 -Uninstall"
    Write-Host ""
}

# Main function
function Main {
    # Check if uninstall mode
    if ($Uninstall) {
        Uninstall-SpecCrew
        
        # Pause to keep window open
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  SpecCrew Installer for $IDEName" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check OS
    Write-Info "Detected: Windows"
    
    # Create temp directory
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    
    $success = $false
    try {
        Check-ExistingInstallation
        $zipPath = Download-SpecCrew
        Install-SpecCrew $zipPath
        
        if (Verify-Installation) {
            Print-NextSteps
            $success = $true
        }
        else {
            Write-Error "Installation verification failed."
        }
    }
    catch {
        Write-Error "An error occurred during installation: $_"
    }
    finally {
        Cleanup
    }
    
    # Pause to keep window open
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    if (-not $success) {
        exit 1
    }
}

# Run main function
Main
