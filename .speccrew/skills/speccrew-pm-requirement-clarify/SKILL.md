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

## Methodology Foundation

Applies ISA-95 Stage 1 (Domain Description) for clarification:
- Define domain boundary, participants, glossary
- Results flow into `.clarification-summary.md` only

## PM Stage Content Boundary

> **DO NOT include:** API definitions, DB structures, code snippets, technical terminology. These belong to Feature Designer or System Designer.

---

# Workflow

## Absolute Constraints

> **Violation = task failure**

1. **FORBIDDEN:** `create_file` for documents — use `search_replace` on templates
2. **FORBIDDEN:** Full-file rewrite — use targeted `search_replace`
3. **MANDATORY:** Template-first workflow

## Step 1: Load Requirement Document

**Actions:**
1. Read `requirement_file`
2. Extract: business problem, target users, functional scope, constraints

## Step 2: Load System Knowledge (IF EXISTS)

**Actions:**
1. Read `knowledges/bizs/system-overview.md` if exists
2. Read related `{module}/{module}-overview.md` files if exist

> ⚠️ Knowledge files are OPTIONAL. Proceed without them if absent.

## Step 3: Determine Complexity Mode

**Auto-detect criteria:**

| Criteria | Simple | Complex |
|----------|--------|---------|
| Modules | 1 | 2+ or new domain |
| Features | 1-5 | 6+ |
| Integration points | 0-1 | 2+ |

**Logic:** `complex` if modules >= 2 OR features >= 6 OR new_domain

## Step 4: Execute Clarification (Dual Mode)

### 4.1 Simple Mode

- 1-3 key questions, chat-based
- Topics: What to change, what the change is, business reason, acceptance criteria

> ⚠️ **Switch to file-based if 4+ questions needed**

### 4.2 Complex Mode (File-Based)

> ⚠️ **All rounds use file-based interaction, NOT chat-based.**

**Round 1: Core Understanding**

Create `.clarification-questions-round-1.md`:
```markdown
# Requirements Clarification - Round 1

> Fill answers after each "**Answer:**" marker, then notify me.

## 1. Business Background & Goals
Based on the document, the system aims to solve: [points]

**Questions:**
- Is this understanding correct?
- What is the primary business goal?

**Answer:** <!-- Fill here -->

## 2. Target Users & Scenarios
Roles identified: [list]

**Questions:**
- Additional roles not mentioned?
- Primary use cases for each role?

**Answer:** <!-- Fill here -->

## 3. System Scope & Boundaries
Scope includes: [modules]

**Questions:**
- All modules required for Phase 1?
- What is explicitly out of scope?

**Answer:** <!-- Fill here -->
```

Notify user:
```
📝 Round 1 questions written to:
`01.product-requirement/.clarification-questions-round-1.md`

Please fill answers after each "**Answer:**" marker, save, and notify me.
```

**HARD STOP** — Wait for user confirmation, then read file.

**Round 2: Scope & Boundaries (if needed)**

Create `.clarification-questions-round-2.md` with:
- Out-of-Scope Items confirmation
- Integration Boundaries (external systems)
- Business Rules & Constraints

**Round 3: Detail & Acceptance (if still needed)**

Same pattern with focused follow-up questions.

## Step 5: Sufficiency Check

> ⚠️ **ALL 4 checks must pass before proceeding.**

| # | Check Item | Pass Criteria |
|---|------------|---------------|
| 1 | Scope boundaries are clear | Explicit in/out scope defined |
| 2 | Key business rules are documented | At least 1 rule identified |
| 3 | Priority/phasing decisions are made | Phase 1 scope is clear |
| 4 | Integration boundaries are identified | Integration points listed or "none" confirmed |

**Logic:** If all 4 pass → Step 6. Else if round < 3 → next round. Else → proceed with gaps noted.

## Step 6: Generate .clarification-summary.md

**Output:** `{iteration_path}/01.product-requirement/.clarification-summary.md`

**Format:**
```markdown
# Clarification Summary

## Complexity
- Level: [simple | complex]
- Rationale: [reason]

## Key Decisions
| # | Decision | Rationale | Source |
|---|----------|-----------|--------|
| 1 | [text] | [reason] | Round X |

## Clarification Q&A

### Round 1
| # | Question | Answer | Impact |
|---|----------|--------|--------|
| 1 | [Q] | [A] | [Impact] |

### Round 2 (if applicable)
[Same format]

### Round 3 (if applicable)
[Same format]

## Sufficiency Checks
- [x] Scope boundaries are clear
- [x] Key business rules are documented
- [x] Priority/phasing decisions are made
- [x] Integration boundaries are identified

## Notes
[Additional remarks or gaps]
```

## Step 7: Initialize .checkpoints.json

> ⚠️ **MANDATORY: Use `update-progress.js` script for all JSON files.**

```bash
node speccrew-workspace/scripts/update-progress.js write-checkpoint \
  --file {iteration_path}/01.product-requirement/.checkpoints.json \
  --checkpoint requirement_clarification \
  --passed true
```

**Generated structure:**
```json
{
  "stage": "01_prd",
  "checkpoints": {
    "requirement_clarification": {
      "passed": true,
      "confirmed_at": "2026-04-10T12:00:00.000Z",
      "description": "Requirement clarification completed",
      "clarification_file": ".clarification-summary.md",
      "complexity": "simple|complex",
      "sufficiency_checks": {
        "scope_boundaries": true,
        "business_rules": true,
        "priority_phasing": true,
        "integration_boundaries": true
      }
    }
  }
}
```

## Step 8: Output Completion

```
✅ Requirement Clarification Complete

Complexity Level: [simple | complex]
Clarification File: {path}/.clarification-summary.md
Checkpoint File: {path}/.checkpoints.json

Key Decisions:
- [Decision 1]
- [Decision 2]

Sufficiency Checks: 4/4 ✅

Next: Proceed to PRD generation.
```

---

# Output Checklist

- [ ] Requirement document loaded
- [ ] System knowledge loaded (if exists)
- [ ] Complexity mode determined
- [ ] Clarification conducted (appropriate mode)
- [ ] All 4 Sufficiency Checks passed
- [ ] `.clarification-summary.md` created
- [ ] `.checkpoints.json` initialized via script

---

# Constraints

**Must do:**
- Always perform at least 1 clarification round
- Use file-based for complex mode or 4+ questions
- Pass all 4 Sufficiency Checks
- Use `update-progress.js` for JSON files

**Must not do:**
- Skip clarification based on urgency
- Use chat for complex requirements
- Manually write JSON files
