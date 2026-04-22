---
name: speccrew-dev-mobile
description: Mobile Development SOP. Guide System Developer Agent to implement mobile app code (Flutter/React Native) according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- System design documents confirmed, user requests mobile development
- User asks "Start mobile development", "Implement mobile app", "Write mobile code"
- System Developer Agent dispatches this skill with platform context (platform_id, techs paths)

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
