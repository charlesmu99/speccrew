---
name: speccrew-dev-frontend
description: Frontend Development SOP. Guide System Developer Agent to implement frontend code according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- System Developer Agent dispatches this skill with platform context
- System design confirmed, user requests frontend development
- User asks "Start frontend development" or "Implement frontend code"

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
