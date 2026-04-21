---
name: speccrew-pm-phase1-knowledge-check
description: SpecCrew PM Phase 1 Knowledge Base Availability Check Skill. Detects knowledge base status and initializes business knowledge as needed. Supports three-path routing (Full/Lite/None) with Path B deep initialization sequence.
tools: Read, Write, Glob, Grep, Bash
---

# Skill Overview

Knowledge base availability check for PM workflow. Detects existing knowledge status, routes to appropriate path, and initializes business knowledge when needed.

## Trigger Scenarios

- PM Agent starts new requirement processing
- Knowledge base status unknown
- Feature inventory generation needed
- Module matching and deep initialization required

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspace_path` | string | Yes | Absolute path to speccrew-workspace root |
| `sync_state_bizs_dir` | string | Yes | Absolute path to knowledges/base/sync-state/knowledge-bizs |
| `configs_dir` | string | Yes | Absolute path to docs/configs directory |
| `ide_skills_dir` | string | No | Absolute path to IDE skills directory |
| `source_path` | string | No | Project source root from .speccrewrc |
| `language` | string | No | User language (auto-detected if not provided) |
| `user_requirement` | string | No | User requirement text for module matching |
| `update_progress_script` | string | Yes | Absolute path to update-progress.js script |

## Methodology Foundation

Applies knowledge detection and initialization flow:
- Stage 0: Feature inventory (lightweight metadata scan)
- Stage 1: Deep module initialization (requirement-scoped analysis)

## Output Files

| File | Path | Purpose |
|------|------|---------|
| Features Inventory | `{sync_state_bizs_dir}/features-{platform}.json` | Platform module and feature metadata |
| Entry Dirs | `{sync_state_bizs_dir}/entry-dirs-{platform}.json` | Source directory mapping |
| Module Overview | `{workspace_path}/knowledges/bizs/{platform}/{module}/module-overview.md` | Module documentation |
| System Overview | `{workspace_path}/knowledges/bizs/system-overview.md` | Aggregated system summary |
| Graph Data | `{sync_state_bizs_dir}/completed/*.graph.json` | API/UI relationship graph data |

---

# AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

# Output Checklist

- [ ] Knowledge detector dispatched and status obtained
- [ ] Correct path selected based on status (A/B/C)
- [ ] **Path A**: System overview summary loaded
- [ ] **Path B**: Module matcher executed
- [ ] **Path B Step 1.5**: DISPATCH-PROGRESS.json initialized
- [ ] **Path B Step 2**: Analyze task plan generated for matched modules
- [ ] **Path B Step 3**: All feature analysis workers dispatched (parallel)
- [ ] **Path B Step 3.5**: Graph data generated for all completed analyses
- [ ] **Path B Step 4**: Module summaries generated
- [ ] **Path B Step 5**: Features status updated (analyzed=true)
- [ ] **Path B Step 6**: System overview generated
- [ ] **Path B Step 7**: Intermediate files cleaned up
- [ ] **Path C**: Feature inventory generated via Worker
- [ ] **Path C Re-check**: Detector re-run and status verified
- [ ] Knowledge context stored for downstream phases

---

# Constraints

**Must do:**
- MUST dispatch Worker with `speccrew-pm-knowledge-detector` skill - DO NOT manually search directories
- MUST dispatch Worker for `speccrew-knowledge-bizs-init-features` when status is "none"
- MUST dispatch Worker for `speccrew-pm-module-matcher` in Path B
- MUST execute all Path B Steps 1-7 in sequence - DO NOT skip to Phase 2
- MUST use `run_in_terminal` for all script executions via Workers
- MUST use parallel dispatch (max 5 concurrency) for feature analysis
- MUST generate graph data (Step 3.5) before module summaries (Step 4)
- MUST clean up intermediate files after successful completion

**Must not do:**
- Manually create features-*.json or entry-dirs-*.json files
- Execute knowledge-base scripts directly via Bash (PM Agent must use Workers)
- Write files to `knowledges/techs/*/sync-state/` - output goes to `knowledges/base/sync-state/knowledge-bizs/` ONLY
- Skip Steps 2-5 when matcher returns matched modules
- Ask user "do you want to continue?" mid-way through Path B sequence
- Expose internal concepts (Stage 0, Stage 1) to user
