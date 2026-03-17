# Get current timestamp in specified format
param(
    [string]$Format = "YYYY-MM-DD-HHmm"
)

switch ($Format) {
    "YYYY-MM-DD-HHmm" { Get-Date -Format "yyyy-MM-dd-HHmm" }
    "YYYY-MM-DD" { Get-Date -Format "yyyy-MM-dd" }
    "HHmm" { Get-Date -Format "HHmm" }
    "ISO" { Get-Date -Format "o" }
    default { Get-Date -Format "yyyy-MM-dd-HHmm" }
}
