---
name: speccrew-get-timestamp
description: Get current timestamp in various formats for file naming and logging. Use when generating dated filenames, report timestamps, or any scenario requiring consistent datetime formatting.
---

# Get Timestamp

Get current timestamp in specified format for consistent datetime handling across all skills.

## User

Any Agent or script requiring timestamp generation

## Input

- `format` (optional): Timestamp format, default is `YYYY-MM-DD-HHmmss`
  - `YYYY-MM-DD-HHmmss`: Full datetime for filenames (e.g., `2026-03-17-132645`)
  - `YYYY-MM-DD`: Date only (e.g., `2026-03-17`)
  - `HHmm`: Time only 24h format (e.g., `1326`)
  - `ISO`: ISO 8601 format (e.g., `2026-03-17T13:26:45+08:00`)

## Output

- Timestamp string in specified format (printed to stdout)

## Supported Formats

| Format | Description | Example |
|--------|-------------|---------|
| `YYYY-MM-DD-HHmmss` | Full datetime for filenames | `2026-03-17-132645` |
| `YYYY-MM-DD` | Date only | `2026-03-17` |
| `HHmm` | Time only (24h) | `1326` |
| `ISO` | ISO 8601 format | `2026-03-17T13:26:45+08:00` |

## Usage

### Method 1: Direct Script Execution (Node.js - Cross Platform)

```bash
# Node.js (cross-platform, recommended)
node scripts/get-timestamp.js "YYYY-MM-DD-HHmmss"
```

### Method 2: Default Format (YYYY-MM-DD-HHmmss)

```bash
# Without format parameter, returns YYYY-MM-DD-HHmmss
node scripts/get-timestamp.js
```

## Integration Examples

### For Report Filenames

```bash
TIMESTAMP=$(node scripts/get-timestamp.js "YYYY-MM-DD-HHmmss")
FILENAME="diagnosis-report-${TIMESTAMP}.md"
# Result: diagnosis-report-2026-03-17-132645.md
```

### For Archive Naming

```bash
TIMESTAMP=$(node scripts/get-timestamp.js "YYYY-MM-DD")
ARCHIVE_NAME="tech-debt-archived-${TIMESTAMP}.md"
# Result: tech-debt-archived-2026-03-17.md
```

### For Template Variables

When filling `{{generated_at}}` in templates:
```bash
generated_at=$(node scripts/get-timestamp.js "ISO")
# Result: 2026-03-17T13:26:45+08:00
```

## Script Location

- **Node.js**: `scripts/get-timestamp.js` (cross-platform, unified implementation)

