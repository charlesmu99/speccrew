# Status File Formats (Bizs Pipeline)

This document defines the status tracking formats for the bizs pipeline.

> **Note**: Stage 2 and Stage 3 status tracking is now handled directly within `features-{platform}.json` files and Worker return values. The legacy `stage2-status.json` and `stage3-status.json` files have been removed.

---

## Marker File Naming Convention

Marker files (`.done.json` and `.graph.json`) use a composite naming pattern to prevent conflicts between same-named source files.

**Format:** `{module}-{subpath}-{fileName}.{type}.json`

**Components:**
- **module**: Business module name (e.g., `system`, `ai`, `bpm`, `trade`)
- **subpath**: Middle path extracted from sourcePath, with `/` replaced by `-` (e.g., `notify-message`, `controller-admin-user`)
- **fileName**: Source file name without extension (e.g., `index`, `UserController`)
- **type**: `done` or `graph`

**Examples:**

| Source File | Marker Filename |
|-------------|-----------------|
| `yudao-ui/.../views/system/notify/message/index.vue` | `system-notify-message-index.done.json` |
| `yudao-ui/.../views/system/user/index.vue` | `system-user-index.done.json` |
| `yudao-module-system/.../controller/admin/user/UserController.java` | `system-controller-admin-user-UserController.done.json` |

**Special Case:** If subpath is empty (file at module root), use format: `{module}-{fileName}.{type}.json`

**Legacy Format Support:** The processing scripts support both new format (`{module}-{subpath}-{fileName}`) and legacy format (`{fileName}`) for backward compatibility.

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
  "error": "string (optional, when status=failed)",
  "analysisNotes": "string (optional, notes from analysis; may contain [WARN: document missing] if document was not generated)"
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
| `features[].fileName` | string | Feature file name (without extension) - used as part of marker file naming |
| `features[].sourcePath` | string | Source code file path - used to extract subpath for marker file naming |
| `features[].documentPath` | string | Generated documentation path |
| `features[].module` | string | Module code_name - used as prefix for marker file naming |
| `features[].analyzed` | boolean | Whether feature has been analyzed |
| `features[].status` | string | `pending`, `in_progress`, `completed`, `failed` |
| `features[].startedAt` | string | ISO timestamp when analysis started |
| `features[].completedAt` | string | ISO timestamp when analysis completed |
| `features[].error` | string | Error message when status is `failed` |
| `features[].analysisNotes` | string | Analysis notes from Worker; contains `[WARN: document missing at {path}]` if document was expected but not found |
