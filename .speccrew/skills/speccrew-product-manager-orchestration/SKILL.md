---
name: speccrew-product-manager-orchestration
description: Product Manager core orchestration skill (pure routing layer v2.0), responsible for workflow resume routing and dispatch-to-worker scheduling for each Phase Skill. All business logic is executed by independent Phase Skills.
tools: Read, Write, Glob, Grep, Bash, Agent
---

# Trigger Scenarios

- Product Manager Agent starts the PRD workflow for a new user requirement
- User submits a requirement and needs PRD generation
- Workflow resume after Phase checkpoint (resume_target routing)

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
