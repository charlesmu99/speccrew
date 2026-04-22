---
name: speccrew-fd-api-contract
description: API Contract Generation SOP. Based on feature spec document, outputs structured frontend-backend API contract document. Once confirmed, the contract cannot be modified in downstream stages.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- Automatically triggered by speccrew-fd-feature-design Skill after feature spec document completion
- User requests "Generate API documentation" or "Define API contract"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
