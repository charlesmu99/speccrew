---
name: speccrew-pm-requirement-model
description: SpecCrew PM Requirement Modeling Skill. Applies ISA-95 Stages 1-3 for business domain analysis, WBS decomposition, and module ordering. Produces .module-design.md as interface contract for downstream PRD generation. Second step in PRD workflow.
tools: Read, Write, Glob, Grep
---

# Skill Overview

ISA-95 business modeling and module decomposition. Produces `.module-design.md` as the interface contract for PRD generation.

## Trigger Scenarios

- Clarification completed (`.clarification-summary.md` exists)
- Complex requirements requiring ISA-95 analysis
- Multi-module system requiring decomposition

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `iteration_path` | string | Yes | Path to iteration directory |
| `clarification_file` | string | No | Path to clarification summary (default: `{iteration_path}/01.product-requirement/.clarification-summary.md`) |

## Methodology Foundation

Applies ISA-95 Stages 1-3 as structured analysis framework:

| Stage | Purpose | Output |
|-------|---------|--------|
| Stage 1: Domain Description | Boundary, actors, glossary | Domain model |
| Stage 2: Functions in Domain | WBS decomposition | Function map |
| Stage 3: Functions of Interest | MoSCoW prioritization | MVP scope |

## PM Stage Content Boundary

> **DO NOT include:** API definitions, DB structures, code snippets, technical terminology. These belong to Feature Designer or System Designer.

---

# Workflow

## Absolute Constraints

> **Violation = task failure**

1. **FORBIDDEN:** `create_file` for documents — use `search_replace` on templates
2. **FORBIDDEN:** Full-file rewrite — use targeted `search_replace`
3. **MANDATORY:** Template-first workflow

## Step 1: Verify Prerequisites

**MANDATORY:** `.clarification-summary.md` MUST exist in the iteration directory.

**IF missing → ABORT immediately:**
```
❌ ERROR: .clarification-summary.md not found.
   Path: {iteration_path}/01.product-requirement/.clarification-summary.md
   
   This skill requires completed clarification. Please run speccrew-pm-requirement-clarify first.
```

**Actions:**
1. Read `.clarification-summary.md`
2. Extract: complexity level, key decisions, clarified scope, business rules
3. IF complexity == "simple" → Skip to Step 4 (minimal module design)

## Step 2: ISA-95 Business Modeling (Complex Requirements)

> ⚠️ **This is a THINKING PROCESS with user checkpoints.**

### 2.1 Stage 1 - Domain Description

**Actions:**
- Define domain boundary (in-scope, out-of-scope)
- Identify external participants (users, systems, agents)
- Create domain glossary (business terms only)

**Output format:**
```markdown
### Domain Description
- **System Boundary**: [what's included/excluded]
- **Actors**: [user roles, external systems]
- **Domain Glossary**:
  | Term | Definition |
  |------|-----------|
  | [term] | [definition] |
```

**Checkpoint A:** Present to user for confirmation.
```
📝 Domain Description Complete

System Boundary: [summary]
Actors: [list]

Does this match your understanding? Reply "确认" to proceed or provide corrections.
```

**HARD STOP** — Wait for user confirmation before proceeding.

### 2.2 Stage 2 - Functions in Domain (WBS)

**Actions:**
- Create WBS decomposition (2-3 levels)
- Map functions to business capabilities
- Identify module boundaries

**Output format:**
```markdown
### Domain Functions (WBS)
- Function 1
  - Sub-function 1.1
  - Sub-function 1.2
- Function 2
  - Sub-function 2.1
```

### 2.3 Stage 3 - Functions of Interest (MoSCoW)

**Actions:**
- Apply MoSCoW prioritization
- Identify core vs non-core functions
- Define MVP scope

**Output format:**
```markdown
### Focus Functions (MoSCoW)
| Priority | Function | Rationale |
|----------|----------|-----------|
| Must | [function] | [why core] |
| Should | [function] | [why important] |
| Could | [function] | [why deferred] |
| Won't | [function] | [why excluded] |
```

**Checkpoint B:** Present MVP scope for confirmation.
```
📝 MVP Scope Defined

Must-have (Phase 1): [list]
Should-have (Phase 2): [list]

Is this prioritization correct? Reply "确认" to proceed.
```

**HARD STOP** — Wait for user confirmation.

**Checkpoint C:** Present complete analysis summary.
```
📝 ISA-95 Analysis Complete

[Summary of all 3 stages]

Ready to proceed with module decomposition? Reply "确认".
```

**HARD STOP** — Wait for final confirmation before Step 3.

## Step 3: Module Decomposition & Ordering

### 3.1 Define Module List

**Actions:**
- Map WBS functions to modules
- Define scope for each module
- Identify key entities per module

**Output format:**
```markdown
## Module List (Total: {N} modules)
| Module | Key | Scope | Key Entities | Owner Domain |
|--------|-----|-------|-------------|--------------|
| [Name] | [key] | [scope] | [entities] | [domain] |
```

> ⚠️ **MANDATORY:** Replace `{N}` with the actual module count. This count is used by downstream skills for structure validation.

### 3.2 Cross-Module Dependency Matrix

**Actions:**
- Identify data flows between modules
- Document dependency types (Data/API/Event)
- Note shared entities

**Output format:**
```markdown
## Dependency Matrix
| Source Module | Target Module | Type | Description |
|--------------|---------------|------|-------------|
| [A] | [B] | Data | [shared entity] |
```

### 3.3 Implementation Phases

**Actions:**
- Sort modules by dependency (least dependent first)
- Group into phases (typically 3)
- Validate no circular dependencies

**Output format:**
```markdown
## Implementation Phases
- **Phase 1** (Foundation): [modules with no upstream deps]
- **Phase 2** (Core): [modules depending on Phase 1]
- **Phase 3** (Extension): [remaining modules]
```

**User Confirmation:**
```
📝 Module Decomposition Complete

[Module list table]
[Dependency matrix]
[Implementation phases]

Please review. Reply "确认" to finalize or request changes.
```

**HARD STOP** — Wait for user confirmation.

## Step 4: Generate .module-design.md

**Output:** `{iteration_path}/01.product-requirement/.module-design.md`

**Complete format:**
```markdown
# Module Design

## ISA-95 Analysis Summary

### Domain Description
- **System Boundary**: [description]
- **Actors**: [list]
- **Domain Glossary**:
  | Term | Definition |
  |------|-----------|
  | [term] | [definition] |

### Domain Functions (WBS)
[WBS structure]

### Focus Functions (MoSCoW)
| Priority | Function | Rationale |
|----------|----------|-----------|
| Must | [fn] | [rationale] |
| Should | [fn] | [rationale] |
| Could | [fn] | [rationale] |

## Module List (Total: {N} modules)
| Module | Key | Scope | Key Entities | Owner Domain | Phase |
|--------|-----|-------|-------------|--------------|-------|
| [name] | [key] | [scope] | [entities] | [domain] | [1/2/3] |

## Dependency Matrix
| Source | Target | Type | Description |
|--------|--------|------|-------------|
| [A] | [B] | [type] | [desc] |

## Implementation Phases
- **Phase 1**: [foundation modules]
- **Phase 2**: [dependent modules]
- **Phase 3**: [independent modules]
```

**For simple requirements:** Include minimal sections (Domain Description + Module List with 1 module).

## Step 5: Update .checkpoints.json

> ⚠️ **MANDATORY: Use `update-progress.js` script for all JSON files.**

```bash
node speccrew-workspace/scripts/update-progress.js write-checkpoint \
  --file {iteration_path}/01.product-requirement/.checkpoints.json \
  --checkpoint requirement_modeling \
  --passed true
```

**Generated structure:**
```json
{
  "stage": "01_prd",
  "checkpoints": {
    "requirement_clarification": { ... },
    "requirement_modeling": {
      "passed": true,
      "confirmed_at": "2026-04-10T12:00:00.000Z",
      "description": "ISA-95 modeling and module decomposition completed",
      "module_design_file": ".module-design.md",
      "isa95_stages": {
        "domain_description": true,
        "functions_in_domain": true,
        "functions_of_interest": true
      },
      "module_count": 3,
      "implementation_phases": 3
    }
  }
}
```

## Step 6: Output Completion

```
✅ Requirement Modeling Complete

Module Design File: {path}/.module-design.md
Checkpoint File: {path}/.checkpoints.json

Summary:
- Complexity: [simple | complex]
- Modules: [count]
- Phases: [count]
- Dependencies: [count]

Next: Proceed to PRD generation.
```

---

# Output Checklist

- [ ] `.clarification-summary.md` verified (prerequisite)
- [ ] ISA-95 Stage 1 complete (Domain Description)
- [ ] Checkpoint A passed (domain boundary confirmed)
- [ ] ISA-95 Stage 2 complete (Functions in Domain)
- [ ] ISA-95 Stage 3 complete (Functions of Interest)
- [ ] Checkpoint B passed (MVP scope confirmed)
- [ ] Checkpoint C passed (complete analysis confirmed)
- [ ] Module list defined
- [ ] Dependency matrix created
- [ ] Implementation phases determined
- [ ] Module decomposition confirmed with user
- [ ] `.module-design.md` created
- [ ] `.checkpoints.json` updated via script

---

# Constraints

**Must do:**
- Verify `.clarification-summary.md` exists before starting
- Use 3 checkpoints (A/B/C) for progressive user confirmation
- Define clear module boundaries with minimal coupling
- Use `update-progress.js` for JSON files

**Must not do:**
- Skip user checkpoints in complex mode
- Include technical implementation details
- Create circular module dependencies
- Manually write JSON files
