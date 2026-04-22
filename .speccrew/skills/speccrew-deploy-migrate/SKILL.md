---
name: speccrew-deploy-migrate
description: Executes database migration scripts using the project's migration tool. Validates migration results and reports affected tables.
tools: Read, Bash, Glob
---

# Trigger Scenarios

- User requests to run database migrations before deployment
- Deploy Agent needs to apply pending schema changes
- CI/CD pipeline requires database migration verification

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
