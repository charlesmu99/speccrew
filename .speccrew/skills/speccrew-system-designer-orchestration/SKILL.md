---
name: speccrew-system-designer-orchestration
description: System Designer orchestration skill. Manages the complete system design workflow from stage gate checking through platform dispatch to joint confirmation. Coordinates framework evaluation, design overview generation, and parallel platform-specific design tasks across web, mobile, desktop platforms.
tools: Read, Write, Glob, Grep, Bash, Agent
---

# Trigger Scenarios

- System Designer Agent starts system design workflow
- Feature Spec and API Contract have been confirmed (02_feature_design stage = confirmed)
- User requests system design execution for confirmed features

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
