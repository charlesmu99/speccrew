---
name: speccrew-pm-requirement-simple
description: SpecCrew PM Simple Requirement Skill. Handles lightweight requirements (field additions, minor feature changes, single-module enhancements) with a streamlined PRD generation process. Produces a single concise PRD document without Master-Sub structure or worker dispatch.
tools: Read, Write, Glob, Grep, Terminal
---

# Skill Overview

Simple requirement analysis skill for lightweight changes. Produces a single concise PRD.

## Trigger Scenarios

- User requests a small change (add field, modify behavior, fix workflow)
- Requirement scope is within 1-2 modules
- Estimated 1-5 Features

## Methodology Foundation

This skill applies ISA-95 Stages 1-3 in lightweight mode:

| ISA-95 Stage | Lightweight Application |
|---|---|
| Stage 1: Domain Description | Quick scope confirmation (no formal glossary needed) |
| Stage 2: Functions in Domain | Identify affected functions (no full WBS needed) |
| Stage 3: Functions of Interest | All identified features are core (no MoSCoW filtering) |

> **No separate modeling documents.** Lightweight mode focuses on speed and clarity.

## PM Stage Content Boundary

> **DO NOT include in PRD:** API definitions, class diagrams, ER diagrams, code snippets, technical metrics.
> These belong to Feature Designer or System Designer.

---

## Workflow

### Step 1: Quick Clarification

Confirm the requirement in 1-3 rounds:

1. **What to change**: Which page/function/module is affected?
2. **What the change is**: Add field? Modify logic? New sub-feature?
3. **Business reason**: Why is this change needed?
4. **Acceptance criteria**: How to verify the change is correct?

> **ISA-95 Stage 1 Thinking** — Confirm affected module boundary and impacted user roles. No formal glossary needed.

If requirement is already clear, skip and proceed.

**If requirement is complex** (3+ modules, 10+ features, new system), **STOP and redirect**:
```
⚠️ This requirement appears complex. Switching to full requirement analysis.
Invoking skill: speccrew-pm-requirement-analysis/SKILL.md
```

### Step 2: Initialize Tracking

1. **Determine iteration path**: Use existing or create `speccrew-workspace/iterations/{iteration-id}/`

2. **Create checkpoint file** at `01.product-requirement/.checkpoints.json`:
```json
{
  "stage": "01_prd",
  "complexity": "simple",
  "checkpoints": {
    "requirement_clarification": { "passed": true, "confirmed_at": "{REAL_TIMESTAMP}", "description": "Quick clarification completed" },
    "prd_review": { "passed": false, "confirmed_at": null, "description": "User review and confirmation" }
  }
}
```
Get real timestamp via: `node -e "console.log(new Date().toISOString())"`

3. **Update WORKFLOW-PROGRESS.json** (if exists):
```bash
node speccrew-workspace/scripts/update-progress.js update-workflow \
  --file speccrew-workspace/iterations/{iteration}/WORKFLOW-PROGRESS.json \
  --stage 01_prd --status in_progress
```

### Step 3: Read PRD Template

Read: `speccrew-workspace/docs/templates/PRD-TEMPLATE.md`

If not found, check: `.speccrew/skills/speccrew-pm-requirement-analysis/templates/PRD-TEMPLATE.md`

### Step 4: Generate Single PRD

Create PRD at: `speccrew-workspace/iterations/{iteration}/01.product-requirement/{feature-name}-prd.md`

> **ISA-95 Stage 2 Thinking** — List only directly affected functions. No full WBS needed.

**Section filling guidance:**

| PRD Section | Simple Requirement Approach |
|---|---|
| 1. Background & Goals | 2-3 sentences. What's changing and why. |
| 1.2 Domain Boundary | In-scope: the specific change. Out-of-scope: everything else. |
| 1.3/1.4 Glossary | Only if new business terms introduced. Skip if unnecessary. |
| 2. User Stories | 1-3 user stories maximum. |
| 3. Functional Requirements | Brief description of the change. |
| 3.3 Feature List | Simple table, 1-5 rows. |
| 3.4 Feature Breakdown | 1-5 features. All P0. |
| 4. Non-Functional Requirements | Only if relevant. Skip if not applicable. |
| 5. Acceptance Criteria | 3-5 concrete, testable criteria. |
| 6. Boundary | Clear in/out scope. |
| 7. Assumptions | Only if there are assumptions to document. |

> **ISA-95 Stage 3 Thinking** — All identified features are Must-have (P0). No MoSCoW filtering needed.

### Step 5: Present for User Review

Display PRD summary:
```
📄 PRD Generated: {feature-name}-prd.md

Summary:
- Scope: {brief scope}
- Features: {count} features
- Modules affected: {module names}

Please review and confirm the scope, acceptance criteria, and completeness.
```

⚠️ **HARD STOP — WAIT FOR USER CONFIRMATION**

```
DO NOT proceed until user explicitly confirms.
IF user requests changes → update PRD, then re-present.
ONLY after user confirms → proceed to Step 6.
```

### Step 6: Finalize PRD Stage

After user confirms:

1. **Update checkpoint** — set `prd_review.passed = true` with real timestamp

2. **Update WORKFLOW-PROGRESS.json**:
```bash
node speccrew-workspace/scripts/update-progress.js update-workflow \
  --file speccrew-workspace/iterations/{iteration}/WORKFLOW-PROGRESS.json \
  --stage 01_prd --status confirmed \
  --output "01.product-requirement/{feature-name}-prd.md"
```

3. **Output**: `✅ PRD confirmed. PRD stage is complete. Next: Start Feature Design in a new conversation.`

4. **END** — Do not proceed further.

---

## Output Checklist

- [ ] PRD file created at correct path
- [ ] All relevant sections filled (skip empty optional sections)
- [ ] No technical implementation details (no API, no code, no class diagrams)
- [ ] Feature Breakdown table present with at least 1 feature
- [ ] Acceptance criteria are concrete and testable
- [ ] .checkpoints.json created with requirement_clarification passed
- [ ] Business language only — no technical jargon

## Constraints

**Must do:**
- Keep PRD concise — 1-3 page PRDs
- Use business language throughout
- Verify with user before finalizing
- Use real timestamps from `node -e "console.log(new Date().toISOString())"`

**Must not do:**
- Do not generate Master-Sub PRD structure
- Do not dispatch worker agents
- Do not generate API definitions, class diagrams, or technical artifacts
- Do not skip user confirmation
- Do not auto-transition to Feature Design stage
