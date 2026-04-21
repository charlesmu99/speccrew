---
name: speccrew-pm-phase6-verify-confirm
description: SpecCrew PM Phase 6 Verification & Confirmation Skill. Performs file integrity validation, feature list completeness check, user review gate, and finalization. Mandatory user confirmation required before status updates.
tools: Read, Write, Glob, Grep
---

# Skill Overview

Phase 6 Verification & Confirmation with three-stage gated execution. Ensures all PRD artifacts are valid, complete, and user-confirmed before finalizing workflow status.

## Trigger Scenarios

- PRD generation completed (Phase 4/5 done)
- Sub-PRD dispatch completed (complex path)
- Verification checklist needed before user review
- Final status update after user confirmation

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `iteration_path` | string | Yes | Path to iteration directory |
| `complexity` | enum | Yes | `simple` or `complex` |
| `prd_output` | object | Yes | PRD generation output containing file paths |
| `dispatch_plan` | object | No | Dispatch plan for complex path (module count reference) |
| `update_progress_script` | string | Yes | Path to update-progress.js script |
| `language` | string | No | User language (auto-detected) |

## Methodology Foundation

Applies three-stage gated verification:
- Stage 6.1: Automated file & content integrity validation
- Stage 6.2: Mandatory user review and explicit confirmation
- Stage 6.3: Finalization with status updates and cleanup

## PM Stage Content Boundary

> **DO NOT:** Update checkpoints before user confirmation, skip user review gate, auto-proceed without explicit "confirm" or "OK", modify PRD document status before confirmation.

## Templates Used

| Template | Path | Purpose |
|----------|------|---------|
| Verification Report | Inline | File integrity and feature completeness results |
| PRD Review Summary | Inline | User review presentation template |

---

# AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

# Output Checklist

- [ ] Master PRD file verified (exists, size > 1KB)
- [ ] All Sub-PRD files verified (complex path)
- [ ] Sub-PRD count matches dispatch plan
- [ ] `.clarification-summary.md` exists
- [ ] `.module-design.md` exists (complex path)
- [ ] Feature list completeness verified
- [ ] User review gate executed
- [ ] Explicit user confirmation received
- [ ] Checkpoints updated via script
- [ ] WORKFLOW-PROGRESS.json updated to completed
- [ ] PRD document status updated to Confirmed
- [ ] Intermediate files cleaned up

---

# Constraints

**Must do:**
- Execute all verification steps in order: 6.1 → 6.2 → 6.3
- Wait for explicit user confirmation ("confirm" or "OK") before Phase 6.3
- Use `update-progress.js` for all JSON file updates
- Present complete verification summary to user
- Report all deliverables with file paths and sizes
- Clean up intermediate files after confirmation

**Must not do:**
- Update checkpoints (verification_checklist, prd_review) before user confirmation
- Update WORKFLOW-PROGRESS.json to completed before user confirmation
- Change PRD document status from Draft to Confirmed before user confirmation
- Generate completion report before user confirmation
- Suggest next phase before user confirmation
- Assume user silence means confirmation
- Proceed to Phase 6.3 without explicit user confirmation
- Delete PRD documents or clarification-related files
