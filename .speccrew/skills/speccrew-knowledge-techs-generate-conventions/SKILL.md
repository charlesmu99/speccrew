---
name: speccrew-knowledge-techs-generate-conventions
description: Generate technology convention documents (INDEX, tech-stack, architecture, conventions-*) for a specific platform using XML Block workflow. Extracts tech stack, architecture, and development conventions from configuration files and source code. Split from techs-generate for parallel execution with ui-style worker.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- "Generate convention documents for {platform}"
- "Create tech stack and architecture documentation"
- "Extract development conventions from {platform}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
