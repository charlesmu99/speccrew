---
name: speccrew-deploy-smoke-test
description: Performs lightweight smoke testing against running application. Verifies core API endpoint reachability based on API Contract documents. Does NOT test business logic — only HTTP status code verification.
tools: Read, Bash, Glob
---

# Trigger Scenarios

- User requests to verify application is running correctly
- Deploy Agent needs to validate deployment success
- Post-deployment verification required

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
