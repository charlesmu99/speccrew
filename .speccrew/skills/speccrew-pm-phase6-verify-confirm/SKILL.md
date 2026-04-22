---
name: speccrew-pm-phase6-verify-confirm
description: SpecCrew PM Phase 6 Verification & Confirmation Skill. Performs file integrity validation, feature list completeness check, user review gate, and finalization.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- PRD generation completed, verification needed
- Sub-PRD dispatch completed, user review required
- Final status update after user confirmation

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
