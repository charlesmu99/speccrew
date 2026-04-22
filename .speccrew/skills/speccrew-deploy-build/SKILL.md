---
name: speccrew-deploy-build
description: Executes application build commands based on techs knowledge conventions. Runs the build, verifies success, and reports build artifacts.
tools: Read, Bash, Glob
---

# Trigger Scenarios

- User requests to build the application before deployment
- Deploy Agent needs to verify the application compiles successfully
- CI/CD pipeline requires a build step verification

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
