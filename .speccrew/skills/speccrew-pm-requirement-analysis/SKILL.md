---
name: speccrew-pm-requirement-analysis
description: SpecCrew PM PRD Generation Skill. Generates PRD documents from clarified requirements and module design. Produces Master PRD and Sub-PRD Dispatch Plan for downstream Feature Design. Third step in PRD workflow.
tools: Read, Write, Glob, Grep
---

# Skill Overview

PRD document generation from clarification and modeling artifacts. Produces Master PRD and Sub-PRD Dispatch Plan.

## Trigger Scenarios

- Modeling completed (`.module-design.md` exists)
- PRD document generation needed
- Feature breakdown and dispatch planning required

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `iteration_path` | string | Yes | Path to iteration directory |
| `clarification_file` | string | No | Path to clarification summary (default: `{iteration_path}/01.product-requirement/.clarification-summary.md`) |
| `module_design_file` | string | No | Path to module design (default: `{iteration_path}/01.product-requirement/.module-design.md`) |

## Methodology Foundation

Applies ISA-95 Stages 2-3 outputs for PRD generation:
- WBS decomposition → Section 3 Functional Requirements
- MoSCoW prioritization → Section 3.4 Feature Breakdown

## PM Stage Content Boundary

> **DO NOT INCLUDE:** API definitions, DB structures, code snippets, technical terminology.
> **These belong to:** Feature Designer or System Designer.
> **Required:** Use BUSINESS LANGUAGE only.

---

# AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

# Output Checklist

- [ ] Both prerequisite files verified
- [ ] PRD template loaded
- [ ] PRD structure determined (Single vs Master-Sub)
- [ ] All sections filled with business language only
- [ ] Feature Breakdown extracted with appropriate granularity
- [ ] Task granularity checked (completable in one iteration)
- [ ] File list confirmed with user
- [ ] Master PRD written to correct path
- [ ] [Master-Sub] Dispatch Plan generated
- [ ] [Master-Sub] Returned control to PM Agent

---

# Constraints

**Must do:**
- Verify both prerequisite files exist before starting
- Use business language only in all PRD content
- Use `search_replace` for section filling (not `create_file`)
- Include Feature Breakdown in every PRD/Sub-PRD
- Pass control to PM Agent after dispatch plan

**Must not do:**
- Include technical implementation details
- Generate Sub-PRD files directly (dispatch plan only)
- Skip user confirmation for file list
- Proceed without prerequisite files
