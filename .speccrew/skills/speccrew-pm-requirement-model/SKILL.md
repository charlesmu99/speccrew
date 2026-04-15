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

# AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

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
