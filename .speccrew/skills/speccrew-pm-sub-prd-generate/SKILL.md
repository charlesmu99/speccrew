---
name: speccrew-pm-sub-prd-generate
description: Generate a single Sub-PRD document for one module. Used by PM Agent's worker dispatch to parallelize Sub-PRD generation across multiple modules. Each worker invocation generates one complete Sub-PRD file based on the PRD template.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- PM Agent dispatches worker to generate Sub-PRD for a specific module
- Worker receives module context from PM Agent's dispatch plan

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
