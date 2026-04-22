---
name: speccrew-pm-requirement-clarify
description: SpecCrew PM Requirement Clarification Skill. Dual-mode support (simple/complex). Produces .clarification-summary.md as interface contract for downstream PRD generation. First step in PRD workflow.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- User provides initial requirement description
- PM Agent needs to clarify before PRD generation
- Requirement complexity assessment needed

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
