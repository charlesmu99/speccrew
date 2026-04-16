---
name: speccrew-pm-phase0-init
description: SpecCrew PM Phase 0 Initialization Skill. Handles iteration directory creation, WORKFLOW-PROGRESS.json management, checkpoint recovery, IDE detection, and path initialization. First step before any PM workflow execution.
tools: Read, Write, Glob, Grep
---

# Skill Overview

Phase 0 initialization for PM workflow. Ensures proper workspace setup, iteration directory creation, progress tracking initialization, and resume state detection.

## Trigger Scenarios

- PM Agent starts a new workflow session
- PM Agent needs to detect or create iteration directory
- PM Agent needs to check resume state from previous session
- PM Agent needs to initialize path context variables

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_requirement` | string | Yes | User requirement description or document path |
| `workspace_root` | string | Yes | speccrew-workspace root directory path |
| `source_path` | string | No | Project source root from .speccrewrc |
| `language` | string | No | User language (auto-detected) |

## Methodology Foundation

Applies workspace initialization principles:
- Iteration directory naming convention: `{number}-{type}-{name}`
- Progress tracking via WORKFLOW-PROGRESS.json
- Checkpoint recovery for session continuity

## Output Deliverables

| Deliverable | Path | Description |
|-------------|------|-------------|
| Iteration Directory | `{iterations_dir}/{iteration_name}/` | Created iteration structure |
| WORKFLOW-PROGRESS.json | `{iteration_path}/WORKFLOW-PROGRESS.json` | Workflow progress tracker |
| Path Variables | Context | All computed path variables |

---

# AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

# Output Checklist

- [ ] IDE environment detected
- [ ] Path variables computed (workspace_path, iteration_path, etc.)
- [ ] Iteration directory created or located
- [ ] WORKFLOW-PROGRESS.json initialized or loaded
- [ ] Checkpoint recovery logic executed
- [ ] Resume target determined

---

# Constraints

**Must do:**
- Follow iteration naming convention `{number}-{type}-{name}`
- Use `update-progress.js` script for WORKFLOW-PROGRESS.json operations
- Compute all path variables as absolute paths
- Check for active iteration before creating new one
- Copy requirement document to iteration's 00.docs directory

**Must not do:**
- Manually create WORKFLOW-PROGRESS.json via Write/Edit tools
- Skip checkpoint recovery check
- Use relative paths in Worker dispatches
- Create iteration directory without proper naming convention
