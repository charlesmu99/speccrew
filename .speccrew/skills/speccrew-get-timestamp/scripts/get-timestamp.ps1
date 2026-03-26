# Get current timestamp in specified format
param(
    [string]$Format = "YYYY-MM-DD-HHmmss"
)

switch ($Format) {
    "YYYY-MM-DD-HHmmss" { Get-Date -Format "yyyy-MM-dd-HHmmss" }
    "YYYY-MM-DD" { Get-Date -Format "yyyy-MM-dd" }
    "HHmm" { Get-Date -Format "HHmm" }
    "ISO" { Get-Date -Format "o" }
    default { Get-Date -Format "yyyy-MM-dd-HHmmss" }
}
