#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Generate modules.json for UI module analysis
.DESCRIPTION
    Scans source directory for page files and generates an inventory with analysis status tracking.
    All configuration is passed via parameters - the script does not infer anything.
.PARAMETER SourcePath
    Root directory containing source files (e.g., src/views, lib/pages)
.PARAMETER OutputFileName
    Output file name (e.g., "modules-web.json"). File will be saved to sync-state directory.
.PARAMETER PlatformName
    Platform name (e.g., "Web Frontend", "Mobile App", "Backend API")
.PARAMETER PlatformType
    Platform type (e.g., "web", "mobile", "backend")
.PARAMETER PlatformSubtype
    Platform subtype (e.g., "vue", "react", "flutter", "nestjs") - optional
.PARAMETER TechStack
    Technology stack array as JSON string (e.g., '["vue","typescript"]')
.PARAMETER FileExtensions
    File extensions to scan as JSON array (e.g., '[".vue",".ts"]')
.PARAMETER AnalysisMethod
    Analysis method: "ui-based" or "api-based" (default: "ui-based")
.EXAMPLE
    .\generate-inventory.ps1 `
        -SourcePath "src/views" `
        -OutputPath "modules.json" `
        -PlatformName "Web Frontend" `
        -PlatformType "web" `
        -PlatformSubtype "vue" `
        -TechStack '["vue","typescript"]' `
        -FileExtensions '[".vue",".ts"]'
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SourcePath,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputFileName,
    
    [Parameter(Mandatory=$true)]
    [string]$PlatformName,
    
    [Parameter(Mandatory=$true)]
    [string]$PlatformType,
    
    [Parameter(Mandatory=$false)]
    [string]$PlatformSubtype = "",
    
    [Parameter(Mandatory=$true)]
    [string]$TechStack,
    
    [Parameter(Mandatory=$true)]
    [string]$FileExtensions,
    
    [Parameter(Mandatory=$false)]
    [string]$AnalysisMethod = "ui-based",
    
    [Parameter(Mandatory=$false)]
    [string]$ExcludeDirs = '["components","composables","hooks","utils"]'
)

# Resolve paths
$resolvedSourcePath = Resolve-Path $SourcePath
$sourcePathValue = Normalize-Path $resolvedSourcePath.Path

# Determine sync-state directory
# Search upward from source path to find project root (contains speccrew-workspace)
$currentDir = $resolvedSourcePath.Path
$syncStateDir = $null

while ($currentDir -ne $null -and $currentDir -ne "" -and $currentDir -ne (Split-Path $currentDir -Parent)) {
    $potentialSyncState = Join-Path $currentDir "speccrew-workspace/knowledges/base/sync-state"
    if (Test-Path (Join-Path $currentDir "speccrew-workspace")) {
        $syncStateDir = $potentialSyncState
        break
    }
    $currentDir = Split-Path $currentDir -Parent
}

# Fallback: use source path's drive root if not found
if (-not $syncStateDir) {
    $syncStateDir = Join-Path (Split-Path $resolvedSourcePath.Path -Qualifier) "speccrew-workspace/knowledges/base/sync-state"
}

# Build full output path
$outputPath = Join-Path $syncStateDir $OutputFileName

Write-Host "Scanning: $sourcePathValue"
Write-Host "Output: $outputPath"
Write-Host "Platform: $PlatformName ($PlatformType)"
Write-Host "TechStack: $TechStack"
Write-Host "Extensions: $FileExtensions"

# Parse JSON parameters
$techStackArray = $TechStack | ConvertFrom-Json
$extensionsArray = $FileExtensions | ConvertFrom-Json

# Convert extensions to wildcard patterns (e.g., ".vue" -> "*.vue")
$wildcardPatterns = $extensionsArray | ForEach-Object { "*$_" }

Write-Host "Scanning for files: $($wildcardPatterns -join ', ')"

# Helper function to normalize path separators
function Normalize-Path {
    param([string]$path)
    return $path.Replace('\', '/')
}

# Parse ExcludeDirs parameter
$excludeDirsArray = $ExcludeDirs | ConvertFrom-Json

# Helper function to get module path (stops at excluded subdirectories)
function Get-ModulePath {
    param([string]$relativeDir)
    $parts = $relativeDir -split '[\\/]' | Where-Object { $_ }
    $moduleParts = @()
    foreach ($part in $parts) {
        # Stop at excluded directories - these belong to parent module
        if ($excludeDirsArray -contains $part) {
            break
        }
        $moduleParts += $part
    }
    return $moduleParts -join '/'
}

# Find all files recursively matching the extensions
$files = Get-ChildItem -Path $resolvedSourcePath -Recurse -Include $wildcardPatterns | 
    Select-Object FullName, 
                  @{N='RelativePath';E={Normalize-Path ($_.FullName.Replace($resolvedSourcePath.Path, '').TrimStart('\', '/'))}},
                  @{N='FileName';E={$_.BaseName}},
                  @{N='Extension';E={$_.Extension}},
                  @{N='Directory';E={Normalize-Path ($_.DirectoryName.Replace($resolvedSourcePath.Path, '').TrimStart('\', '/'))}}

Write-Host "Found $($files.Count) page files"

# Build hierarchical structure with multi-platform support
$modules = @()

# Group files by their module path (not by direct directory)
$grouped = $files | Group-Object { Get-ModulePath $_.Directory }

foreach ($group in $grouped) {
    $modulePath = $group.Name
    
    $entryPoints = @()
    foreach ($file in $group.Group) {
        $entryPoint = @{
            fileName = $file.FileName
            fullPath = Normalize-Path $file.FullName
            relativePath = $file.RelativePath
            extension = $file.Extension
            analyzed = $false
            startedAt = $null
            completedAt = $null
            analysisNotes = $null
        }
        $entryPoints += $entryPoint
    }
    
    $moduleObj = @{
        modulePath = $modulePath
        relativePath = $modulePath
        entryPoints = $entryPoints
    }
    
    $modules += $moduleObj
}

$inventory = @{
    platformName = $PlatformName
    platformType = $PlatformType
    sourcePath = $sourcePathValue
    techStack = $techStackArray
    totalFiles = $files.Count
    analyzedCount = 0
    pendingCount = $files.Count
    generatedAt = (Get-Date -Format "yyyy-MM-dd-HHmmss")
    analysisMethod = $AnalysisMethod
    modules = $modules
}

# Add platformSubtype if provided
if (-not [string]::IsNullOrWhiteSpace($PlatformSubtype)) {
    $inventory.platformSubtype = $PlatformSubtype
}

# Ensure sync-state directory exists
if (-not (Test-Path $syncStateDir)) {
    New-Item -ItemType Directory -Path $syncStateDir -Force | Out-Null
}

# Write JSON output
$inventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host "Generated modules.json with $($files.Count) entry points"
Write-Host "Ready for analysis: $outputPath"
