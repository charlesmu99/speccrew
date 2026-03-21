# SpecCrew Uninstaller Script for Windows
#
# Uninstall from GitHub:
#   Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/uninstall.ps1").Content
#
# Uninstall from Gitee (China):
#   Invoke-Expression (Invoke-WebRequest -Uri "https://gitee.com/amutek/SpecCrew/raw/main/uninstall.ps1").Content

param(
    [string]$TargetDir = "."
)

$ErrorActionPreference = "Stop"

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
    Write-Host "  SpecCrew Uninstaller" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Check if SpecCrew is installed
    $SpecCrewFound = $false
    $agentsPath = Join-Path $TargetDir ".qoder\agents"
    $skillsPath = Join-Path $TargetDir ".qoder\skills"
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
    
    Write-Warning "This will remove all SpecCrew-related files while preserving your custom agents and skills."
    $response = Read-Host "Do you want to proceed with uninstallation? (y/N)"
    if ($response -notmatch '^[Yy]$') {
        Write-Info "Uninstallation cancelled."
        return
    }
    
    Write-Info "Uninstalling SpecCrew..."
    
    # Remove SpecCrew-prefixed agents
    if (Test-Path $agentsPath) {
        $SpecCrewAgents = Get-ChildItem -Path $agentsPath -Filter "SpecCrew-*.md" -ErrorAction SilentlyContinue
        foreach ($agent in $SpecCrewAgents) {
            Remove-Item -Path $agent.FullName -Force
            Write-Info "Removed agent: $($agent.Name)"
        }
    }
    
    # Remove SpecCrew-prefixed skills
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
    Write-Success "SpecCrew has been successfully uninstalled!"
    Write-Host ""
    Write-Host "Note: Your custom agents and skills in .qoder/ have been preserved." -ForegroundColor Cyan
    Write-Host "To completely remove all Qoder configurations, manually delete the .qoder/ directory." -ForegroundColor Cyan
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
