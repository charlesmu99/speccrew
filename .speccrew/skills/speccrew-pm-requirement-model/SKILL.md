---
name: speccrew-pm-requirement-model
description: SpecCrew PM Requirement Modeling Skill. Applies ISA-95 Stages 1-3 for business domain analysis, WBS decomposition, and module ordering. Produces .module-design.md as interface contract.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- Clarification completed (.clarification-summary.md exists)
- Complex requirements requiring ISA-95 analysis
- Multi-module system requiring decomposition

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
