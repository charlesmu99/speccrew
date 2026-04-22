---
name: speccrew-pm-phase5-subprd-dispatch
description: PM Phase 5 Sub-PRD Batch Dispatch Skill. Orchestration-layer skill executed directly by PM Agent. Dispatches Workers for parallel Sub-PRD generation across modules.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios
- PM Agent executes Phase 5 Sub-PRD batch dispatch
- Sub-PRD dispatch plan ready from Phase 4
- Parallel Worker dispatch needed for multi-module PRD generation

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
