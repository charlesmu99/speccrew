# Status File Formats (Bizs Pipeline)

This document defines the status tracking formats for the bizs pipeline.

> **Note**: Stage 2 and Stage 3 status tracking is now handled directly within `features-{platform}.json` files and Worker return values. The legacy `stage2-status.json` and `stage3-status.json` files have been removed.

---

## Feature Status Tracking (Stage 2)

Feature analysis status is tracked directly in `features-{platform}.json` files located at:
- `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/features-{platform}.json`

**Feature Object Schema**:
```json
{
  "id": "string (unique feature identifier)",
  "fileName": "string",
  "sourcePath": "string",
  "documentPath": "string",
  "module": "string",
  "analyzed": "boolean",
  "status": "pending | in_progress | completed | failed",
  "startedAt": "ISO timestamp (optional)",
  "completedAt": "ISO timestamp (optional)",
  "error": "string (optional, when status=failed)"
}
```

**Example Feature Entry**:
```json
{
  "id": "user-index-vue",
  "fileName": "index",
  "sourcePath": "frontend-web/src/views/system/user/index.vue",
  "documentPath": "speccrew-workspace/knowledges/bizs/web/system/user/index.md",
  "module": "system",
  "analyzed": true,
  "status": "completed",
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:00Z"
}
```

---

## Module Status Tracking (Stage 3)

Module summarization status is determined by aggregating feature statuses from `features-{platform}.json`:

| Module Status | Condition |
|---------------|-----------|
| `pending` | Module has features but no overview document exists |
| `completed` | Overview document exists at `{module}/{module}-overview.md` |
| `failed` | Worker explicitly reported failure |

---

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `features[].id` | string | Unique feature identifier (used for marker file naming) |
| `features[].fileName` | string | Feature file name |
| `features[].sourcePath` | string | Source code file path |
| `features[].documentPath` | string | Generated documentation path |
| `features[].module` | string | Module code_name |
| `features[].analyzed` | boolean | Whether feature has been analyzed |
| `features[].status` | string | `pending`, `in_progress`, `completed`, `failed` |
| `features[].startedAt` | string | ISO timestamp when analysis started |
| `features[].completedAt` | string | ISO timestamp when analysis completed |
| `features[].error` | string | Error message when status is `failed` |
