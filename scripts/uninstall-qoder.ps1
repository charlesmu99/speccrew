# SpecCrew Uninstaller for Qoder (Windows)
#
# Uninstall from GitHub:
#   Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/scripts/uninstall-qoder.ps1").Content
#
# Uninstall from Gitee (China):
#   Invoke-Expression (Invoke-WebRequest -Uri "https://gitee.com/amutek/speccrew/raw/main/scripts/uninstall-qoder.ps1").Content

param(
    [string]$TargetDir = "."
)

$ErrorActionPreference = "Stop"

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

# Main uninstall function
function Uninstall-SpecCrew {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  SpecCrew Uninstaller for $IDEName" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Check if SpecCrew is installed
    $SpecCrewFound = $false
    $agentsPath = Join-Path $TargetDir "$IDEConfigDir\agents"
    $skillsPath = Join-Path $TargetDir "$IDEConfigDir\skills"
    $workspacePath = Join-Path $TargetDir "SpecCrew-workspace"
    
    if (Test-Path $workspacePath) {
        $SpecCrewFound = $true
    }
    
    if (Test-Path $agentsPath) {
        $SpecCrewAgents = Get-ChildItem -Path $agentsPath -Filter "SpecCrew-*.md" -ErrorAction SilentlyContinue
        if ($SpecCrewAgents) {
            $SpecCrewFound = $true
        }
    }
    
    if (Test-Path $skillsPath) {
        $SpecCrewSkills = Get-ChildItem -Path $skillsPath -Directory -Filter "SpecCrew-*" -ErrorAction SilentlyContinue
        if ($SpecCrewSkills) {
            $SpecCrewFound = $true
        }
    }
    
    if (-not $SpecCrewFound) {
        Write-Warning "SpecCrew does not appear to be installed in this directory."
        Write-Host ""
        Write-Info "Nothing to uninstall."
        return
    }
    
    Write-Warning "This will remove all SpecCrew-related files from $IDEName while preserving your custom agents and skills."
    $response = Read-Host "Do you want to proceed with uninstallation? (y/N)"
    if ($response -notmatch '^[Yy]$') {
        Write-Info "Uninstallation cancelled."
        return
    }
    
    Write-Info "Uninstalling SpecCrew from $IDEName..."
    
    # Remove SpecCrew-prefixed agents from IDE config
    if (Test-Path $agentsPath) {
        $SpecCrewAgents = Get-ChildItem -Path $agentsPath -Filter "SpecCrew-*.md" -ErrorAction SilentlyContinue
        foreach ($agent in $SpecCrewAgents) {
            Remove-Item -Path $agent.FullName -Force
            Write-Info "Removed agent: $($agent.Name)"
        }
    }
    
    # Remove SpecCrew-prefixed skills from IDE config
    if (Test-Path $skillsPath) {
        $SpecCrewSkills = Get-ChildItem -Path $skillsPath -Directory -Filter "SpecCrew-*" -ErrorAction SilentlyContinue
        foreach ($skill in $SpecCrewSkills) {
            Remove-Item -Recurse -Force $skill.FullName
            Write-Info "Removed skill: $($skill.Name)"
        }
    }
    
    # Remove SpecCrew-workspace directory
    if (Test-Path $workspacePath) {
        Remove-Item -Recurse -Force $workspacePath
        Write-Info "Removed directory: SpecCrew-workspace/"
    }
    
    Write-Host ""
    Write-Success "SpecCrew has been successfully uninstalled from $IDEName!"
    Write-Host ""
    Write-Host "Note: Your custom agents and skills in $IDEConfigDir/ have been preserved." -ForegroundColor Cyan
    Write-Host "Note: Source files in $SourceDir/ have been preserved (may be under version control)." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To completely remove $IDEName configurations, manually delete the $IDEConfigDir/ directory." -ForegroundColor Cyan
}

# Main function
function Main {
    Uninstall-SpecCrew
    
    # Pause to keep window open
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Run main function
Main
