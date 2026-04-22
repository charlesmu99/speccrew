---
name: speccrew-deploy-startup
description: Starts the application in local/development environment and performs health check verification. Reports service URL and health status.
tools: Read, Bash
---

# Trigger Scenarios

- User requests to start the application for testing
- Deploy Agent needs to verify application startup
- Smoke test requires a running application instance

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
