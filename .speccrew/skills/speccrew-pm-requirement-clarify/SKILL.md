---
name: speccrew-pm-requirement-clarify
description: SpecCrew PM Requirement Clarification Skill. Dual-mode support (simple/complex). Produces .clarification-summary.md as interface contract for downstream PRD generation. First step in PRD workflow.
tools: Read, Write, Glob, Grep
---

# Skill Overview

Requirement clarification with dual-mode support. Produces `.clarification-summary.md` as the interface contract.

## Trigger Scenarios

- User provides initial requirement description
- PM Agent needs to clarify before PRD generation
- Requirement complexity assessment needed

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requirement_file` | string | Yes | Path to requirement document |
| `iteration_path` | string | Yes | Path to iteration directory |
| `complexity_hint` | enum | No | `simple` or `complex`. Auto-detect if not provided |
| `max_clarification_rounds` | number | No | Maximum clarification rounds (default: 5) |

## Methodology Foundation

Applies ISA-95 Stage 1 (Domain Description) for clarification:
- Define domain boundary, participants, glossary
- Results flow into `.clarification-summary.md` only

## PM Stage Content Boundary

> **DO NOT include:** API definitions, DB structures, code snippets, technical terminology. These belong to Feature Designer or System Designer.

## Templates Used

| Template | Path | Purpose |
|----------|------|---------|
| Clarification Questions | `templates/CLARIFICATION-QUESTIONS-TEMPLATE.md` | Round-based questionnaire for user clarification |
| Clarification Summary | `templates/CLARIFICATION-SUMMARY-TEMPLATE.md` | Final summary document with all Q&A and decisions |

---

# AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

# Output Checklist

- [ ] Requirement document loaded
- [ ] System knowledge loaded (if exists)
- [ ] Complexity mode determined
- [ ] Loop variables initialized (`sufficiency_checks_passed`, `round_number`)
- [ ] Clarification conducted (appropriate mode)
- [ ] Multi-round clarification executed until ALL 4 Sufficiency Checks pass
- [ ] Each round generates `.clarification-questions-round-{N}.md`
- [ ] Round counter incremented after each iteration
- [ ] Maximum 5 rounds enforced (safety valve)
- [ ] `.clarification-summary.md` created from template
- [ ] `.checkpoints.json` initialized via script

---

# Constraints

**Must do:**
- Always perform at least 1 clarification round
- **MANDATORY**: Execute multiple rounds until ALL 4 sufficiency checks pass
- Use file-based for complex mode or 4+ questions
- Pass all 4 Sufficiency Checks
- Generate `.clarification-questions-round-{N}.md` for each round
- Update `sufficiency_checks_passed` variable after each sufficiency check
- Increment `round_number` after each round
- Maximum 5 rounds allowed (safety valve)
- Use `update-progress.js` for JSON files
- After completion, return control to PM Agent for user confirmation — DO NOT auto-proceed to PRD generation

**Must not do:**
- Skip clarification based on urgency
- Use chat for complex requirements
- Manually write JSON files
- Auto-proceed to Phase 4 (PRD generation) without PM Agent's user confirmation gate
- Auto-pass sufficiency checks without actual user answers
- Write checkpoints in this Skill — checkpoints are managed by orchestration layer

### MANDATORY: User Answer Verification Rule

- Worker MUST NOT auto-pass sufficiency checks without actual user answers
- Each clarification round MUST wait for user to fill in answers before proceeding
- Checkpoint writing is FORBIDDEN in this Skill — checkpoints are managed by the orchestration layer
- The sufficiency check result is ONLY valid when based on real user-provided answers
