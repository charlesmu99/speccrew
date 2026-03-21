---
name: SpecCrew-get-timestamp
description: Get current timestamp in various formats for file naming and logging. Use when generating dated filenames, report timestamps, or any scenario requiring consistent datetime formatting.
---

# Get Timestamp

Get current timestamp in specified format for consistent datetime handling across all skills.

## Supported Formats

| Format | Description | Example |
|--------|-------------|---------|
| `YYYY-MM-DD-HHmm` | Full datetime for filenames | `2026-03-17-1326` |
| `YYYY-MM-DD` | Date only | `2026-03-17` |
| `HHmm` | Time only (24h) | `1326` |
| `ISO` | ISO 8601 format | `2026-03-17T13:26:45+08:00` |

## Usage

### Method 1: Direct Script Execution

```bash
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File SpecCrew-get-timestamp/scripts/get-timestamp.ps1 -Format "YYYY-MM-DD-HHmm"

# Linux/macOS/Git Bash
bash SpecCrew-get-timestamp/scripts/get-timestamp.sh "YYYY-MM-DD-HHmm"

# Python (cross-platform)
python SpecCrew-get-timestamp/scripts/get-timestamp.py --format "YYYY-MM-DD-HHmm"
```

### Method 2: Default Format (YYYY-MM-DD-HHmm)

```bash
# Without format parameter, returns YYYY-MM-DD-HHmm
powershell -ExecutionPolicy Bypass -File SpecCrew-get-timestamp/scripts/get-timestamp.ps1
bash SpecCrew-get-timestamp/scripts/get-timestamp.sh
python SpecCrew-get-timestamp/scripts/get-timestamp.py
```

## Integration Examples

### For Report Filenames

```bash
TIMESTAMP=$(bash SpecCrew-get-timestamp/scripts/get-timestamp.sh "YYYY-MM-DD-HHmm")
FILENAME="diagnosis-report-${TIMESTAMP}.md"
# Result: diagnosis-report-2026-03-17-1326.md
```

### For Archive Naming

```bash
TIMESTAMP=$(bash SpecCrew-get-timestamp/scripts/get-timestamp.sh "YYYY-MM-DD")
ARCHIVE_NAME="tech-debt-archived-${TIMESTAMP}.md"
# Result: tech-debt-archived-2026-03-17.md
```

### For Template Variables

When filling `{{GeneratedAt}}` in templates:
```bash
GeneratedAt=$(bash SpecCrew-get-timestamp/scripts/get-timestamp.sh "ISO")
# Result: 2026-03-17T13:26:45+08:00
```

## Script Locations

- **PowerShell**: `SpecCrew-get-timestamp/scripts/get-timestamp.ps1`
- **Bash**: `SpecCrew-get-timestamp/scripts/get-timestamp.sh`
- **Python**: `SpecCrew-get-timestamp/scripts/get-timestamp.py`

