---
name: speccrew-dev-backend
description: Backend Development SOP. Guide System Developer Agent to implement backend code according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- Backend system design has been approved, user requests backend development
- User asks "Start backend development", "Implement backend code"
- System Developer Agent receives task to implement backend for a specific platform

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
