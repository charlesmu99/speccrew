# DevCrew Uninstaller Script for Windows
#
# Uninstall from GitHub:
#   Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/charlesmu99/devcrew/main/uninstall.ps1").Content
#
# Uninstall from Gitee (China):
#   Invoke-Expression (Invoke-WebRequest -Uri "https://gitee.com/amutek/devcrew/raw/main/uninstall.ps1").Content

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
function Uninstall-DevCrew {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  DevCrew Uninstaller" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Check if DevCrew is installed
    $devcrewFound = $false
    $agentsPath = Join-Path $TargetDir ".qoder\agents"
    $skillsPath = Join-Path $TargetDir ".qoder\skills"
    $workspacePath = Join-Path $TargetDir "devcrew-workspace"
    
    if (Test-Path $workspacePath) {
        $devcrewFound = $true
    }
    
    if (Test-Path $agentsPath) {
        $devcrewAgents = Get-ChildItem -Path $agentsPath -Filter "devcrew-*.md" -ErrorAction SilentlyContinue
        if ($devcrewAgents) {
            $devcrewFound = $true
        }
    }
    
    if (Test-Path $skillsPath) {
        $devcrewSkills = Get-ChildItem -Path $skillsPath -Directory -Filter "devcrew-*" -ErrorAction SilentlyContinue
        if ($devcrewSkills) {
            $devcrewFound = $true
        }
    }
    
    if (-not $devcrewFound) {
        Write-Warning "DevCrew does not appear to be installed in this directory."
        Write-Host ""
        Write-Info "Nothing to uninstall."
        return
    }
    
    Write-Warning "This will remove all DevCrew-related files while preserving your custom agents and skills."
    $response = Read-Host "Do you want to proceed with uninstallation? (y/N)"
    if ($response -notmatch '^[Yy]$') {
        Write-Info "Uninstallation cancelled."
        return
    }
    
    Write-Info "Uninstalling DevCrew..."
    
    # Remove devcrew-prefixed agents
    if (Test-Path $agentsPath) {
        $devcrewAgents = Get-ChildItem -Path $agentsPath -Filter "devcrew-*.md" -ErrorAction SilentlyContinue
        foreach ($agent in $devcrewAgents) {
            Remove-Item -Path $agent.FullName -Force
            Write-Info "Removed agent: $($agent.Name)"
        }
    }
    
    # Remove devcrew-prefixed skills
    if (Test-Path $skillsPath) {
        $devcrewSkills = Get-ChildItem -Path $skillsPath -Directory -Filter "devcrew-*" -ErrorAction SilentlyContinue
        foreach ($skill in $devcrewSkills) {
            Remove-Item -Recurse -Force $skill.FullName
            Write-Info "Removed skill: $($skill.Name)"
        }
    }
    
    # Remove devcrew-workspace directory
    if (Test-Path $workspacePath) {
        Remove-Item -Recurse -Force $workspacePath
        Write-Info "Removed directory: devcrew-workspace/"
    }
    
    Write-Host ""
    Write-Success "DevCrew has been successfully uninstalled!"
    Write-Host ""
    Write-Host "Note: Your custom agents and skills in .qoder/ have been preserved." -ForegroundColor Cyan
    Write-Host "To completely remove all Qoder configurations, manually delete the .qoder/ directory." -ForegroundColor Cyan
}

# Main function
function Main {
    Uninstall-DevCrew
    
    # Pause to keep window open
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Run main function
Main
