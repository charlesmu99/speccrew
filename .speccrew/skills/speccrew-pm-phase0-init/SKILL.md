---
name: speccrew-pm-phase0-init
description: SpecCrew PM Phase 0 Initialization Skill. Handles iteration directory creation, WORKFLOW-PROGRESS.json management, checkpoint recovery, IDE detection, and path initialization.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- PM Agent starts a new workflow session
- PM Agent needs to detect or create iteration directory
- PM Agent needs to check resume state from previous session

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
