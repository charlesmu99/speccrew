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
    [string]$AnalysisMethod = "ui-based"
)

# Resolve paths
$sourcePath = Resolve-Path $SourcePath

# Determine sync-state directory (relative to project root)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillDir = Split-Path -Parent $scriptDir
$projectRoot = Split-Path -Parent $skillDir
$syncStateDir = Join-Path $projectRoot "speccrew-workspace/knowledges/base/sync-state"

# Build full output path
$outputPath = Join-Path $syncStateDir $OutputFileName

Write-Host "Scanning: $sourcePath"
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

# Find all files recursively matching the extensions
$files = Get-ChildItem -Path $sourcePath -Recurse -Include $wildcardPatterns | 
    Select-Object FullName, 
                  @{N='RelativePath';E={$_.FullName.Replace($sourcePath, '').TrimStart('\', '/')}},
                  @{N='FileName';E={$_.BaseName}},
                  @{N='Extension';E={$_.Extension}},
                  @{N='Directory';E={$_.DirectoryName.Replace($sourcePath, '').TrimStart('\', '/')}}

Write-Host "Found $($files.Count) page files"

# Build hierarchical structure with multi-platform support
$modules = @()

# Group by directory (module/sub-module)
$grouped = $files | Group-Object Directory

foreach ($group in $grouped) {
    $dirParts = $group.Name -split '[\\/]' | Where-Object { $_ }
    
    $entryPoints = @()
    foreach ($file in $group.Group) {
        $entryPoint = @{
            fileName = $file.FileName
            fullPath = $file.FullName
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
        modulePath = $group.Name
        relativePath = $group.Name.Replace($sourcePath, '').TrimStart('\', '/')
        entryPoints = $entryPoints
    }
    
    $modules += $moduleObj
}

$platform = @{
    platformName = $PlatformName
    platformType = $PlatformType
    sourcePath = $sourcePath.Path
    techStack = $techStackArray
    totalFiles = $files.Count
    analyzedCount = 0
    pendingCount = $files.Count
    modules = $modules
}

# Add platformSubtype if provided
if (-not [string]::IsNullOrWhiteSpace($PlatformSubtype)) {
    $platform.platformSubtype = $PlatformSubtype
}

$inventory = @{
    generatedAt = (Get-Date -Format "yyyy-MM-dd-HHmmss")
    analysisMethod = $AnalysisMethod
    platformCount = 1
    platforms = @($platform)
}



# Ensure sync-state directory exists
if (-not (Test-Path $syncStateDir)) {
    New-Item -ItemType Directory -Path $syncStateDir -Force | Out-Null
}

# Write JSON output
$inventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host "Generated modules.json with $($files.Count) entry points"
Write-Host "Ready for analysis: $outputPath"
