# Status File Formats (Techs Pipeline)

This document defines the JSON formats for techs pipeline status tracking files.

## File Locations

| Stage | File Path |
|-------|-----------|
| Stage 2 | `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/stage2-status.json` |
| Stage 3 | `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/stage3-status.json` |

---

## Stage 2: Platform Document Generation

**Generation Timing**: After all Stage 2 Workers complete

**Schema**:
```json
{
  "generated_at": "ISO-8601 timestamp",
  "stage": "platform-doc-generation",
  "total_platforms": "number",
  "completed": "number",
  "failed": "number",
  "platforms": [
    {
      "platform_id": "string",
      "platform_type": "string",
      "framework": "string",
      "status": "completed | failed",
      "documents_generated": ["array of filenames"],
      "output_path": "string"
    }
  ]
}
```

**Example**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "stage": "platform-doc-generation",
  "total_platforms": 3,
  "completed": 3,
  "failed": 0,
  "platforms": [
    {
      "platform_id": "web-react",
      "platform_type": "web",
      "framework": "react",
      "status": "completed",
      "documents_generated": [
        "INDEX.md",
        "tech-stack.md",
        "architecture.md",
        "conventions-design.md",
        "conventions-dev.md",
        "conventions-test.md"
      ],
      "output_path": "speccrew-workspace/knowledges/techs/web-react/"
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "status": "completed",
      "documents_generated": [
        "INDEX.md",
        "tech-stack.md",
        "architecture.md",
        "conventions-design.md",
        "conventions-dev.md",
        "conventions-test.md",
        "conventions-data.md"
      ],
      "output_path": "speccrew-workspace/knowledges/techs/backend-nestjs/"
    }
  ]
}
```

---

## Stage 3: Root Index Generation

**Generation Timing**: After Stage 3 Worker completes

**Schema**:
```json
{
  "generated_at": "ISO-8601 timestamp",
  "stage": "root-index-generation",
  "status": "completed | failed",
  "platforms_indexed": "number",
  "index_file": "string (path to INDEX.md)"
}
```

**Example**:
```json
{
  "generated_at": "2024-01-15T10:35:00Z",
  "stage": "root-index-generation",
  "status": "completed",
  "platforms_indexed": 3,
  "index_file": "speccrew-workspace/knowledges/techs/INDEX.md"
}
```

---

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `generated_at` | string | ISO 8601 timestamp |
| `stage` | string | Pipeline stage identifier |
| `total_platforms` | number | Total platforms dispatched (Stage 2) |
| `completed` | number | Successfully completed count |
| `failed` | number | Failed count |
| `platforms[].platform_id` | string | Platform identifier |
| `platforms[].framework` | string | Framework name |
| `platforms[].documents_generated` | array | List of generated document filenames |
| `platforms_indexed` | number | Number of platforms in root index (Stage 3) |
| `index_file` | string | Path to generated INDEX.md (Stage 3) |
