---
name: speccrew-pm-knowledge-detector
description: Detect business knowledge base availability and completeness status. Scans sync-state directory to determine if full knowledge (system-overview.md), lite knowledge (features-*.json), or no knowledge is available.
tools: Read, Glob
---

# Knowledge Base Detector

Detect business knowledge base availability and completeness status. Scans the sync-state directory to determine the current knowledge state.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content must be in the target language only.**

## Trigger Scenarios

- "Check knowledge base status"
- "Detect if business knowledge exists"
- "Scan knowledge availability"
- "What knowledge is available?"

## Input

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `workspace_path` | string | Absolute path to speccrew workspace (e.g., `speccrew-workspace`) | **Yes** |
| `sync_state_bizs_dir` | string | Absolute path to `knowledges/base/sync-state/knowledge-bizs/` directory | **Yes** |
| `configs_dir` | string | Absolute path to `docs/configs/` directory | **Yes** |

## Output JSON

```json
{
  "status": "full | lite | none",
  "has_system_overview": false,
  "has_features": false,
  "has_entry_dirs": false,
  "available_platforms": ["web-vue3", "backend-spring"],
  "module_count": 0,
  "features_files": ["path/to/features-web-vue3.json"],
  "entry_dirs_files": ["path/to/entry-dirs-web-vue3.json"],
  "system_overview_path": null,
  "message": "Knowledge base status detected"
}
```

**Status Definitions**:

| Status | Condition |
|--------|-----------|
| `full` | has_system_overview = true AND has_features = true |
| `lite` | has_features = true AND has_system_overview = false |
| `none` | has_features = false AND has_system_overview = false |

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Constraints

1. **READ-ONLY**: This skill does not modify any files
2. **Fast execution**: Use Glob for scanning, avoid deep file reads
3. **Graceful handling**: Return empty arrays if directories don't exist
4. **Path format**: All returned paths should be relative to workspace_path

> **MANDATORY**: Use the provided absolute paths directly. DO NOT construct or derive paths yourself.

## Task Completion Report

When the task is complete, report:

```json
{
  "status": "success | failed",
  "skill": "speccrew-pm-knowledge-detector",
  "detection_result": {
    "status": "full | lite | none",
    "available_platforms": [...],
    "module_count": 0
  },
  "message": "Knowledge base status detected successfully"
}
```

## Checklist

- [ ] Step 1: Checked system-overview.md existence
- [ ] Step 2: Scanned for features-*.json files
- [ ] Step 3: Scanned for entry-dirs-*.json files
- [ ] Step 4: Counted platforms and modules
- [ ] Step 5: Determined overall status and returned JSON
